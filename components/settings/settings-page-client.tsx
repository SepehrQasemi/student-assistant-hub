"use client";

import { useMemo, useState } from "react";
import { BellRing, DatabaseZap, Globe2, LayoutTemplate } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStorageEstimate } from "@/lib/hooks/use-storage-estimate";
import { useI18n } from "@/lib/providers/i18n-provider";
import { fileRepository, settingsRepository } from "@/lib/repositories";
import { requestBrowserNotificationPermission } from "@/lib/services/notification-service";
import { formatBytes } from "@/lib/utils";
import type { CalendarView, Locale } from "@/types/entities";

export function SettingsPageClient() {
  const { t, locale, setLocale } = useI18n();
  const settings = useLiveQuery(() => settingsRepository.get(), [], undefined);
  const files = useLiveQuery(() => fileRepository.list(), [], []);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const storageEstimate = useStorageEstimate();

  const storedBytes = useMemo(() => files.reduce((total, file) => total + file.sizeBytes, 0), [files]);

  async function handleLocaleChange(nextLocale: Locale) {
    await setLocale(nextLocale);
  }

  async function handleNotificationToggle(enabled: boolean) {
    await settingsRepository.update({ notificationsEnabled: enabled });
  }

  async function handleDefaultViewChange(view: CalendarView) {
    await settingsRepository.update({ defaultCalendarView: view });
  }

  async function handleCompactCardsToggle(enabled: boolean) {
    await settingsRepository.update({ compactFileCards: enabled });
  }

  async function handleWeekStartsOnChange(weekStartsOn: 0 | 1) {
    await settingsRepository.update({ weekStartsOn });
  }

  async function handleRequestPermission() {
    setIsRequestingPermission(true);
    try {
      const permission = await requestBrowserNotificationPermission();
      await settingsRepository.update({ notificationPermission: permission });
    } finally {
      setIsRequestingPermission(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      {!settings ? (
        <Card>
          <CardContent className="py-12 text-sm text-slate-600">{t("common.loading")}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-slate-500" />
                <CardTitle>{t("common.language")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label>{t("common.language")}</Label>
              <Select value={locale} onValueChange={(value) => void handleLocaleChange(value as Locale)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t("locales.en")}</SelectItem>
                  <SelectItem value="fr">{t("locales.fr")}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-slate-500" />
                <CardTitle>{t("settings.notifications")}</CardTitle>
              </div>
              <CardDescription>{t("settings.notificationHelp")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-medium text-slate-900">{t("settings.notifications")}</p>
                  <p className="text-sm text-slate-600">
                    {t("settings.permissionState")}: {t(`permissions.${settings.notificationPermission}`)}
                  </p>
                </div>
                <Switch checked={settings.notificationsEnabled} onCheckedChange={(checked) => void handleNotificationToggle(checked)} />
              </div>
              <Button variant="secondary" onClick={() => void handleRequestPermission()} disabled={isRequestingPermission}>
                {isRequestingPermission ? t("common.loading") : t("settings.requestPermission")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LayoutTemplate className="h-4 w-4 text-slate-500" />
                <CardTitle>{t("calendar.title")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.defaultView")}</Label>
                <Select value={settings.defaultCalendarView} onValueChange={(value) => void handleDefaultViewChange(value as CalendarView)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">{t("calendar.viewDay")}</SelectItem>
                    <SelectItem value="week">{t("calendar.viewWeek")}</SelectItem>
                    <SelectItem value="month">{t("calendar.viewMonth")}</SelectItem>
                    <SelectItem value="quarter">{t("calendar.viewQuarter")}</SelectItem>
                    <SelectItem value="agenda">{t("calendar.viewAgenda")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div>
                  <p className="font-medium text-slate-900">{t("settings.compactCards")}</p>
                </div>
                <Switch checked={settings.compactFileCards} onCheckedChange={(checked) => void handleCompactCardsToggle(checked)} />
              </div>
              <div className="space-y-2">
                <Label>{t("settings.weekStartsOn")}</Label>
                <Select value={String(settings.weekStartsOn)} onValueChange={(value) => void handleWeekStartsOnChange(Number(value) as 0 | 1)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t("weekStart.sunday")}</SelectItem>
                    <SelectItem value="1">{t("weekStart.monday")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DatabaseZap className="h-4 w-4 text-slate-500" />
                <CardTitle>{t("settings.storage")}</CardTitle>
              </div>
              <CardDescription>{t("settings.storageHelp")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>{t("dashboard.totalFiles")}: {files.length}</p>
              <p>{t("common.size")}: {formatBytes(storedBytes)}</p>
              <p>{t("settings.indexedDbUsage")}: {storageEstimate.usage ? formatBytes(storageEstimate.usage) : t("common.unavailable")}</p>
              <p>{t("settings.indexedDbQuota")}: {storageEstimate.quota ? formatBytes(storageEstimate.quota) : t("common.unavailable")}</p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{t("settings.appInfo")}</p>
                <p className="mt-1">{t("settings.version")}: 1.0.0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
