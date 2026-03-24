import { isFingerprintStale } from "@/lib/services/summary-staleness";

describe("summary staleness", () => {
  it("detects when fingerprints differ", () => {
    expect(isFingerprintStale("abc", "abc")).toBe(false);
    expect(isFingerprintStale("abc", "def")).toBe(true);
  });
});
