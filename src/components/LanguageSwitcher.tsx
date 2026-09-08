import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { languages } from '../i18n/translations';

export function LanguageSwitcher() {
  const { language, setLanguage, currentLangInfo } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:border-accent-gold/30 hover:bg-surface-700/50 transition-all duration-200 text-sm">
        <Globe className="w-4 h-4 text-accent-gold" />
        <span className="text-lg">{currentLangInfo.flag}</span>
        <span className="text-text-secondary hidden sm:inline">{currentLangInfo.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-56 rounded-xl bg-surface-800 border border-surface-700/50 shadow-2xl shadow-black/50 overflow-hidden z-50">
            <div className="p-1.5 max-h-80 overflow-y-auto custom-scrollbar">
              {languages.map((lang) => (
                <button key={lang.code} onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-right ${language === lang.code ? 'bg-accent-gold/10 text-accent-gold' : 'text-text-secondary hover:bg-surface-700/50 hover:text-text-primary'}`}>
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1 text-right">
                    <p className="text-sm font-medium">{lang.nativeName}</p>
                    <p className="text-xs text-text-muted">{lang.name}</p>
                  </div>
                  {language === lang.code && <Check className="w-4 h-4 text-accent-gold flex-shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
