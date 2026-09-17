'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  SupportedLanguage,
  LanguageOption,
  SUPPORTED_LANGUAGES,
  translations,
} from '@/src/lib/i18n';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
  t: (key: string, defaultText?: string) => string;
  tDynamic: (
    key: string,
    replacements?: Record<string, string | number>,
    defaultText?: string,
  ) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

let _inMemoryLanguage: SupportedLanguage = 'en';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(_inMemoryLanguage);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (_inMemoryLanguage && translations[_inMemoryLanguage]) {
      setLanguageState(_inMemoryLanguage);
    }
  }, []);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    _inMemoryLanguage = lang;
    setLanguageState(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const t = useCallback(
    (key: string, defaultText?: string): string => {
      const currentDict = translations[language];
      if (currentDict && currentDict[key]) {
        return currentDict[key];
      }
      // Fallback to English
      const enDict = translations.en;
      if (enDict && enDict[key]) {
        return enDict[key];
      }
      return defaultText || key;
    },
    [language],
  );

  const tDynamic = useCallback(
    (key: string, replacements?: Record<string, string | number>, defaultText?: string): string => {
      let str = t(key, defaultText);
      if (replacements) {
        Object.entries(replacements).forEach(([k, v]) => {
          str = str.replace(new RegExp(`{${k}}`, 'g'), String(v));
        });
      }
      return str;
    },
    [t],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
        t,
        tDynamic,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t, tDynamic, language, currentLanguageOption, setLanguage, languages } = useLanguage();
  return { t, tDynamic, language, currentLanguageOption, setLanguage, languages };
};
