import { getMessage, t } from "@/lib/i18n";

describe("i18n utilities", () => {
  it("returns translated strings for supported locales", () => {
    expect(getMessage("en", "navigation.dashboard")).toBe("Dashboard");
    expect(getMessage("fr", "navigation.dashboard")).toBe("Tableau de bord");
  });

  it("falls back to the key for unknown values", () => {
    expect(getMessage("en", "missing.path")).toBe("missing.path");
  });

  it("interpolates parameters when present", () => {
    expect(t("en", "common.appName")).toBe("Student Assistant Hub");
  });
});
