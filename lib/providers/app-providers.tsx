"use client";

import { useEffect, useRef } from "react";
import { Toaster } from "sonner";

import { t as translate } from "@/lib/i18n";
import { settingsRepository } from "@/lib/repositories";
import { ReminderEngine } from "@/lib/services/reminder-engine";
import { getBrowserNotificationPermission } from "@/lib/services/notification-service";
import { I18nProvider, useI18n } from "@/lib/providers/i18n-provider";

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();
  const engineRef = useRef<ReminderEngine | null>(null);

  useEffect(() => {
    void settingsRepository.ensure().then(async () => {
      await settingsRepository.update({
        notificationPermission: getBrowserNotificationPermission(),
      });
    });
  }, []);

  useEffect(() => {
    engineRef.current?.stop();
    engineRef.current = new ReminderEngine((engineLocale, key, params) => translate(engineLocale, key, params), () => locale);
    engineRef.current.start();

    return () => {
      engineRef.current?.stop();
    };
  }, [locale]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AppBootstrap>
        {children}
        <Toaster richColors position="top-right" />
      </AppBootstrap>
    </I18nProvider>
  );
}
