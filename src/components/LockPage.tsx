import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, Lock, Wallet, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useWallet } from '../context/WalletContext';

interface LockPageProps { onConnect: () => void; }

export function LockPage({ onConnect }: LockPageProps) {
  const { t } = useI18n();
  const { wallet, connectAbstract, connectSolana } = useWallet();

  const paymentOptions = [
    { network: 'Solana', asset: 'SOL (WSOL)', note: t('lock.solNote') },
    { network: 'Solana', asset: 'PENGU', note: t('lock.penguNote') },
    { network: 'Solana', asset: 'USDC', note: t('lock.usdcNote') },
    { network: 'Abstract', asset: 'ETH (WETH)', note: t('lock.wethNote') },
    { network: 'Abstract', asset: 'PENGU', note: t('lock.permit2Note') },
    { network: 'Abstract', asset: 'USDC', note: t('lock.directNote') },
  ];

  const handleConnect = async (type: 'abstract' | 'solana') => {
    try {
      if (type === 'abstract') await connectAbstract();
      else await connectSolana();
      onConnect();
    } catch (error) { console.error('Connection failed:', error); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-gold/5 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-accent-purple/5 blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
      <div className="text-center max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-gold/10 border border-accent-gold/20 mb-8">
          <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse-glow" />
          <span className="text-sm text-accent-gold font-medium">{t('lock.dailyUpdate')}</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-6">
          <span className="text-text-primary">{t('lock.title1')}</span><br />
          <span className="text-gradient-gold">{t('lock.title2')}</span><br />
          <span className="text-text-primary">{t('lock.title3')}</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="text-lg sm:text-xl text-text-secondary leading-relaxed mb-12 max-w-2xl mx-auto">{t('lock.subtitle')}</motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleConnect('abstract')} disabled={wallet.status === 'connecting'}
            className="group relative inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-accent-purple to-purple-700 text-white font-bold text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
            {wallet.status === 'connecting' && wallet.type === 'abstract' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wallet className="w-5 h-5" />}
            <span>{t('lock.connectAGW')}</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleConnect('solana')} disabled={wallet.status === 'connecting'}
            className="group relative inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-accent-emerald to-emerald-700 text-white font-bold text-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
            {wallet.status === 'connecting' && wallet.type === 'solana' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wallet className="w-5 h-5" />}
            <span>{t('lock.connectSolana')}</span>
          </motion.button>
        </motion.div>
        {wallet.status === 'connected' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
            <span className="text-sm text-accent-emerald">{t('lock.connected')}: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</span>
          </motion.div>
        )}
        {wallet.status === 'error' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400">{t('lock.connectionFailed')}</span>
          </motion.div>
        )}
        <p className="text-sm text-text-muted">{t('lock.priceInfo')}</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }} className="mt-16 w-full max-w-4xl mx-auto">
        <div className="border-gradient p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-5"><Info className="w-5 h-5 text-accent-gold" /><h3 className="text-lg font-bold text-text-primary">{t('lock.paymentMethods')}</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paymentOptions.map((option, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 + idx * 0.05 }} className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/30">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${option.network === 'Solana' ? 'bg-accent-emerald' : 'bg-accent-purple'}`} />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-accent-gold bg-accent-gold/10 px-1.5 py-0.5 rounded">{option.network}</span>
                    <span className="text-sm text-text-primary font-semibold">{option.asset}</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">{option.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-4 text-center">{t('lock.prepNote')}</p>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.6 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12 w-full">
        <FeatureCard icon={<Shield className="w-6 h-6 text-accent-emerald" />} title={t('lock.feature1Title')} description={t('lock.feature1Desc')} />
        <FeatureCard icon={<Zap className="w-6 h-6 text-accent-purple" />} title={t('lock.feature2Title')} description={t('lock.feature2Desc')} />
        <FeatureCard icon={<TrendingUp className="w-6 h-6 text-accent-gold" />} title={t('lock.feature3Title')} description={t('lock.feature3Desc')} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.6 }} className="mt-16 w-full max-w-4xl mx-auto">
        <div className="border-gradient p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-text-primary mb-6 text-center">{t('lock.howItWorks')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <HowItWorksStep step={1} title={t('lock.step1Title')} description={t('lock.step1Desc')} />
            <HowItWorksStep step={2} title={t('lock.step2Title')} description={t('lock.step2Desc')} />
            <HowItWorksStep step={3} title={t('lock.step3Title')} description={t('lock.step3Desc')} />
            <HowItWorksStep step={4} title={t('lock.step4Title')} description={t('lock.step4Desc')} />
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-12 flex items-center gap-2 text-text-muted">
        <Lock className="w-4 h-4" /><span className="text-sm">{t('lock.locked')}</span>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="border-gradient p-6 rounded-2xl">
      <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

function HowItWorksStep({ step, title, description }: { step: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center mx-auto mb-3">
        <span className="text-accent-gold font-bold">{step}</span>
      </div>
      <h4 className="text-sm font-bold text-text-primary mb-1">{title}</h4>
      <p className="text-xs text-text-muted">{description}</p>
    </div>
  );
}
