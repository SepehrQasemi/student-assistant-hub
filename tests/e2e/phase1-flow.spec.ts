import { expect, test, type Locator, type Page } from "@playwright/test";

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function selectOption(page: Page, trigger: Locator, optionName: string) {
  await trigger.click();
  await page.getByRole("option", { name: optionName }).click();
}

test("completes the offline-first Phase 1 workflow", async ({ page }) => {
  const eventStart = new Date();
  eventStart.setDate(eventStart.getDate() + 1);
  eventStart.setHours(14, 0, 0, 0);

  const eventEnd = new Date(eventStart);
  eventEnd.setHours(eventEnd.getHours() + 2);

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.goto("/courses");
  await page.getByRole("button", { name: "Create course" }).click();

  const courseDialog = page.getByRole("dialog");
  await courseDialog.getByLabel("Name").fill("Distributed Systems");
  await courseDialog.getByLabel("Code").fill("MIAGE-DS");
  await courseDialog.getByLabel("Instructor").fill("Dr Martin");
  await courseDialog.getByLabel("Semester").fill("Spring 2026");
  await courseDialog.getByLabel("Color").fill("#2563eb");
  await courseDialog.getByLabel("Notes").fill("Core MIAGE distributed systems course.");
  await courseDialog.getByRole("button", { name: "Save" }).click();

  await expect(page.getByRole("heading", { name: "Distributed Systems" })).toBeVisible();

  await page.goto("/files");
  await page.getByRole("button", { name: "Import files" }).click();

  const fileDialog = page.getByRole("dialog");
  await fileDialog.locator("#file-import-input").setInputFiles({
    name: "exam-topics.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Consensus, replication, vector clocks"),
  });
  await selectOption(page, fileDialog.getByRole("combobox").nth(0), "Distributed Systems");
  await selectOption(page, fileDialog.getByRole("combobox").nth(1), "Exam material");
  await fileDialog.getByLabel("Notes").fill("Revision outline for the midterm.");
  await fileDialog.locator('button[type="submit"]').click();

  await expect(page.getByRole("heading", { name: "exam-topics" })).toBeVisible();
  await expect(page.getByText("Distributed Systems").first()).toBeVisible();

  await page.goto("/calendar");
  await page.getByRole("button", { name: "Create event" }).click();

  const eventDialog = page.getByRole("dialog");
  await eventDialog.getByLabel("Title").fill("Distributed Systems Midterm");
  await selectOption(page, eventDialog.getByRole("combobox").nth(0), "Exam");
  await selectOption(page, eventDialog.getByRole("combobox").nth(1), "Distributed Systems");
  await eventDialog.getByLabel("Starts at").fill(toLocalInputValue(eventStart));
  await eventDialog.getByLabel("Ends at").fill(toLocalInputValue(eventEnd));
  await eventDialog.getByLabel("Location").fill("Campus A");
  await eventDialog.getByLabel("Description").fill("Final revision session and exam.");
  await eventDialog.getByRole("button", { name: "Add reminder" }).click();
  await eventDialog.locator('input[type="number"]').nth(0).fill("30");
  await eventDialog.getByRole("button", { name: "Add reminder" }).click();
  await eventDialog.locator('input[type="number"]').nth(1).fill("120");
  await eventDialog.getByRole("button", { name: "Save" }).click();

  await page.getByRole("button", { name: "Agenda" }).click();
  await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible();
  await expect(page.getByText("Distributed Systems Midterm")).toBeVisible();

  await selectOption(page, page.locator("header").getByRole("combobox"), "French");
  await expect(page.getByRole("link", { name: "Tableau de bord" })).toBeVisible();

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible();
  await expect(page.getByText("Fichiers récents")).toBeVisible();
  await expect(page.getByText("exam-topics").first()).toBeVisible();
  await expect(page.getByText("Distributed Systems Midterm").first()).toBeVisible();
  await expect(page.getByText("Rappels à venir")).toBeVisible();
  await expect(page.getByText("Aucun rappel pour le moment")).not.toBeVisible();
});
