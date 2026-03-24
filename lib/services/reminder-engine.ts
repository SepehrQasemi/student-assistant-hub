import { formatDistanceToNowStrict, subMinutes } from "date-fns";
import { enUS, fr } from "date-fns/locale";

import { eventRepository, notificationRepository, reminderRepository, settingsRepository } from "@/lib/repositories";
import { sendBrowserNotification } from "@/lib/services/notification-service";
import { nowIso } from "@/lib/utils";
import type { CalendarEvent, Locale, Reminder, ReminderFormValue } from "@/types/entities";

export function calculateReminderSchedule(eventStartIso: string, reminder: ReminderFormValue) {
  if (reminder.mode === "absolute") {
    return reminder.scheduledFor;
  }

  const offsetMinutes = reminder.offsetMinutes ?? 0;
  return subMinutes(new Date(eventStartIso), offsetMinutes).toISOString();
}

export function getEffectiveReminderDate(reminder: Reminder) {
  return reminder.snoozedUntil || reminder.scheduledFor;
}

export function getReminderDisplayState(reminder: Reminder, referenceIso = nowIso()) {
  const effectiveDate = getEffectiveReminderDate(reminder);

  if (reminder.status === "dismissed") {
    return "dismissed";
  }

  if (reminder.status === "completed") {
    return "completed";
  }

  if (effectiveDate < referenceIso) {
    return "overdue";
  }

  return "upcoming";
}

export function isReminderDue(reminder: Reminder, referenceIso = nowIso()) {
  if (reminder.status !== "scheduled" || reminder.deletedAt) {
    return false;
  }

  const effectiveDate = getEffectiveReminderDate(reminder);

  if (reminder.lastTriggeredAt && reminder.lastTriggeredAt >= effectiveDate) {
    return false;
  }

  return effectiveDate <= referenceIso;
}

export function describeReminderDistance(scheduledFor: string, locale: Locale) {
  return formatDistanceToNowStrict(new Date(scheduledFor), {
    addSuffix: true,
    locale: locale === "fr" ? fr : enUS,
  });
}

type Translator = (locale: Locale, key: string, params?: Record<string, string | number>) => string;

export class ReminderEngine {
  private intervalId: number | null = null;

  constructor(
    private readonly translator: Translator,
    private readonly getLocale: () => Locale,
  ) {}

  async tick() {
    const [settings, reminders] = await Promise.all([settingsRepository.get(), reminderRepository.list()]);
    const notificationsEnabled = settings?.notificationsEnabled ?? false;
    const dueReminders = reminders.filter((reminder) => isReminderDue(reminder));

    for (const reminder of dueReminders) {
      const event = await eventRepository.getById(reminder.eventId);

      if (!event || event.status === "done") {
        continue;
      }

      await this.handleDueReminder(reminder, event, notificationsEnabled);
    }
  }

  start() {
    if (typeof window === "undefined") {
      return;
    }

    this.stop();
    void this.tick();
    this.intervalId = window.setInterval(() => {
      void this.tick();
    }, 30_000);
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async handleDueReminder(reminder: Reminder, event: CalendarEvent, notificationsEnabled: boolean) {
    const locale = this.getLocale();
    const scheduledFor = getEffectiveReminderDate(reminder);
    const title = this.translator(locale, "notifications.title");
    const body = `${event.title} - ${this.translator(locale, "calendar.eventDetails")}`;

    await notificationRepository.createIfMissing({
      reminderId: reminder.id,
      eventId: event.id,
      title,
      body,
      scheduledFor,
    });

    await reminderRepository.markTriggered(reminder.id, nowIso());

    if (notificationsEnabled) {
      sendBrowserNotification(event.title, {
        body,
        tag: reminder.id,
      });
    }
  }
}
