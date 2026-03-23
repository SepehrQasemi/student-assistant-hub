import type { AppSettings, CalendarView } from "@/types/entities";
import { nowIso } from "@/lib/utils";

export const SETTINGS_KEY = "app-settings" as const;

export function getDefaultSettings(defaultCalendarView: CalendarView = "month"): AppSettings {
  const timestamp = nowIso();

  return {
    key: SETTINGS_KEY,
    language: "en",
    notificationsEnabled: true,
    notificationPermission: "default",
    defaultCalendarView,
    compactFileCards: false,
    weekStartsOn: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
