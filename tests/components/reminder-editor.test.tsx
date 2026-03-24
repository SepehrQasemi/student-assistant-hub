import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";

import { ReminderEditor } from "@/components/reminders/reminder-editor";
import { renderWithProviders } from "@/tests/test-utils/render-with-providers";
import type { ReminderFormValue } from "@/types/entities";

function ReminderHarness() {
  const [reminders, setReminders] = useState<ReminderFormValue[]>([]);
  return <ReminderEditor reminders={reminders} onChange={setReminders} />;
}

describe("ReminderEditor", () => {
  it("adds, edits, and removes reminders", async () => {
    renderWithProviders(<ReminderHarness />);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Add reminder" }));

    expect(screen.getByDisplayValue("15")).toBeInTheDocument();

    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "45");
    expect(screen.getByDisplayValue("45")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("No reminders yet")).toBeInTheDocument();
  });
});
