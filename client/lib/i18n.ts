import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
import en from '../locales/en.json';
import tg from '../locales/tg.json';
import ru from '../locales/ru.json';

const resources = {
  en: {
    translation: en,
  },
  tg: {
    translation: tg,
  },
  ru: {
    translation: ru,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['en', 'ru', 'tg'],
    fallbackLng: 'ru',
    load: 'languageOnly',
    debug: false,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      // Use device/browser language; do not persist
      order: ['navigator', 'htmlTag'],
      caches: [],
    },
  });

export default i18n;
