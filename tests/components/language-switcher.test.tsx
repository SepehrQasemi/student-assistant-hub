import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useI18n } from "@/lib/providers/i18n-provider";
import { settingsRepository } from "@/lib/repositories";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import { resetDb } from "@/tests/test-utils/reset-db";

function LocaleProbe() {
  const { t } = useI18n();
  return <p>{t("navigation.dashboard")}</p>;
}

describe("LanguageSwitcher", () => {
  beforeEach(async () => {
    await resetDb();
    await settingsRepository.ensure();
  });

  it("switches the visible language", async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <>
        <LanguageSwitcher />
        <LocaleProbe />
      </>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "French" }));

    await waitFor(() => {
      expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
    });
  });
});
