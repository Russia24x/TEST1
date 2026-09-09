import { motion } from 'framer-motion';
import { ArrowRight, Database, Shield, Clock, Check } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface MethodologyPageProps { onBack: () => void; }

export function MethodologyPage({ onBack }: MethodologyPageProps) {
  const { t } = useI18n();
  const criteria = [
    { nameKey: 'method.criteria1Name', weight: 30, source: 'DefiLlama', field: 'dailyHoldersRevenue', descKey: 'method.criteria1Desc', color: 'from-accent-emerald to-emerald-600' },
    { nameKey: 'method.criteria2Name', weight: 20, source: 'CoinGecko', field: 'circulating_supply / max_supply', descKey: 'method.criteria2Desc', color: 'from-accent-purple to-purple-600' },
    { nameKey: 'method.criteria3Name', weight: 20, source: 'DefiLlama', field: 'buyback & burn data', descKey: 'method.criteria3Desc', color: 'from-accent-gold to-yellow-600' },
    { nameKey: 'method.criteria4Name', weight: 15, source: 'CoinGecko', field: 'price_change_90d + market_cap_rank', descKey: 'method.criteria4Desc', color: 'from-blue-400 to-blue-600' },
    { nameKey: 'method.criteria5Name', weight: 15, source: 'DefiLlama', field: 'tvl', descKey: 'method.criteria5Desc', color: 'from-orange-400 to-orange-600' },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-gold/3 blur-[120px]" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={onBack} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8">
          <ArrowRight className="w-4 h-4" /><span className="text-sm">{t('method.back')}</span>
        </motion.button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-black text-text-primary mb-4">{t('method.title')}</h1>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">{t('method.subtitle')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border-gradient rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4 text-center">{t('method.formulaTitle')}</h2>
          <div className="bg-surface-900 rounded-xl p-4 text-center font-mono text-sm text-text-secondary overflow-x-auto" dir="ltr">
            <p className="text-accent-gold font-bold mb-2">{t('method.formula')}</p>
            <p className="text-xs sm:text-sm">0.30 × RealYield + 0.20 × Scarcity + 0.20 × Burn + 0.15 × Maturity + 0.15 × TVL</p>
            <p className="text-text-muted mt-3 text-xs">{t('method.formulaNote')}</p>
          </div>
        </motion.div>
        <div className="space-y-4 mb-10 sm:mb-12">
          {criteria.map((criterion, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + idx * 0.1 }} className="border-gradient rounded-2xl p-5 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${criterion.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-black text-base sm:text-lg">{criterion.weight}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1">{t(criterion.nameKey)}</h3>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded bg-surface-700 text-text-muted">{t('method.source')}: {criterion.source}</span>
                    <span className="text-xs text-text-muted font-mono truncate" dir="ltr">{criterion.field}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{t(criterion.descKey)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="border-gradient rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4">{t('method.pipelineTitle')}</h2>
          <div className="space-y-4">
            <PipelineStep step={1} title={t('method.pipeline1Title')} description={t('method.pipeline1Desc')} icon={<Database className="w-5 h-5 text-accent-emerald" />} />
            <PipelineStep step={2} title={t('method.pipeline2Title')} description={t('method.pipeline2Desc')} icon={<Database className="w-5 h-5 text-accent-purple" />} />
            <PipelineStep step={3} title={t('method.pipeline3Title')} description={t('method.pipeline3Desc')} icon={<Shield className="w-5 h-5 text-accent-gold" />} />
            <PipelineStep step={4} title={t('method.pipeline4Title')} description={t('method.pipeline4Desc')} icon={<Clock className="w-5 h-5 text-blue-400" />} />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="border-gradient rounded-2xl p-5 sm:p-6 mb-8 sm:mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-accent-emerald" />{t('method.securityTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['method.security1', 'method.security2', 'method.security3', 'method.security4', 'method.security5', 'method.security6', 'method.security7', 'method.security8'].map((key, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-surface-800/30"><Check className="w-4 h-4 text-accent-emerald flex-shrink-0" /><span className="text-xs text-text-secondary">{t(key)}</span></div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="text-center">
          <p className="text-sm text-text-muted">{t('method.sources')}{' '}<a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline">CoinGecko</a>{' · '}<a href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline">DefiLlama</a></p>
          <p className="text-xs text-text-muted mt-2">{t('method.sourcesNote')}</p>
        </motion.div>
      </div>
    </div>
  );
}

function PipelineStep({ step, title, description, icon }: { step: number; title: string; description: string; icon: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-text-muted">{t('method.stage')} {step}</span><h4 className="font-bold text-text-primary text-sm">{title}</h4></div>
        <p className="text-xs sm:text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
