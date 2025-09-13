import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../lib/i18n';

interface LanguageState {
  language: string;
  setLanguage: (language: string) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        set({ language });
        i18n.changeLanguage(language);
      },
    }),
    {
      name: 'language-storage',
    }
  )
);

// Initialize language on store creation
const storedLanguage = localStorage.getItem('language-storage');
if (storedLanguage) {
  try {
    const parsedData = JSON.parse(storedLanguage);
    if (parsedData.state?.language) {
      i18n.changeLanguage(parsedData.state.language);
    }
  } catch (error) {
    console.log('Error parsing stored language:', error);
  }
}
