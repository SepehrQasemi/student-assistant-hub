import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { settingsRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

describe("SettingsPageClient", () => {
  beforeEach(async () => {
    await resetDb();
    await settingsRepository.ensure();
  });

  it("persists language changes", async () => {
    renderWithProviders(<SettingsPageClient />);

    await waitFor(() => {
      expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);
    });

    const user = userEvent.setup();
    await user.click(screen.getAllByRole("combobox")[0]!);
    await user.click(screen.getByRole("option", { name: "French" }));

    await waitFor(async () => {
      expect((await settingsRepository.get())?.language).toBe("fr");
      expect(document.documentElement.lang).toBe("fr");
    });
  });

  it("updates notification and calendar display preferences", async () => {
    renderWithProviders(<SettingsPageClient />);

    await waitFor(() => {
      expect(screen.getAllByRole("combobox").length).toBeGreaterThan(0);
      expect(screen.getAllByRole("switch").length).toBeGreaterThanOrEqual(2);
    });

    const user = userEvent.setup();
    const comboboxes = screen.getAllByRole("combobox");
    const switches = screen.getAllByRole("switch");
    await user.click(switches[0]!);
    await user.click(switches[1]!);

    await user.click(comboboxes[1]!);
    await user.click(screen.getByRole("option", { name: "Agenda" }));

    await user.click(comboboxes[2]!);
    await user.click(screen.getByRole("option", { name: "Sunday" }));

    await waitFor(async () => {
      const settings = await settingsRepository.get();
      expect(settings?.notificationsEnabled).toBe(false);
      expect(settings?.compactFileCards).toBe(true);
      expect(settings?.defaultCalendarView).toBe("agenda");
      expect(settings?.weekStartsOn).toBe(0);
    });
  });
});
