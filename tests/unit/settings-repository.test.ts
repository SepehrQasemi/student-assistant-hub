import { settingsRepository } from "@/lib/repositories";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("settings repository", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates the default settings record once", async () => {
    const first = await settingsRepository.ensure();
    const second = await settingsRepository.ensure();

    expect(first.key).toBe("app-settings");
    expect(first.language).toBe("en");
    expect(second).toEqual(first);
  });

  it("persists updates without dropping existing settings", async () => {
    await settingsRepository.ensure();

    const updated = await settingsRepository.update({
      language: "fr",
      notificationsEnabled: false,
      weekStartsOn: 0,
    });

    expect(updated.language).toBe("fr");
    expect(updated.notificationsEnabled).toBe(false);
    expect(updated.weekStartsOn).toBe(0);

    const stored = await settingsRepository.get();
    expect(stored?.language).toBe("fr");
    expect(stored?.defaultCalendarView).toBe("month");
  });
});
