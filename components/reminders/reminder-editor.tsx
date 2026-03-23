"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/providers/i18n-provider";
import { fromDateTimeInputValue, toDateTimeInputValue } from "@/lib/utils";
import type { ReminderFormValue } from "@/types/entities";

export function ReminderEditor({
  reminders,
  onChange,
}: {
  reminders: ReminderFormValue[];
  onChange: (reminders: ReminderFormValue[]) => void;
}) {
  const { t } = useI18n();

  function updateReminder(id: string, nextReminder: Partial<ReminderFormValue>) {
    onChange(reminders.map((reminder) => (reminder.id === id ? { ...reminder, ...nextReminder } : reminder)));
  }

  function addReminder() {
    onChange([
      ...reminders,
      {
        id: globalThis.crypto.randomUUID(),
        mode: "offset",
        offsetMinutes: 15,
        scheduledFor: new Date().toISOString(),
      },
    ]);
  }

  function removeReminder(id: string) {
    onChange(reminders.filter((reminder) => reminder.id !== id));
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{t("reminders.title")}</h3>
          <p className="text-sm text-slate-600">{t("reminders.limitations")}</p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addReminder}>
          <Plus className="h-4 w-4" />
          {t("reminders.add")}
        </Button>
      </div>

      {reminders.length === 0 ? (
        <p className="text-sm text-slate-500">{t("reminders.empty")}</p>
      ) : (
        reminders.map((reminder) => (
          <div key={reminder.id} className="grid gap-3 rounded-[20px] border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2">
              <Label>{t("reminders.title")}</Label>
              <Select
                value={reminder.mode}
                onValueChange={(value) =>
                  updateReminder(reminder.id, {
                    mode: value as ReminderFormValue["mode"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offset">{t("reminders.offset")}</SelectItem>
                  <SelectItem value="absolute">{t("reminders.customTime")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reminder.mode === "offset" ? (
              <div className="space-y-2">
                <Label>{t("reminders.offsetMinutes")}</Label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={reminder.offsetMinutes ?? 15}
                  onChange={(event) => updateReminder(reminder.id, { offsetMinutes: Number(event.target.value) })}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{t("reminders.customTime")}</Label>
                <Input
                  type="datetime-local"
                  value={toDateTimeInputValue(reminder.scheduledFor)}
                  onChange={(event) => updateReminder(reminder.id, { scheduledFor: fromDateTimeInputValue(event.target.value) })}
                />
              </div>
            )}

            <div className="flex items-end">
              <Button type="button" variant="ghost" size="icon" onClick={() => removeReminder(reminder.id)} aria-label={t("common.delete")}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
