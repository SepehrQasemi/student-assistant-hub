"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { settingsRepository } from "@/lib/repositories";
import { t as translate } from "@/lib/i18n";
import type { Locale } from "@/types/entities";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    void settingsRepository.ensure().then((settings) => {
      setLocaleState(settings.language);
      document.documentElement.lang = settings.language;
    });
  }, []);

  async function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
    await settingsRepository.update({ language: nextLocale });
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t: (key, params) => translate(locale, key, params),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}
