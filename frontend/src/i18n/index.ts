import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './fr';
import ar from './ar';

i18n
  .use(initReactI18next)
  .init({
    resources: { fr, ar },
    lng: localStorage.getItem('langue') || 'fr',
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  });

const applyDirection = (lang: string) => {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
};

applyDirection(i18n.language);
i18n.on('languageChanged', applyDirection);

export default i18n;
