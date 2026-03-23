"use client";

import { addMinutes } from "date-fns";
import { Bell, BellRing } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/providers/i18n-provider";
import { eventRepository, notificationRepository, reminderRepository } from "@/lib/repositories";
import { getReminderDisplayState } from "@/lib/services/reminder-engine";

export function NotificationCenter() {
  const { t } = useI18n();
  const notifications = useLiveQuery(() => notificationRepository.list(), [], []);
  const reminders = useLiveQuery(() => reminderRepository.list(), [], []);
  const events = useLiveQuery(() => eventRepository.list(), [], []);
  const unreadCount = notifications.filter((notification) => notification.status === "unread").length;
  const reminderMap = new Map(reminders.map((reminder) => [reminder.id, reminder]));
  const eventMap = new Map(events.map((event) => [event.id, event]));

  async function handleMarkRead(id: string) {
    await notificationRepository.markRead(id);
  }

  async function handleDismiss(notificationId: string, reminderId: string) {
    await Promise.all([notificationRepository.dismiss(notificationId), reminderRepository.dismiss(reminderId)]);
  }

  async function handleSnooze(notificationId: string, reminderId: string) {
    await Promise.all([
      notificationRepository.markSnoozed(notificationId),
      reminderRepository.snooze(reminderId, addMinutes(new Date(), 30).toISOString()),
    ]);
  }

  async function handleMarkDone(eventId: string, notificationId: string) {
    await Promise.all([
      eventRepository.markDone(eventId),
      reminderRepository.completeByEvent(eventId),
      notificationRepository.markRead(notificationId),
    ]);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" aria-label={t("notifications.title")} className="relative">
          {unreadCount > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(94vw,560px)]">
        <DialogHeader>
          <DialogTitle>{t("notifications.title")}</DialogTitle>
          <DialogDescription>{t("notifications.emptyDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-600">
              {t("notifications.emptyTitle")}
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{notification.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
                    {reminderMap.get(notification.reminderId) ? (
                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {t(`reminders.states.${getReminderDisplayState(reminderMap.get(notification.reminderId)!)}`)}
                      </p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {t(`notifications.status.${notification.status}`)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => void handleMarkRead(notification.id)}>
                    {t("notifications.status.read")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleSnooze(notification.id, notification.reminderId)}>
                    {t("reminders.snooze")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleDismiss(notification.id, notification.reminderId)}>
                    {t("reminders.dismiss")}
                  </Button>
                  {eventMap.get(notification.eventId) ? (
                    <Button size="sm" onClick={() => void handleMarkDone(notification.eventId, notification.id)}>
                      {t("reminders.markDone")}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
