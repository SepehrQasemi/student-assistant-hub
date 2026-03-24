"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/providers/i18n-provider";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.4)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div className="space-y-2">
        <Badge variant="accent" className="w-fit">
          {t("common.offlineBadge")}
        </Badge>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 md:text-base">{subtitle}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}
