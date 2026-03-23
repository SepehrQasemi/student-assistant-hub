"use client";

import { Languages } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/providers/i18n-provider";
import type { Locale } from "@/types/entities";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="min-w-[160px]">
      <Select value={locale} onValueChange={(value) => void setLocale(value as Locale)}>
        <SelectTrigger className="bg-white/90">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-slate-500" />
            <SelectValue placeholder={t("common.language")} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t("locales.en")}</SelectItem>
          <SelectItem value="fr">{t("locales.fr")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
