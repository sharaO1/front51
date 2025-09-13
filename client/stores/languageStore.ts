import { create } from 'zustand';
import i18n from '../lib/i18n';

interface LanguageState {
  language: string;
  setLanguage: (language: 'en' | 'ru' | 'tg') => void;
}

function detectDeviceLanguage(): 'en' | 'ru' | 'tg' {
  if (typeof navigator === 'undefined') return 'ru';
  const langs = (navigator.languages || [navigator.language]).map((l) => l.toLowerCase());
  for (const l of langs) {
    if (l.startsWith('ru')) return 'ru';
    if (l.startsWith('en')) return 'en';
    if (l.startsWith('tg') || l.startsWith('tj')) return 'tg';
  }
  return 'ru';
}

const initial = detectDeviceLanguage();

export const useLanguageStore = create<LanguageState>()((set) => ({
  language: initial,
  setLanguage: (language) => {
    set({ language });
    i18n.changeLanguage(language);
  },
}));

// Ensure i18n reflects detected language on startup
i18n.changeLanguage(initial);
