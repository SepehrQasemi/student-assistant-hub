"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlarmClockCheck, ArrowRight, CalendarClock, Clock3, FileText, FolderOpen, GraduationCap } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/providers/i18n-provider";
import { courseRepository, eventRepository, fileRepository, notificationRepository, reminderRepository } from "@/lib/repositories";
import { buildDashboardSnapshot } from "@/lib/services/dashboard-service";
import { getReminderDisplayState } from "@/lib/services/reminder-engine";
import { formatBytes } from "@/lib/utils";

export function DashboardPageClient() {
  const { t } = useI18n();
  const courses = useLiveQuery(() => courseRepository.list(), [], undefined);
  const files = useLiveQuery(() => fileRepository.list(), [], undefined);
  const events = useLiveQuery(() => eventRepository.list(), [], undefined);
  const reminders = useLiveQuery(() => reminderRepository.list(), [], undefined);
  const notifications = useLiveQuery(() => notificationRepository.list(), [], undefined);

  const snapshot = useMemo(() => {
    if (!courses || !files || !events || !reminders || !notifications) {
      return null;
    }

    return buildDashboardSnapshot({
      courses,
      files,
      events,
      reminders,
      notifications,
    });
  }, [courses, events, files, notifications, reminders]);

  if (!snapshot) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />
        <Card>
          <CardContent className="py-12 text-sm text-slate-600">{t("common.loading")}</CardContent>
        </Card>
      </div>
    );
  }

  const isEmpty = snapshot.totalCourses === 0 && snapshot.totalFiles === 0 && snapshot.eventsThisWeek.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

      {isEmpty ? (
        <EmptyState
          title={t("dashboard.emptyTitle")}
          description={t("dashboard.emptyDescription")}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/courses">{t("dashboard.addCourse")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/files">{t("dashboard.importFiles")}</Link>
              </Button>
            </div>
          }
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t("dashboard.totalCourses")} value={snapshot.totalCourses} />
        <StatCard label={t("dashboard.totalFiles")} value={snapshot.totalFiles} />
        <StatCard label={t("dashboard.upcomingDeadlines")} value={snapshot.upcomingDeadlines.length} />
        <StatCard label={t("dashboard.upcomingExams")} value={snapshot.upcomingExams.length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dashboard.recentFiles")}</CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/files">
                {t("navigation.files")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.recentFiles.length === 0 ? (
              <p className="text-sm text-slate-600">{t("files.emptyDescription")}</p>
            ) : (
              snapshot.recentFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-teal-50 p-2 text-teal-700">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{new Date(file.importedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge variant="muted">{formatBytes(file.sizeBytes)}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Button asChild variant="secondary" className="justify-between">
              <Link href="/courses">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {t("dashboard.addCourse")}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-between">
              <Link href="/files">
                <span className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {t("dashboard.importFiles")}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="justify-between">
              <Link href="/calendar">
                <span className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  {t("dashboard.addEvent")}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.upcomingDeadlines")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-slate-600">{t("calendar.emptyDescription")}</p>
            ) : (
              snapshot.upcomingDeadlines.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-red-600" />
                    <p className="font-medium text-slate-900">{event.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{new Date(event.startsAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.upcomingExams")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.upcomingExams.length === 0 ? (
              <p className="text-sm text-slate-600">{t("calendar.emptyDescription")}</p>
            ) : (
              snapshot.upcomingExams.map((event) => (
                <div key={event.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    <AlarmClockCheck className="h-4 w-4 text-violet-600" />
                    <p className="font-medium text-slate-900">{event.title}</p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{new Date(event.startsAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.reminders")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.upcomingReminders.length === 0 ? (
              <p className="text-sm text-slate-600">{t("reminders.empty")}</p>
            ) : (
              snapshot.upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{new Date(reminder.snoozedUntil || reminder.scheduledFor).toLocaleString()}</p>
                    <Badge variant={getReminderDisplayState(reminder) === "overdue" ? "danger" : "muted"}>
                      {t(`reminders.states.${getReminderDisplayState(reminder)}`)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.eventsThisWeek")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {snapshot.eventsThisWeek.length === 0 ? (
            <p className="text-sm text-slate-600">{t("calendar.emptyDescription")}</p>
          ) : (
            snapshot.eventsThisWeek.map((event) => (
              <div key={event.id} className="rounded-2xl border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{event.title}</p>
                <p className="mt-1 text-sm text-slate-600">{new Date(event.startsAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
