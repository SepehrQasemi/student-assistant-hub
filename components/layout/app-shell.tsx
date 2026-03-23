"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FolderOpen, Home, NotebookTabs, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationCenter } from "@/components/layout/notification-center";
import { useI18n } from "@/lib/providers/i18n-provider";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/dashboard", icon: Home, key: "navigation.dashboard" },
  { href: "/courses", icon: NotebookTabs, key: "navigation.courses" },
  { href: "/files", icon: FolderOpen, key: "navigation.files" },
  { href: "/calendar", icon: CalendarDays, key: "navigation.calendar" },
  { href: "/settings", icon: Settings, key: "navigation.settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <aside className="hidden w-72 flex-col justify-between bg-[var(--sidebar-bg)] px-6 py-8 text-[var(--sidebar-fg)] lg:flex">
          <div className="space-y-8">
            <div className="space-y-3">
              <Badge className="bg-white/10 text-white" variant="default">
                {t("common.offlineBadge")}
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold">{t("common.appName")}</h1>
                <p className="mt-2 text-sm text-slate-300">{t("shell.sidebarDescription")}</p>
              </div>
            </div>
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active ? "bg-white text-slate-950 shadow-md" : "text-slate-300 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{t(item.key)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            {t("shell.sidebarFootnote")}
          </div>
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/50 bg-white/70 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{t("shell.headerTitle")}</p>
                <p className="text-sm text-slate-600">{t("shell.headerSubtitle")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <LanguageSwitcher />
                <NotificationCenter />
              </div>
            </div>
          </header>
          <main className="flex-1 px-4 py-5 pb-24 md:px-6 lg:px-8 lg:pb-8">{children}</main>
          <nav className="fixed inset-x-4 bottom-4 z-40 rounded-[28px] border border-white/80 bg-white/90 p-2 shadow-2xl backdrop-blur lg:hidden">
            <div className="grid grid-cols-5 gap-1">
              {navigationItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Button key={item.href} variant={active ? "default" : "ghost"} size="sm" asChild className="h-14 flex-col gap-1 rounded-2xl">
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span className="text-[11px]">{t(item.key)}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
