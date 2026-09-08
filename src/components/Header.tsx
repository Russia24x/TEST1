import { motion } from 'framer-motion';
import { Crown, BarChart3, BookOpen, Lock, User } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useWallet } from '../context/WalletContext';
import { LanguageSwitcher } from './LanguageSwitcher';

type Page = 'lock' | 'payment' | 'rankings' | 'methodology' | 'profile';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isUnlocked: boolean;
}

export function Header({ currentPage, onNavigate, isUnlocked }: HeaderProps) {
  const { t } = useI18n();
  const { wallet } = useWallet();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        <motion.div className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate(isUnlocked ? 'rankings' : 'lock')}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-accent-gold to-accent-gold-dim flex items-center justify-center shadow-lg shadow-accent-gold/20">
            <Crown className="w-5 h-5 text-surface-900" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base sm:text-lg font-bold text-text-primary leading-tight">{t('app.title')}</h1>
            <p className="text-xs text-text-muted">{t('app.subtitle')}</p>
          </div>
        </motion.div>
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavButton icon={<BarChart3 className="w-4 h-4" />} label={t('nav.rankings')} active={currentPage === 'rankings'} onClick={() => onNavigate('rankings')} disabled={!isUnlocked} />
            <NavButton icon={<BookOpen className="w-4 h-4" />} label={t('nav.methodology')} active={currentPage === 'methodology'} onClick={() => onNavigate('methodology')} />
            {wallet.status === 'connected' && <NavButton icon={<User className="w-4 h-4" />} label={t('nav.profile')} active={currentPage === 'profile'} onClick={() => onNavigate('profile')} />}
            {!isUnlocked && wallet.status !== 'connected' && <NavButton icon={<Lock className="w-4 h-4" />} label={t('nav.unlock')} active={currentPage === 'lock' || currentPage === 'payment'} onClick={() => onNavigate('lock')} />}
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

interface NavButtonProps { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; disabled?: boolean; }

function NavButton({ icon, label, active, onClick, disabled }: NavButtonProps) {
  return (
    <motion.button whileHover={disabled ? {} : { scale: 1.05 }} whileTap={disabled ? {} : { scale: 0.95 }} onClick={disabled ? undefined : onClick}
      className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${active ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30 shadow-lg shadow-accent-purple/10' : disabled ? 'text-text-muted/40 cursor-not-allowed' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
