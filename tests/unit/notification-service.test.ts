import { getBrowserNotificationPermission, requestBrowserNotificationPermission, sendBrowserNotification } from "@/lib/services/notification-service";

describe("notification service", () => {
  const originalNotification = globalThis.Notification;
  const originalWindowNotification = window.Notification;

  afterEach(() => {
    globalThis.Notification = originalNotification;
    window.Notification = originalWindowNotification;
  });

  it("returns unsupported when the Notification API is unavailable", async () => {
    // @ts-expect-error test override
    globalThis.Notification = undefined;
    // @ts-expect-error test override
    window.Notification = undefined;

    expect(getBrowserNotificationPermission()).toBe("unsupported");
    await expect(requestBrowserNotificationPermission()).resolves.toBe("unsupported");
    expect(sendBrowserNotification("Reminder")).toBeNull();
  });

  it("uses the browser Notification API when permission is granted", async () => {
    const notificationMock = vi.fn();
    const requestPermission = vi.fn().mockResolvedValue("granted");

    class NotificationStub {
      static permission = "granted" as const;
      static requestPermission = requestPermission;

      constructor(title: string, options?: NotificationOptions) {
        notificationMock(title, options);
      }
    }

    globalThis.Notification = NotificationStub as unknown as typeof Notification;
    window.Notification = NotificationStub as unknown as typeof Notification;

    expect(getBrowserNotificationPermission()).toBe("granted");
    await expect(requestBrowserNotificationPermission()).resolves.toBe("granted");
    expect(sendBrowserNotification("Review now", { body: "Reminder body" })).not.toBeNull();
    expect(notificationMock).toHaveBeenCalledWith("Review now", { body: "Reminder body" });
  });

  it("does not send a notification when permission is not granted", () => {
    class NotificationStub {
      static permission = "denied" as const;
      static requestPermission = vi.fn().mockResolvedValue("denied");
    }

    globalThis.Notification = NotificationStub as unknown as typeof Notification;
    window.Notification = NotificationStub as unknown as typeof Notification;

    expect(sendBrowserNotification("Blocked")).toBeNull();
  });
});
