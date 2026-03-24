import { expect, test, type Locator, type Page } from "@playwright/test";

async function selectOption(page: Page, trigger: Locator, optionName: string) {
  await trigger.click();
  await page.getByRole("option", { name: optionName }).click();
}

test("generates local summaries and reopens them after reload", async ({ page }) => {
  await page.goto("/files");
  await page.getByRole("button", { name: "Import files" }).click();

  const importDialog = page.getByRole("dialog");
  await importDialog.locator("#file-import-input").setInputFiles({
    name: "distributed-notes.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      [
        "# Distributed Systems",
        "Distributed systems coordinate nodes over unreliable networks.",
        "",
        "# Replication",
        "Replication improves resilience but introduces consistency tradeoffs.",
        "",
        "# Revision",
        "Review consensus, replication, and consistency before the exam.",
      ].join("\n"),
    ),
  });
  await selectOption(page, importDialog.getByRole("combobox").nth(1), "Lecture note");
  await importDialog.locator('button[type="submit"]').click();

  await expect(page.getByRole("heading", { name: "distributed-notes" })).toBeVisible();

  await page.getByRole("button", { name: /distributed-notes/i }).first().click();

  const detailDialog = page.getByRole("dialog");
  await detailDialog.getByRole("tab", { name: "Summaries" }).click();

  await detailDialog.getByRole("button", { name: "Quick summary" }).click();
  await expect(detailDialog.getByText("Summary history")).toBeVisible();
  await expect(detailDialog.getByText("Current")).toBeVisible();

  await detailDialog.getByRole("button", { name: "Structured summary" }).click();
  await expect(detailDialog.getByText("Main topics")).toBeVisible();
  await expect(detailDialog.getByText("Key ideas")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(detailDialog).not.toBeVisible();

  await page.reload();
  await selectOption(page, page.locator("header").getByRole("combobox"), "French");
  await expect(page.getByRole("link", { name: "Fichiers" })).toBeVisible();

  await page.getByRole("button", { name: /distributed-notes/i }).first().click();
  const frenchDialog = page.getByRole("dialog");
  await frenchDialog.getByRole("tab", { name: "Resumes" }).click();

  await expect(frenchDialog.getByText("Historique des resumes")).toBeVisible();
  await expect(frenchDialog.getByText("Vue d'ensemble")).toBeVisible();
  await expect(frenchDialog.getByRole("button", { name: /Resume rapide Actuel/i })).toBeVisible();
});
