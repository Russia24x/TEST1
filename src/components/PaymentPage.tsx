import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2, Shield, AlertTriangle, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useWallet } from '../context/WalletContext';
import { usePayment, TREASURY_ADDRESSES } from '../context/PaymentContext';

interface PaymentPageProps { onSuccess: () => void; onTreasuryAccess: () => void; onBack: () => void; }
type Network = 'solana' | 'abstract';
type Asset = 'SOL' | 'PENGU' | 'USDC' | 'ETH' | 'WETH';
interface PaymentOption { asset: Asset; label: string; prepSteps: string[]; isNative: boolean; }

export function PaymentPage({ onSuccess, onTreasuryAccess, onBack }: PaymentPageProps) {
  const { t } = useI18n();
  const { wallet, signMessage } = useWallet();
  const { payment, initiatePayment } = usePayment();
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(wallet.type === 'solana' ? 'solana' : 'abstract');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const solanaOptions: PaymentOption[] = [
    { asset: 'SOL', label: 'SOL → WSOL', prepSteps: ['Wrap SOL to WSOL', 'Send WSOL payment'], isNative: true },
    { asset: 'PENGU', label: 'PENGU', prepSteps: ['Ensure ATA exists', 'Send PENGU payment'], isNative: false },
    { asset: 'USDC', label: 'USDC', prepSteps: ['Ensure ATA exists', 'Send USDC payment'], isNative: false },
  ];
  const abstractOptions: PaymentOption[] = [
    { asset: 'ETH', label: 'ETH → WETH', prepSteps: ['Wrap ETH to WETH', 'Send WETH payment'], isNative: true },
    { asset: 'PENGU', label: 'PENGU', prepSteps: ['Approve Permit2 (one-time)', 'Send PENGU payment'], isNative: false },
    { asset: 'USDC', label: 'USDC', prepSteps: ['No preparation needed', 'Send USDC directly (ERC-3009)'], isNative: false },
  ];

  const options = selectedNetwork === 'solana' ? solanaOptions : abstractOptions;
  const selectedOption = options.find(o => o.asset === selectedAsset);

  const handlePay = async () => {
    if (!selectedAsset) return;
    try {
      const assetMap: Record<Asset, 'USDC' | 'WETH' | 'PENGU' | 'WSOL' | 'SOL'> = { 'SOL': 'WSOL', 'ETH': 'WETH', 'PENGU': 'PENGU', 'USDC': 'USDC', 'WETH': 'WETH' };
      await initiatePayment(assetMap[selectedAsset]);
      if (payment.status === 'success') setTimeout(() => onSuccess(), 1500);
    } catch (error) { console.error('Payment failed:', error); }
  };

  const handleTreasurySign = async () => {
    try {
      const message = `Sign to verify treasury ownership\nTimestamp: ${Date.now()}`;
      const signature = await signMessage(message);
      if (signature) setTimeout(() => onTreasuryAccess(), 1000);
    } catch (error) { console.error('Treasury sign failed:', error); }
  };

  const copyAddress = (address: string) => { navigator.clipboard.writeText(address); setCopiedAddress(address); setTimeout(() => setCopiedAddress(null), 2000); };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent-gold/3 blur-[150px]" />
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onClick={onBack} className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-8">
          <ArrowRight className="w-4 h-4" /><span className="text-sm">{t('common.back')}</span>
        </motion.button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary mb-3">{t('payment.title')}</h1>
          <p className="text-text-secondary">{t('payment.subtitle')}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-3 mb-8">
          <button onClick={() => { setSelectedNetwork('solana'); setSelectedAsset(null); }} className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all duration-300 ${selectedNetwork === 'solana' ? 'border-accent-emerald bg-accent-emerald/10 shadow-[0_0_30px_rgba(20,241,149,0.15)]' : 'border-surface-700 bg-surface-800/50 hover:border-surface-600'}`}>
            <div className="flex items-center justify-center gap-3"><div className="w-3 h-3 rounded-full bg-accent-emerald" /><span className={`font-bold text-lg ${selectedNetwork === 'solana' ? 'text-accent-emerald' : 'text-text-primary'}`}>{t('payment.solana')}</span></div>
            <p className="text-xs text-text-muted mt-1">Phantom / Solflare / Backpack</p>
          </button>
          <button onClick={() => { setSelectedNetwork('abstract'); setSelectedAsset(null); }} className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all duration-300 ${selectedNetwork === 'abstract' ? 'border-accent-purple bg-accent-purple/10 shadow-[0_0_30px_rgba(139,92,246,0.15)]' : 'border-surface-700 bg-surface-800/50 hover:border-surface-600'}`}>
            <div className="flex items-center justify-center gap-3"><div className="w-3 h-3 rounded-full bg-accent-purple" /><span className={`font-bold text-lg ${selectedNetwork === 'abstract' ? 'text-accent-purple' : 'text-text-primary'}`}>{t('payment.abstract')}</span></div>
            <p className="text-xs text-text-muted mt-1">AGW ({t('payment.globalWallet')})</p>
          </button>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-3 mb-8">
          {options.map((option, idx) => (
            <motion.button key={option.asset} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + idx * 0.05 }} onClick={() => setSelectedAsset(option.asset)}
              className={`w-full text-right p-4 rounded-xl border-2 transition-all duration-300 ${selectedAsset === option.asset ? 'border-accent-gold bg-accent-gold/5' : 'border-surface-700 bg-surface-800/30 hover:border-surface-600'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedAsset === option.asset ? 'bg-accent-gold/20' : 'bg-surface-700'}`}>
                    <span className="text-sm font-bold text-text-primary">{option.asset === 'SOL' ? '◎' : option.asset === 'ETH' ? 'Ξ' : option.asset === 'USDC' ? '$' : '🐧'}</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{option.label}</p>
                    {option.isNative && <p className="text-xs text-accent-gold flex items-center gap-1 mt-0.5"><AlertTriangle className="w-3 h-3" />{t('payment.wrapRequired')}</p>}
                  </div>
                </div>
                {selectedAsset === option.asset && <Check className="w-5 h-5 text-accent-gold" />}
              </div>
            </motion.button>
          ))}
        </motion.div>
        {selectedOption && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="mb-8 p-4 rounded-xl bg-surface-800/50 border border-surface-700/50">
            <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent-gold" />{t('payment.prepSteps')}</h4>
            <ol className="space-y-2">
              {selectedOption.prepSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="w-5 h-5 rounded-full bg-surface-700 flex items-center justify-center text-xs text-text-muted flex-shrink-0 mt-0.5">{idx + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button onClick={handlePay} disabled={!selectedAsset || payment.status !== 'idle'}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${!selectedAsset || payment.status !== 'idle' ? 'bg-surface-700 text-text-muted cursor-not-allowed' : 'bg-gradient-to-r from-accent-gold to-accent-gold-dim text-surface-900 hover:shadow-[0_0_40px_rgba(240,185,11,0.3)] hover:scale-[1.02]'}`}>
            {payment.status === 'idle' && selectedAsset && <span>{t('payment.payWith')} {selectedOption?.label}</span>}
            {payment.status === 'idle' && !selectedAsset && <span>{t('payment.selectAsset')}</span>}
            {payment.status === 'preparing' && <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />{t('payment.preparing')}</span>}
            {payment.status === 'signing' && <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />{t('payment.signing')}</span>}
            {payment.status === 'confirming' && <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />{t('payment.confirming')}</span>}
            {payment.status === 'success' && <span className="flex items-center justify-center gap-2"><Check className="w-5 h-5" />{t('payment.confirmed')}</span>}
          </button>
        </motion.div>
        {payment.txHash && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
            <p className="text-xs text-text-muted mb-1">{t('payment.txHash')}:</p>
            <p className="text-xs text-text-secondary font-mono truncate" dir="ltr">{payment.txHash}</p>
          </motion.div>
        )}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-6 flex items-center justify-center gap-2 text-text-muted">
          <Shield className="w-4 h-4" /><span className="text-xs">{t('payment.securityNote')}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-6 p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
          <p className="text-xs text-text-muted mb-2 text-center">{t('payment.treasuryAddresses')}:</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-800/50">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-emerald" /><span className="text-xs text-text-muted">{t('payment.solana')}:</span></div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-text-secondary font-mono truncate max-w-[200px]" dir="ltr">{TREASURY_ADDRESSES.solana}</code>
                <button onClick={() => copyAddress(TREASURY_ADDRESSES.solana)} className="p-1 rounded hover:bg-surface-700 transition-colors">
                  {copiedAddress === TREASURY_ADDRESSES.solana ? <CheckCircle2 className="w-3 h-3 text-accent-emerald" /> : <Copy className="w-3 h-3 text-text-muted" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-800/50">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent-purple" /><span className="text-xs text-text-muted">{t('payment.abstract')}:</span></div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-text-secondary font-mono truncate max-w-[200px]" dir="ltr">{TREASURY_ADDRESSES.abstract}</code>
                <button onClick={() => copyAddress(TREASURY_ADDRESSES.abstract)} className="p-1 rounded hover:bg-surface-700 transition-colors">
                  {copiedAddress === TREASURY_ADDRESSES.abstract ? <CheckCircle2 className="w-3 h-3 text-accent-emerald" /> : <Copy className="w-3 h-3 text-text-muted" />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-10 border-gradient p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3"><Shield className="w-4 h-4 text-accent-emerald" /><h3 className="text-sm font-bold text-text-primary">{t('payment.treasuryOwner')}</h3></div>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">{t('payment.treasuryOwnerDesc')}</p>
          <button onClick={handleTreasurySign} disabled={wallet.status !== 'connected'} className="w-full py-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald font-medium text-sm hover:bg-accent-emerald/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {t('payment.signInWithMessage')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
