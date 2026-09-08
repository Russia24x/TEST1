import { motion } from 'framer-motion';
import { Shield, Heart, Zap, ExternalLink } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="relative z-10 border-t border-white/5 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 mb-8">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }} className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-gold/20 to-accent-gold/5 border border-accent-gold/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent-emerald" />
            </motion.div>
            <span className="text-text-muted text-sm text-center md:text-right">{t('footer.tagline')}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-text-muted text-sm flex items-center gap-1.5">{t('footer.madeWith')} <Heart className="w-3.5 h-3.5 text-accent-rose" /> {t('footer.forCommunity')}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <FooterCard title={t('footer.paymentNetworks')} items={[{ label: 'Solana', value: 'WSOL, PENGU, USDC', color: 'text-accent-emerald' }, { label: 'Abstract', value: 'WETH, PENGU, USDC', color: 'text-accent-purple' }]} />
          <FooterCard title={t('footer.dataSources')} items={[{ label: 'CoinGecko', value: 'Price & Supply', color: 'text-accent-gold' }, { label: 'DefiLlama', value: 'TVL & Revenue', color: 'text-accent-gold' }]} />
          <FooterCard title={t('footer.paymentProtocol')} items={[{ label: 'x402', value: 'HTTP 402 Standard', color: 'text-blue-400' }, { label: 'Facilitator', value: 'facilitator.x402.abs.xyz', color: 'text-blue-400' }]} />
          <FooterCard title={t('footer.infrastructure')} items={[{ label: 'Cloudflare', value: 'Workers + KV', color: 'text-orange-400' }, { label: 'Cost', value: 'Free — No Card', color: 'text-accent-emerald' }]} />
        </div>
        <div className="pt-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-xs leading-relaxed text-center sm:text-right">{t('footer.noCreditCard')}<br className="hidden sm:block" />{t('footer.onlyCost')}</p>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <motion.a whileHover={{ color: '#f0b90b' }} href="https://x402.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent-gold transition-colors"><ExternalLink className="w-3 h-3" />x402</motion.a>
              <motion.a whileHover={{ color: '#8b5cf6' }} href="https://docs.abs.xyz" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent-purple transition-colors"><ExternalLink className="w-3 h-3" />Abstract</motion.a>
              <motion.a whileHover={{ color: '#10b981' }} href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent-emerald transition-colors"><ExternalLink className="w-3 h-3" />DefiLlama</motion.a>
            </div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/50 border border-surface-700/30">
            <Zap className="w-3.5 h-3.5 text-accent-gold" />
            <span className="text-xs text-text-muted">{t('footer.poweredBy')}</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

interface FooterCardProps { title: string; items: { label: string; value: string; color: string }[]; }

function FooterCard({ title, items }: FooterCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} className="p-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
      <p className="text-xs font-bold text-text-primary mb-3">{title}</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <span className={`text-xs font-medium ${item.color}`}>{item.label}</span>
            <span className="text-xs text-text-muted truncate">{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
