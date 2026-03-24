import { formatBytes, formatLocalizedDate, formatLocalizedDateTime, getFileExtension, getIntlLocale } from "@/lib/utils";

describe("utility helpers", () => {
  it("formats bytes conservatively", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(15 * 1024 * 1024)).toBe("15 MB");
  });

  it("extracts file extensions safely", () => {
    expect(getFileExtension("notes.md")).toBe("md");
    expect(getFileExtension("archive")).toBe("");
  });

  it("maps supported locales to Intl locale identifiers", () => {
    expect(getIntlLocale("en")).toBe("en-US");
    expect(getIntlLocale("fr")).toBe("fr-FR");
  });

  it("formats localized dates consistently", () => {
    const value = "2026-03-24T10:30:00.000Z";

    expect(formatLocalizedDate(value, "en")).not.toEqual(formatLocalizedDate(value, "fr"));
    expect(formatLocalizedDateTime(value, "en")).not.toEqual(formatLocalizedDateTime(value, "fr"));
  });
});
