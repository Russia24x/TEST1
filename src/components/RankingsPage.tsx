import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, Info, X, ExternalLink, Activity } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface RankingData { rank: number; name: string; symbol: string; score: number; price: number; marketCap: number; change90d: number; realYieldScore: number; scarcityScore: number; burnScore: number; maturityScore: number; tvlScore: number; trend: 'up' | 'down' | 'neutral'; geckoId: string; }

const mockRankings: RankingData[] = [
  { rank: 1, name: 'Ethereum', symbol: 'ETH', score: 87.3, price: 3420, marketCap: 412_000_000_000, change90d: 12.5, realYieldScore: 92, scarcityScore: 65, burnScore: 88, maturityScore: 95, tvlScore: 98, trend: 'up', geckoId: 'ethereum' },
  { rank: 2, name: 'Solana', symbol: 'SOL', score: 82.1, price: 178, marketCap: 82_000_000_000, change90d: 28.3, realYieldScore: 78, scarcityScore: 72, burnScore: 45, maturityScore: 75, tvlScore: 85, trend: 'up', geckoId: 'solana' },
  { rank: 3, name: 'Chainlink', symbol: 'LINK', score: 78.5, price: 18.2, marketCap: 11_000_000_000, change90d: 8.7, realYieldScore: 85, scarcityScore: 80, burnScore: 70, maturityScore: 82, tvlScore: 60, trend: 'up', geckoId: 'chainlink' },
  { rank: 4, name: 'Aave', symbol: 'AAVE', score: 76.2, price: 285, marketCap: 4_200_000_000, change90d: 15.2, realYieldScore: 90, scarcityScore: 88, burnScore: 82, maturityScore: 70, tvlScore: 75, trend: 'up', geckoId: 'aave' },
  { rank: 5, name: 'Maker', symbol: 'MKR', score: 74.8, price: 1650, marketCap: 1_500_000_000, change90d: -3.2, realYieldScore: 95, scarcityScore: 92, burnScore: 95, maturityScore: 88, tvlScore: 55, trend: 'down', geckoId: 'maker' },
  { rank: 6, name: 'Uniswap', symbol: 'UNI', score: 72.1, price: 12.8, marketCap: 7_700_000_000, change90d: 5.4, realYieldScore: 68, scarcityScore: 75, burnScore: 30, maturityScore: 80, tvlScore: 90, trend: 'neutral', geckoId: 'uniswap' },
  { rank: 7, name: 'Lido DAO', symbol: 'LDO', score: 70.5, price: 2.45, marketCap: 2_200_000_000, change90d: 18.9, realYieldScore: 82, scarcityScore: 70, burnScore: 25, maturityScore: 65, tvlScore: 92, trend: 'up', geckoId: 'lido-dao' },
  { rank: 8, name: 'Pendle', symbol: 'PENDLE', score: 68.9, price: 5.8, marketCap: 950_000_000, change90d: 42.1, realYieldScore: 75, scarcityScore: 68, burnScore: 60, maturityScore: 55, tvlScore: 78, trend: 'up', geckoId: 'pendle' },
  { rank: 9, name: 'GMX', symbol: 'GMX', score: 67.3, price: 38.5, marketCap: 380_000_000, change90d: -8.5, realYieldScore: 88, scarcityScore: 85, burnScore: 78, maturityScore: 50, tvlScore: 62, trend: 'down', geckoId: 'gmx' },
  { rank: 10, name: 'Jupiter', symbol: 'JUP', score: 65.8, price: 1.12, marketCap: 1_500_000_000, change90d: 35.6, realYieldScore: 60, scarcityScore: 65, burnScore: 40, maturityScore: 45, tvlScore: 82, trend: 'up', geckoId: 'jupiter-exchange-solana' },
  { rank: 11, name: 'Raydium', symbol: 'RAY', score: 64.2, price: 3.85, marketCap: 1_020_000_000, change90d: 22.4, realYieldScore: 72, scarcityScore: 60, burnScore: 55, maturityScore: 48, tvlScore: 75, trend: 'up', geckoId: 'raydium' },
  { rank: 12, name: 'SushiSwap', symbol: 'SUSHI', score: 62.7, price: 1.45, marketCap: 250_000_000, change90d: -12.3, realYieldScore: 78, scarcityScore: 72, burnScore: 65, maturityScore: 60, tvlScore: 45, trend: 'down', geckoId: 'sushi' },
  { rank: 13, name: 'Convex', symbol: 'CVX', score: 61.1, price: 8.2, marketCap: 580_000_000, change90d: 6.8, realYieldScore: 80, scarcityScore: 78, burnScore: 72, maturityScore: 55, tvlScore: 50, trend: 'neutral', geckoId: 'convex-finance' },
  { rank: 14, name: 'Curve DAO', symbol: 'CRV', score: 59.8, price: 0.72, marketCap: 920_000_000, change90d: -5.1, realYieldScore: 70, scarcityScore: 65, burnScore: 35, maturityScore: 72, tvlScore: 68, trend: 'down', geckoId: 'curve-dao-token' },
  { rank: 15, name: 'Synthetix', symbol: 'SNX', score: 58.3, price: 3.15, marketCap: 350_000_000, change90d: 14.2, realYieldScore: 75, scarcityScore: 70, burnScore: 50, maturityScore: 62, tvlScore: 55, trend: 'up', geckoId: 'havven' },
  { rank: 16, name: 'dYdX', symbol: 'DYDX', score: 56.9, price: 2.8, marketCap: 420_000_000, change90d: 9.5, realYieldScore: 65, scarcityScore: 72, burnScore: 45, maturityScore: 58, tvlScore: 60, trend: 'neutral', geckoId: 'dydx-chain' },
  { rank: 17, name: 'Balancer', symbol: 'BAL', score: 55.4, price: 4.2, marketCap: 180_000_000, change90d: -2.8, realYieldScore: 72, scarcityScore: 68, burnScore: 55, maturityScore: 55, tvlScore: 48, trend: 'down', geckoId: 'balancer' },
  { rank: 18, name: 'PancakeSwap', symbol: 'CAKE', score: 54.1, price: 2.95, marketCap: 750_000_000, change90d: 11.3, realYieldScore: 60, scarcityScore: 55, burnScore: 70, maturityScore: 65, tvlScore: 70, trend: 'up', geckoId: 'pancakeswap-token' },
  { rank: 19, name: 'Velodrome', symbol: 'VELO', score: 52.8, price: 0.18, marketCap: 150_000_000, change90d: 25.7, realYieldScore: 68, scarcityScore: 58, burnScore: 42, maturityScore: 40, tvlScore: 65, trend: 'up', geckoId: 'velodrome-finance' },
  { rank: 20, name: 'Rocket Pool', symbol: 'RPL', score: 51.3, price: 18.5, marketCap: 380_000_000, change90d: 7.2, realYieldScore: 75, scarcityScore: 80, burnScore: 38, maturityScore: 52, tvlScore: 45, trend: 'neutral', geckoId: 'rocket-pool' },
  { rank: 21, name: 'Frax', symbol: 'FXS', score: 49.8, price: 5.4, marketCap: 450_000_000, change90d: -9.8, realYieldScore: 70, scarcityScore: 65, burnScore: 60, maturityScore: 48, tvlScore: 52, trend: 'down', geckoId: 'frax-share' },
  { rank: 22, name: 'Yearn', symbol: 'YFI', score: 48.2, price: 8200, marketCap: 280_000_000, change90d: 3.5, realYieldScore: 72, scarcityScore: 90, burnScore: 48, maturityScore: 68, tvlScore: 35, trend: 'neutral', geckoId: 'yearn-finance' },
  { rank: 23, name: '1inch', symbol: '1INCH', score: 46.7, price: 0.48, marketCap: 520_000_000, change90d: -6.2, realYieldScore: 55, scarcityScore: 60, burnScore: 45, maturityScore: 55, tvlScore: 50, trend: 'down', geckoId: '1inch' },
  { rank: 24, name: 'Orca', symbol: 'ORCA', score: 45.1, price: 1.85, marketCap: 120_000_000, change90d: 19.8, realYieldScore: 58, scarcityScore: 55, burnScore: 35, maturityScore: 38, tvlScore: 62, trend: 'up', geckoId: 'orca' },
  { rank: 25, name: 'Marinade', symbol: 'MNDE', score: 43.5, price: 0.12, marketCap: 95_000_000, change90d: 31.2, realYieldScore: 62, scarcityScore: 50, burnScore: 30, maturityScore: 35, tvlScore: 70, trend: 'up', geckoId: 'marinade' },
];

export function RankingsPage() {
  const { t } = useI18n();
  const [selectedRow, setSelectedRow] = useState<RankingData | null>(null);
  const formatNumber = (num: number) => { if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`; if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`; if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`; return `$${num.toFixed(2)}`; };
  const getTrendIcon = (trend: string) => { switch (trend) { case 'up': return <TrendingUp className="w-4 h-4 text-accent-emerald" />; case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />; default: return <Minus className="w-4 h-4 text-text-muted" />; } };
  const getScoreColor = (score: number) => { if (score >= 80) return 'text-accent-emerald'; if (score >= 60) return 'text-accent-gold'; if (score >= 40) return 'text-orange-400'; return 'text-red-400'; };

  return (
    <div className="min-h-screen px-3 sm:px-6 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-accent-gold/3 blur-[150px]" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-4xl font-black text-text-primary mb-3">{t('rankings.title')}</h1>
          <span className="text-text-secondary text-sm sm:text-base">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 sm:mb-10">
          {[mockRankings[0], mockRankings[1], mockRankings[2]].map((item, idx) => (
            <motion.div key={item.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }} whileHover={{ scale: 1.02, y: -4 }}
              className={`relative p-5 sm:p-6 rounded-2xl border cursor-pointer transition-all ${idx === 0 ? 'border-accent-gold/30 bg-gradient-to-br from-accent-gold/10 to-transparent shadow-[0_0_40px_rgba(240,185,11,0.1)]' : 'border-surface-700/50 bg-surface-800/30'}`} onClick={() => setSelectedRow(item)}>
              {idx === 0 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent-gold text-surface-900 text-xs font-bold whitespace-nowrap">{t('rankings.firstPlace')}</div>}
              <div className="flex items-center justify-between mb-3">
                <div><p className="text-xs text-text-muted">#{item.rank}</p><h3 className="text-lg sm:text-xl font-bold text-text-primary">{item.name}</h3><p className="text-sm text-text-muted">{item.symbol}</p></div>
                <div className="text-left"><p className={`text-2xl sm:text-3xl font-black ${getScoreColor(item.score)}`}>{item.score.toFixed(1)}</p><p className="text-xs text-text-muted">{t('rankings.totalScore')}</p></div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-text-secondary">{formatNumber(item.price)}</span>
                <span className={`flex items-center gap-1 ${item.change90d >= 0 ? 'text-accent-emerald' : 'text-red-400'}`}>{getTrendIcon(item.trend)}{item.change90d >= 0 ? '+' : ''}{item.change90d.toFixed(1)}%</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="border-gradient rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-surface-700/50">
                <th className="text-right py-3 sm:py-4 px-3 sm:px-4 text-xs font-bold text-text-muted uppercase tracking-wider">{t('rankings.rank')}</th>
                <th className="text-right py-3 sm:py-4 px-3 sm:px-4 text-xs font-bold text-text-muted uppercase tracking-wider">{t('rankings.asset')}</th>
                <th className="text-right py-3 sm:py-4 px-3 sm:px-4 text-xs font-bold text-text-muted uppercase tracking-wider">{t('rankings.score')}</th>
                <th className="text-right py-3 sm:py-4 px-3 sm:px-4 text-xs font-bold text-text-muted uppercase tracking-wider hidden sm:table-cell">{t('rankings.price')}</th>
                <th className="text-right py-3 sm:py-4 px-3 sm:px-4 text-xs font-bold text-text-muted uppercase tracking-wider hidden md:table-cell">{t('rankings.marketCap')}</th>
                <th className="text-right py-3 sm:py-4 px-3 sm:px-4 text-xs font-bold text-text-muted uppercase tracking-wider hidden lg:table-cell">{t('rankings.change90d')}</th>
                <th className="text-right py-3 sm:py-4 px-3 sm:px-4 text-xs font-bold text-text-muted uppercase tracking-wider">{t('rankings.trend')}</th>
              </tr></thead>
              <tbody>
                {mockRankings.map((item, idx) => (
                  <motion.tr key={item.rank} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + idx * 0.02 }} className="border-b border-surface-800/50 hover:bg-surface-800/30 cursor-pointer transition-colors" onClick={() => setSelectedRow(item)}>
                    <td className="py-3 px-3 sm:px-4 text-sm text-text-muted font-mono">{item.rank}</td>
                    <td className="py-3 px-3 sm:px-4"><div><p className="font-bold text-text-primary text-sm">{item.name}</p><p className="text-xs text-text-muted">{item.symbol}</p></div></td>
                    <td className="py-3 px-3 sm:px-4"><span className={`font-bold text-sm ${getScoreColor(item.score)}`}>{item.score.toFixed(1)}</span></td>
                    <td className="py-3 px-3 sm:px-4 text-sm text-text-secondary hidden sm:table-cell">{formatNumber(item.price)}</td>
                    <td className="py-3 px-3 sm:px-4 text-sm text-text-secondary hidden md:table-cell">{formatNumber(item.marketCap)}</td>
                    <td className="py-3 px-3 sm:px-4 hidden lg:table-cell"><span className={`text-sm flex items-center gap-1 ${item.change90d >= 0 ? 'text-accent-emerald' : 'text-red-400'}`}>{item.change90d >= 0 ? '+' : ''}{item.change90d.toFixed(1)}%</span></td>
                    <td className="py-3 px-3 sm:px-4">{getTrendIcon(item.trend)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-6 text-center">
          <p className="text-xs text-text-muted flex items-center justify-center gap-2"><Info className="w-3 h-3" />{t('rankings.dataSource')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} className="mt-8 border-gradient rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-bold text-text-primary mb-4 text-center flex items-center justify-center gap-2"><Activity className="w-4 h-4 text-accent-emerald" />{t('rankings.systemStatus')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatusItem label={t('rankings.infrastructure')} value="Cloudflare Workers" status="active" />
            <StatusItem label={t('rankings.dataSources')} value="CoinGecko + DefiLlama" status="active" />
            <StatusItem label={t('rankings.paymentProtocol')} value="x402 Protocol" status="active" />
            <StatusItem label={t('rankings.storage')} value="KV" status="active" />
          </div>
          <div className="mt-4 pt-4 border-t border-surface-700/30">
            <div className="flex items-center justify-center gap-4 text-xs text-text-muted flex-wrap">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse-glow" />{t('rankings.allSystemsActive')}</span>
              <span className="hidden sm:inline">•</span>
              <span>{t('rankings.nextUpdate')}</span>
            </div>
          </div>
        </motion.div>
      </div>
      <AnimatePresence>
        {selectedRow && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedRow(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-lg border-gradient rounded-2xl p-5 sm:p-6 bg-surface-900 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div><h2 className="text-xl sm:text-2xl font-bold text-text-primary">{selectedRow.name}</h2><p className="text-text-muted">{selectedRow.symbol}</p></div>
                <button onClick={() => setSelectedRow(null)} className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center hover:bg-surface-600 transition-colors"><X className="w-4 h-4 text-text-primary" /></button>
              </div>
              <div className="text-center mb-6 p-4 rounded-xl bg-surface-800/50">
                <p className={`text-4xl sm:text-5xl font-black ${getScoreColor(selectedRow.score)}`}>{selectedRow.score.toFixed(1)}</p>
                <p className="text-sm text-text-muted mt-1">{t('rankings.holderValueScore')}</p>
              </div>
              <div className="space-y-3 mb-6">
                <SubScoreBar label={t('rankings.realYield')} score={selectedRow.realYieldScore} weight={30} />
                <SubScoreBar label={t('rankings.scarcity')} score={selectedRow.scarcityScore} weight={20} />
                <SubScoreBar label={t('rankings.burn')} score={selectedRow.burnScore} weight={20} />
                <SubScoreBar label={t('rankings.maturity')} score={selectedRow.maturityScore} weight={15} />
                <SubScoreBar label={t('rankings.tvl')} score={selectedRow.tvlScore} weight={15} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-lg bg-surface-800/50"><p className="text-xs text-text-muted">{t('rankings.price')}</p><p className="font-bold text-text-primary">{formatNumber(selectedRow.price)}</p></div>
                <div className="p-3 rounded-lg bg-surface-800/50"><p className="text-xs text-text-muted">{t('rankings.marketCap')}</p><p className="font-bold text-text-primary">{formatNumber(selectedRow.marketCap)}</p></div>
                <div className="p-3 rounded-lg bg-surface-800/50"><p className="text-xs text-text-muted">{t('rankings.change90d')}</p><p className={`font-bold ${selectedRow.change90d >= 0 ? 'text-accent-emerald' : 'text-red-400'}`}>{selectedRow.change90d >= 0 ? '+' : ''}{selectedRow.change90d.toFixed(1)}%</p></div>
                <div className="p-3 rounded-lg bg-surface-800/50"><p className="text-xs text-text-muted">{t('rankings.rank')}</p><p className="font-bold text-text-primary">#{selectedRow.rank}</p></div>
              </div>
              <a href={`https://www.coingecko.com/en/coins/${selectedRow.geckoId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-surface-700 hover:bg-surface-600 transition-colors text-text-primary font-medium text-sm">
                <ExternalLink className="w-4 h-4" />{t('rankings.viewOnCoinGecko')}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const { t } = useI18n();
  const getColor = (s: number) => { if (s >= 80) return 'bg-accent-emerald'; if (s >= 60) return 'bg-accent-gold'; if (s >= 40) return 'bg-orange-400'; return 'bg-red-400'; };
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs sm:text-sm text-text-secondary">{label}</span>
        <div className="flex items-center gap-2"><span className="text-xs text-text-muted">{t('rankings.weight')}: {weight}%</span><span className="text-sm font-bold text-text-primary">{score}</span></div>
      </div>
      <div className="h-2 rounded-full bg-surface-700 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, delay: 0.2 }} className={`h-full rounded-full ${getColor(score)}`} />
      </div>
    </div>
  );
}

function StatusItem({ label, value, status }: { label: string; value: string; status: 'active' | 'warning' | 'error' }) {
  const statusColor = status === 'active' ? 'bg-accent-emerald' : status === 'warning' ? 'bg-orange-400' : 'bg-red-400';
  return (
    <div className="p-3 rounded-lg bg-surface-800/50 text-center">
      <div className="flex items-center justify-center gap-1 mb-1"><div className={`w-1.5 h-1.5 rounded-full ${statusColor} ${status === 'active' ? 'animate-pulse-glow' : ''}`} /><p className="text-xs text-text-muted">{label}</p></div>
      <p className="text-xs font-bold text-text-primary">{value}</p>
    </div>
  );
}
