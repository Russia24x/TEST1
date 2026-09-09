/**
 * Holder Value Ranking - Cloudflare Worker
 * Single Worker serving frontend + API + Cron jobs
 */

interface Env {
  KV: KVNamespace;
  ASSETS: Fetcher;
  HMAC_SECRET: string;
  SOLANA_FEE_PAYER: string;
  TREASURY_ABSTRACT: string;
  TREASURY_SOLANA: string;
  ENVIRONMENT: string;
}

const SESSION_DURATION = 86400; // 24 hours in seconds

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    // API routes
    if (path.startsWith('/api/')) return handleApiRequest(request, env, corsHeaders);

    // Serve static assets
    return env.ASSETS.fetch(request);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Running daily ranking update...');
    try {
      const budgetKey = `api-budget:${new Date().toISOString().slice(0, 7)}`;
      const budget = parseInt(await env.KV.get(budgetKey) || '0');
      if (budget >= 9500) { console.log('API budget nearly exhausted'); return; }

      const rankings = await fetchRankingsData();
      if (rankings && rankings.length > 0) {
        await env.KV.put('rankings:latest', JSON.stringify(rankings));
        await env.KV.put('rankings:timestamp', new Date().toISOString());
        await env.KV.put(budgetKey, (budget + 5).toString());
        console.log(`Updated rankings with ${rankings.length} assets`);
      }
    } catch (error) { console.error('Cron job failed:', error); }
  },
};

async function handleApiRequest(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path === '/api/unlock' && request.method === 'POST') return handlePayment(request, env, corsHeaders);
    if (path === '/api/rankings' && request.method === 'GET') return handleGetRankings(request, env, corsHeaders);
    if (path === '/api/verify-treasury' && request.method === 'POST') return handleVerifyTreasury(request, env, corsHeaders);
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API error:', error);
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders });
  }
}

async function handlePayment(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const body = await request.json() as any;
  const { txHash, network } = body;
  if (!txHash || !network) return new Response('Missing required fields', { status: 400, headers: corsHeaders });

  const paymentKey = `used-payments:${txHash}`;
  if (await env.KV.get(paymentKey)) return new Response('Payment already used', { status: 400, headers: corsHeaders });

  await env.KV.put(paymentKey, 'used', { expirationTtl: SESSION_DURATION * 7 });
  const sessionToken = await createSessionToken(txHash, env);
  const headers = new Headers(corsHeaders);
  headers.append('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION}; Path=/`);
  headers.append('Content-Type', 'application/json');

  return new Response(JSON.stringify({ success: true, sessionExpiry: Date.now() + SESSION_DURATION * 1000 }), { headers });
}

async function handleGetRankings(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const sessionToken = getSessionFromRequest(request);
  if (!sessionToken) return new Response('Unauthorized', { status: 401, headers: corsHeaders });

  const isValid = await verifySessionToken(sessionToken, env);
  if (!isValid) return new Response('Invalid or expired session', { status: 401, headers: corsHeaders });

  const rankings = await env.KV.get('rankings:latest');
  const timestamp = await env.KV.get('rankings:timestamp');
  if (!rankings) return new Response('Rankings not available', { status: 503, headers: corsHeaders });

  const headers = new Headers(corsHeaders);
  headers.append('Content-Type', 'application/json');
  return new Response(JSON.stringify({ rankings: JSON.parse(rankings), timestamp, stale: isStaleData(timestamp) }), { headers });
}

async function handleVerifyTreasury(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const body = await request.json() as any;
  const { address, signature, message } = body;
  if (!address || !signature || !message) return new Response('Missing required fields', { status: 400, headers: corsHeaders });

  const isTreasury = address.toLowerCase() === env.TREASURY_ABSTRACT.toLowerCase() || address === env.TREASURY_SOLANA;
  if (!isTreasury) return new Response('Not a treasury owner', { status: 403, headers: corsHeaders });

  const sessionToken = await createSessionToken(`treasury:${address}`, env);
  const headers = new Headers(corsHeaders);
  headers.append('Set-Cookie', `session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION}; Path=/`);
  headers.append('Content-Type', 'application/json');

  return new Response(JSON.stringify({ success: true, isTreasuryOwner: true, sessionExpiry: Date.now() + SESSION_DURATION * 1000 }), { headers });
}

async function fetchRankingsData(): Promise<any[] | null> {
  try {
    const coingeckoResponse = await fetchWithRetry('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=90d');
    if (!coingeckoResponse.ok) return null;
    const coins = await coingeckoResponse.json();

    const defillamaResponse = await fetchWithRetry('https://api.llama.fi/protocols');
    if (!defillamaResponse.ok) return null;
    const protocols = await defillamaResponse.json();

    const feesResponse = await fetchWithRetry('https://api.llama.fi/overview/fees?dataType=dailyHoldersRevenue');
    const feesData = feesResponse.ok ? await feesResponse.json() : null;

    const rankings = calculateRankings(coins, protocols, feesData);
    return rankings.slice(0, 25);
  } catch (error) { console.error('Failed to fetch rankings:', error); return null; }
}

function calculateRankings(coins: any[], protocols: any[], feesData: any): any[] {
  const protocolMap = new Map<string, any>();
  for (const protocol of protocols) if (protocol.gecko_id) protocolMap.set(protocol.gecko_id, protocol);

  const feesMap = new Map<string, number>();
  if (feesData?.protocols) for (const fee of feesData.protocols) feesMap.set(fee.name, fee.dailyHoldersRevenue || 0);

  const scoredCoins = coins.map((coin, index) => {
    const protocol = protocolMap.get(coin.id);
    const dailyRevenue = feesMap.get(coin.id) || 0;
    const realYieldScore = protocol && coin.market_cap > 0 ? Math.min(100, (dailyRevenue * 365) / coin.market_cap * 10000) : 0;
    const scarcityScore = coin.max_supply && coin.circulating_supply ? (coin.circulating_supply / coin.max_supply) * 100 : 50;
    const burnScore = protocol?.buybackAndBurn ? 80 : 30;
    const maturityScore = Math.max(0, 100 - Math.abs(coin.price_change_percentage_90d_in_currency || 0));
    const tvlScore = protocol?.tvl ? Math.min(100, Math.log10(protocol.tvl) * 10) : 0;
    const score = realYieldScore * 0.30 + scarcityScore * 0.20 + burnScore * 0.20 + maturityScore * 0.15 + tvlScore * 0.15;

    return {
      rank: index + 1, name: coin.name, symbol: coin.symbol.toUpperCase(),
      score: Math.round(score * 10) / 10, price: coin.current_price, marketCap: coin.market_cap,
      change90d: coin.price_change_percentage_90d_in_currency || 0,
      realYieldScore: Math.round(realYieldScore), scarcityScore: Math.round(scarcityScore),
      burnScore: Math.round(burnScore), maturityScore: Math.round(maturityScore), tvlScore: Math.round(tvlScore),
      trend: (coin.price_change_percentage_90d_in_currency || 0) > 0 ? 'up' : (coin.price_change_percentage_90d_in_currency || 0) < 0 ? 'down' : 'neutral',
      geckoId: coin.id,
    };
  });

  scoredCoins.sort((a, b) => b.score - a.score);
  return scoredCoins.map((coin, index) => ({ ...coin, rank: index + 1 }));
}

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status !== 429) return response;
      if (i < retries) await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    } catch (error) { if (i === retries) throw error; await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); }
  }
  throw new Error('Max retries exceeded');
}

async function createSessionToken(payload: string, env: Env): Promise<string> {
  const data = JSON.stringify({ payload, expiry: Date.now() + SESSION_DURATION * 1000 });
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.HMAC_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  return btoa(data) + '.' + signatureHex;
}

async function verifySessionToken(token: string, env: Env): Promise<boolean> {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;
    const data = atob(payloadB64);
    const payload = JSON.parse(data);
    if (payload.expiry < Date.now()) return false;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(env.HMAC_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const signatureBytes = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    return await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(data));
  } catch { return false; }
}

function getSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) { const [name, value] = cookie.split('='); if (name === 'session') return value; }
  return null;
}

function isStaleData(timestamp: string | null): boolean {
  if (!timestamp) return true;
  return Date.now() - new Date(timestamp).getTime() > 25 * 60 * 60 * 1000;
}
