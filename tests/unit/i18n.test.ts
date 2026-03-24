import { enMessages } from "@/lib/i18n/messages/en";
import { frMessages } from "@/lib/i18n/messages/fr";
import { getMessage, supportedLocales, t } from "@/lib/i18n";

function collectKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

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

  it("keeps the English and French dictionaries in key parity", () => {
    const englishKeys = collectKeys(enMessages).sort();
    const frenchKeys = collectKeys(frMessages).sort();

    expect(supportedLocales).toEqual(["en", "fr"]);
    expect(frenchKeys).toEqual(englishKeys);
  });
});
