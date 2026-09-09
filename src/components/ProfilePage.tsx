import { motion } from 'framer-motion';
import { ArrowRight, User, Wallet, Clock, Shield, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useWallet } from '../context/WalletContext';
import { useProfile } from '../context/ProfileContext';
import { usePayment } from '../context/PaymentContext';

interface ProfilePageProps { onBack: () => void; }

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { t } = useI18n();
  const { wallet, disconnect } = useWallet();
  const { profile } = useProfile();
  const { payment } = usePayment();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => { if (wallet.address) { navigator.clipboard.writeText(wallet.address); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const getSessionTimeRemaining = () => { if (!payment.sessionExpiry) return null; const remaining = payment.sessionExpiry - Date.now(); if (remaining <= 0) return 'Expired'; const hours = Math.floor(remaining / 3600000); const minutes = Math.floor((remaining % 3600000) / 60000); return `${hours}h ${minutes}m`; };

  if (!profile || wallet.status !== 'connected') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-24 pb-12">
        <div className="text-center">
          <User className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">{t('profile.notConnected')}</h2>
          <p className="text-text-secondary mb-6">{t('profile.connectFirst')}</p>
          <button onClick={onBack} className="px-6 py-3 rounded-xl bg-accent-gold text-surface-900 font-bold hover:shadow-[0_0_30px_rgba(240,185,11,0.3)] transition-all">{t('common.back')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-gold/3 blur-[120px]" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={onBack} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8">
          <ArrowRight className="w-4 h-4" /><span className="text-sm">{t('common.back')}</span>
        </motion.button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-gradient p-6 rounded-2xl mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-gold to-accent-gold-dim flex items-center justify-center"><User className="w-8 h-8 text-surface-900" /></div>
            <div><h1 className="text-2xl font-bold text-text-primary">{t('profile.title')}</h1><p className="text-text-secondary text-sm">{wallet.type === 'abstract' ? 'Abstract Global Wallet' : 'Solana Wallet'}</p></div>
          </div>
          <div className="p-4 rounded-xl bg-surface-800/50 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">{t('profile.walletAddress')}</span>
              <button onClick={copyAddress} className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors">
                {copied ? <><CheckCircle2 className="w-3 h-3 text-accent-emerald" />{t('common.copied')}</> : <><Copy className="w-3 h-3" />{t('common.copy')}</>}
              </button>
            </div>
            <p className="text-sm text-text-primary font-mono break-all" dir="ltr">{wallet.address}</p>
          </div>
          {profile.isTreasuryOwner && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 mb-4">
              <Shield className="w-5 h-5 text-accent-emerald" /><span className="text-sm font-bold text-accent-emerald">{t('profile.treasuryOwner')}</span>
            </div>
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatCard icon={<Wallet className="w-5 h-5 text-accent-purple" />} label={t('profile.walletType')} value={wallet.type === 'abstract' ? 'Abstract (AGW)' : 'Solana'} />
          <StatCard icon={<Clock className="w-5 h-5 text-accent-gold" />} label={t('profile.joinDate')} value={formatDate(profile.joinDate)} />
          <StatCard icon={<Clock className="w-5 h-5 text-accent-emerald" />} label={t('profile.lastAccess')} value={formatDate(profile.lastAccess)} />
          <StatCard icon={<Shield className="w-5 h-5 text-blue-400" />} label={t('profile.totalPayments')} value={profile.totalPayments.toString()} />
        </motion.div>
        {payment.sessionExpiry && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border-gradient p-6 rounded-2xl mb-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-accent-gold" />{t('profile.activeSession')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><p className="text-xs text-text-muted mb-1">{t('profile.expiresIn')}</p><p className="text-lg font-bold text-accent-gold">{getSessionTimeRemaining()}</p></div>
              {payment.txHash && <div><p className="text-xs text-text-muted mb-1">{t('profile.paymentTx')}</p><p className="text-xs text-text-secondary font-mono truncate" dir="ltr">{payment.txHash.slice(0, 20)}...</p></div>}
            </div>
          </motion.div>
        )}
        {payment.txHash && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="border-gradient p-6 rounded-2xl mb-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-accent-purple" />{t('profile.recentTransaction')}</h3>
            <div className="p-3 rounded-xl bg-surface-800/50">
              <div className="flex items-center justify-between mb-2"><span className="text-xs text-text-muted">{t('profile.txHash')}</span><span className="text-xs text-accent-emerald">{t('profile.confirmed')}</span></div>
              <p className="text-xs text-text-secondary font-mono truncate" dir="ltr">{payment.txHash}</p>
            </div>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3">
          <button onClick={disconnect} className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/20 transition-all">{t('profile.disconnect')}</button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
          <p className="text-xs text-text-muted mb-3 text-center">{t('profile.explore')}</p>
          <div className="flex items-center justify-center gap-4">
            {wallet.type === 'abstract' ? (
              <a href={`https://portal.abs.xyz/address/${wallet.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent-purple hover:underline"><ExternalLink className="w-3 h-3" />Abstract Portal</a>
            ) : (
              <a href={`https://solscan.io/account/${wallet.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-accent-emerald hover:underline"><ExternalLink className="w-3 h-3" />Solscan</a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/30">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-text-muted">{label}</span></div>
      <p className="text-sm font-bold text-text-primary">{value}</p>
    </div>
  );
}
