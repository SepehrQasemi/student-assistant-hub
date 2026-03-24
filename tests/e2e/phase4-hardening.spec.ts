import { expect, test, type Locator, type Page } from "@playwright/test";

async function selectOption(page: Page, trigger: Locator, optionName: string) {
  await trigger.click();
  await page.getByRole("option", { name: optionName }).click();
}

test.describe("Phase 4 hardening flows", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("persists settings and handles unsupported documents on a smaller viewport", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    const main = page.locator("main");

    await selectOption(page, main.getByRole("combobox").nth(1), "Agenda");
    await selectOption(page, main.getByRole("combobox").nth(2), "Sunday");
    await main.getByRole("switch").nth(1).click();

    await page.reload();
    await expect(main.getByRole("combobox").nth(1)).toContainText("Agenda");
    await expect(main.getByRole("combobox").nth(2)).toContainText("Sunday");

    await page.getByRole("link", { name: "Files" }).click();
    await page.getByRole("button", { name: "Import files" }).click();

    const importDialog = page.getByRole("dialog");
    await importDialog.locator("#file-import-input").setInputFiles({
      name: "archive.zip",
      mimeType: "application/zip",
      buffer: Buffer.from([1, 2, 3, 4, 5]),
    });
    await selectOption(page, importDialog.getByRole("combobox").nth(1), "Other");
    await importDialog.locator('button[type="submit"]').click();

    await expect(page.getByText("archive").first()).toBeVisible();
    await page.getByRole("button", { name: /archive/i }).first().click();

    const detailDialog = page.getByRole("dialog");
    await detailDialog.getByRole("tab", { name: "Summaries" }).click();
    await detailDialog.getByRole("button", { name: "Quick summary" }).click();
    await expect(detailDialog.getByText("This file format is not supported for local summarization in Phase 2.")).toBeVisible();

    await detailDialog.getByRole("tab", { name: "Quizzes" }).click();
    await detailDialog.getByRole("button", { name: "Generate quiz" }).click();
    await expect(detailDialog.getByText("This file type is not supported for local quiz generation.")).toBeVisible();

    await page.reload();
    await expect(page.getByText("archive").first()).toBeVisible();
  });
});
