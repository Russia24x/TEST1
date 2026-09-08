import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LockPage } from './components/LockPage';
import { PaymentPage } from './components/PaymentPage';
import { RankingsPage } from './components/RankingsPage';
import { MethodologyPage } from './components/MethodologyPage';
import { ProfilePage } from './components/ProfilePage';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { useI18n } from './i18n/I18nContext';
import { useWallet } from './context/WalletContext';
import { usePayment } from './context/PaymentContext';

type Page = 'lock' | 'payment' | 'rankings' | 'methodology' | 'profile';

function App() {
  const { t } = useI18n();
  const { wallet } = useWallet();
  const { payment } = usePayment();
  const [currentPage, setCurrentPage] = useState<Page>('lock');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isTreasuryOwner, setIsTreasuryOwner] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (payment.sessionExpiry) {
      setIsUnlocked(true);
      const interval = setInterval(() => {
        const remaining = payment.sessionExpiry! - Date.now();
        if (remaining <= 0) { setIsUnlocked(false); setCurrentPage('lock'); clearInterval(interval); return; }
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [payment.sessionExpiry]);

  const handlePaymentSuccess = () => { setIsUnlocked(true); setIsTreasuryOwner(false); setCurrentPage('rankings'); };
  const handleTreasuryAccess = () => { setIsUnlocked(true); setIsTreasuryOwner(true); setCurrentPage('rankings'); };
  const handleNavigate = (page: Page) => { if (page === 'rankings' && !isUnlocked) setCurrentPage('lock'); else setCurrentPage(page); };

  return (
    <div className="min-h-screen bg-surface-900 noise-overlay bg-grid relative">
      <Header currentPage={currentPage} onNavigate={handleNavigate} isUnlocked={isUnlocked} />
      {isUnlocked && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="fixed top-[72px] left-0 right-0 z-40 bg-surface-800/90 backdrop-blur-sm border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTreasuryOwner ? 'bg-accent-emerald' : 'bg-accent-gold'} animate-pulse-glow`} />
              <span className="text-xs text-text-secondary">{isTreasuryOwner ? t('app.treasuryAccess') : t('app.activeSession')}</span>
            </div>
            <span className="text-xs text-text-muted font-mono" dir="ltr">{timeRemaining} {t('app.remaining')}</span>
          </div>
        </motion.div>
      )}
      <main className={`relative z-10 ${isUnlocked ? 'pt-10' : ''}`}>
        <AnimatePresence mode="wait">
          {currentPage === 'lock' && <motion.div key="lock" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}><LockPage onConnect={() => setCurrentPage('payment')} /></motion.div>}
          {currentPage === 'payment' && <motion.div key="payment" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}><PaymentPage onSuccess={handlePaymentSuccess} onTreasuryAccess={handleTreasuryAccess} onBack={() => setCurrentPage('lock')} /></motion.div>}
          {currentPage === 'rankings' && <motion.div key="rankings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}><RankingsPage /></motion.div>}
          {currentPage === 'methodology' && <motion.div key="methodology" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}><MethodologyPage onBack={() => setCurrentPage(isUnlocked ? 'rankings' : 'lock')} /></motion.div>}
          {currentPage === 'profile' && <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}><ProfilePage onBack={() => setCurrentPage(isUnlocked ? 'rankings' : 'lock')} /></motion.div>}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
