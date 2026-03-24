import { expect, test, type Locator, type Page } from "@playwright/test";

async function selectOption(page: Page, trigger: Locator, optionName: string) {
  await trigger.click();
  await page.getByRole("option", { name: optionName }).click();
}

test("generates a local quiz, completes it, reopens history, and detects staleness", async ({ page }) => {
  await page.goto("/files");
  await page.getByRole("button", { name: "Import files" }).click();

  const importDialog = page.getByRole("dialog");
  await importDialog.locator("#file-import-input").setInputFiles({
    name: "distributed-quiz-notes.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      [
        "# Distributed Systems",
        "Distributed systems coordinate services across multiple machines.",
        "Distributed systems tolerate failures and network delays.",
        "",
        "# Replication",
        "Replication improves resilience and replication introduces consistency tradeoffs.",
        "",
        "# Consensus",
        "Consensus algorithms help distributed systems agree on a value.",
        "",
        "# Revision",
        "Review replication, consensus, consistency, fault tolerance, and network delays before the exam.",
      ].join("\n"),
    ),
  });
  await selectOption(page, importDialog.getByRole("combobox").nth(1), "Lecture note");
  await importDialog.locator('button[type="submit"]').click();

  await expect(page.getByRole("heading", { name: "distributed-quiz-notes" })).toBeVisible();

  await page.getByRole("button", { name: /distributed-quiz-notes/i }).first().click();
  const detailDialog = page.getByRole("dialog");
  await detailDialog.getByRole("tab", { name: "Quizzes" }).click();

  await selectOption(page, detailDialog.getByRole("combobox").nth(1), "True/false only");
  await detailDialog.getByRole("button", { name: "Generate quiz" }).click();

  await expect(detailDialog.getByText("Quiz history")).toBeVisible();
  await expect(detailDialog.getByRole("link", { name: "Start quiz" })).toBeVisible();

  await Promise.all([
    page.waitForURL(/\/quizzes\/.+$/),
    detailDialog.getByRole("link", { name: "Start quiz" }).click(),
  ]);

  await expect(page.getByRole("button", { name: "Start quiz" })).toBeVisible();
  await page.getByRole("button", { name: "Start quiz" }).click();

  for (let index = 0; index < 5; index += 1) {
    await page.getByRole("button", { name: "True" }).click();

    if (index < 4) {
      await page.getByRole("button", { name: "Next", exact: true }).click();
    }
  }

  await page.getByRole("button", { name: "Submit quiz" }).click();

  await expect(page.getByText("Results and review")).toBeVisible();
  await expect(page.getByText("Explanation:").first()).toBeVisible();

  await selectOption(page, page.locator("header").getByRole("combobox"), "French");
  await expect(page.getByText("Résultats et révision")).toBeVisible();

  await page.getByRole("link", { name: "Retour aux fichiers" }).click();

  await page.getByRole("button", { name: /distributed-quiz-notes/i }).first().click();
  const frenchDialog = page.getByRole("dialog");
  await frenchDialog.getByRole("tab", { name: "Quiz" }).click();

  await expect(frenchDialog.getByText("Historique des quiz")).toBeVisible();
  await expect(frenchDialog.getByText("1 tentative(s)", { exact: true })).toBeVisible();

  await frenchDialog.getByRole("tab", { name: "Détails" }).click();
  await frenchDialog.locator('input[type="file"]').setInputFiles({
    name: "distributed-quiz-notes.md",
    mimeType: "text/markdown",
    buffer: Buffer.from("# Distributed Systems\nUpdated replication guidance and new consistency notes."),
  });
  await frenchDialog.getByRole("button", { name: "Remplacer le fichier source" }).click();

  await frenchDialog.getByRole("tab", { name: "Quiz" }).click();
  await expect(frenchDialog.getByText("Quiz obsolète").first()).toBeVisible();
});
