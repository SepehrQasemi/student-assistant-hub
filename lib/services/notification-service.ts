import type { NotificationPermissionState } from "@/types/entities";

export function getBrowserNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || typeof window.Notification === "undefined") {
    return "unsupported";
  }

  return window.Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === "undefined" || typeof window.Notification === "undefined") {
    return "unsupported";
  }

  return window.Notification.requestPermission();
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || typeof window.Notification === "undefined") {
    return null;
  }

  if (window.Notification.permission !== "granted") {
    return null;
  }

  return new window.Notification(title, options);
}
