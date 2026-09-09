# 🏆 Holder Value Ranking

Daily ranking of top 25 cryptocurrencies based on composite "Holder Value Score". Access requires $1 payment via x402 protocol on Abstract or Solana networks.

## 🚀 Quick Deploy (2 minutes)

```bash
npm install
npm run build
./deploy.sh
```

**That's it!** 🎉

## 📁 Project Structure

```
├── src/                    # Frontend (React + Vite)
│   ├── components/         # 9 React components
│   ├── context/            # 3 Contexts (wallet, payment, profile)
│   ├── i18n/               # 10 languages
│   └── App.tsx             # Main app
├── worker/                 # Backend (Cloudflare Worker)
│   └── index.ts            # API + Cron + Sessions
├── dist/                   # Built frontend
├── wrangler.toml           # Cloudflare config
└── deploy.sh               # Auto-deploy script
```

## 💳 Payment Methods

### Abstract (Chain ID: 2741)
| Asset | Contract | Notes |
|-------|----------|-------|
| USDC | `0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1` | Direct (ERC-3009) |
| WETH | `0x3439153EB7AF838Ad19d56E1571FBD09333C2809` | Wrap ETH first |
| PENGU | `0x9eBe3A824Ca958e4b3Da772D2065518F009CBa62` | Permit2 approval |

### Solana
| Asset | Contract | Notes |
|-------|----------|-------|
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | Needs ATA |
| WSOL | `So11111111111111111111111111111111111111112` | Wrap SOL first |
| PENGU | `2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv` | Needs ATA |

## 📊 Scoring Formula

```
Score = 0.30 × RealYield + 0.20 × Scarcity + 0.20 × Burn + 0.15 × Maturity + 0.15 × TVL
```

| Criterion | Weight | Source |
|-----------|--------|--------|
| Real Yield & Holder Share | 30% | DefiLlama |
| Scarcity & Emission | 20% | CoinGecko |
| Buyback & Burn | 20% | DefiLlama |
| Store of Value & Maturity | 15% | CoinGecko |
| Ecosystem Size (TVL) | 15% | DefiLlama |

## 🌐 10 Languages

🇺🇸 English · 🇮🇷 فارسی · 🇸🇦 العربية · 🇨🇳 中文 · 🇹🇷 Türkçe · 🇷🇺 Русский · 🇪🇸 Español · 🇫🇷 Français · 🇩🇪 Deutsch · 🇯🇵 日本語

## 💰 Costs

**$0/month** - Cloudflare Workers free tier is sufficient:
- 100,000 requests/day
- 1GB KV storage
- No credit card required

## 🔧 Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
./deploy.sh          # Deploy to Cloudflare
wrangler tail        # View logs
wrangler secret put  # Set secrets
```

## 🔐 Security

✅ No ranking data in static bundle  
✅ On-chain payment verification  
✅ HMAC-signed sessions (24h expiry)  
✅ Payment replay protection  
✅ Treasury owner verification  
✅ Rate limiting  

## 📚 Links

- [Abstract Docs](https://docs.abs.xyz)
- [x402 Protocol](https://docs.x402.org)
- [CoinGecko API](https://www.coingecko.com/api/documentation)
- [DefiLlama API](https://defillama.com/docs/api)

## 📄 License

MIT
