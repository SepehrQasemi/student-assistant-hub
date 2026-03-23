"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "dexie-react-hooks";
import { type FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ReminderEditor } from "@/components/reminders/reminder-editor";
import { useI18n } from "@/lib/providers/i18n-provider";
import { eventRepository, reminderRepository } from "@/lib/repositories";
import { calculateReminderSchedule } from "@/lib/services/reminder-engine";
import { createEventSchema } from "@/lib/validation/event";
import { fromDateTimeInputValue, toDateTimeInputValue } from "@/lib/utils";
import type { CalendarEvent, Course, ReminderFormValue } from "@/types/entities";

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  courses,
  defaultStartAt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null;
  courses: Course[];
  defaultStartAt?: string | null;
}) {
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<ReminderFormValue[]>([]);
  const schema = createEventSchema(t("validation.required"), t("validation.invalidDateRange"));
  type EventFormValues = z.infer<typeof schema>;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      type: "class",
      courseId: null,
      startsAt: toDateTimeInputValue(new Date().toISOString()),
      endsAt: toDateTimeInputValue(new Date(Date.now() + 60 * 60 * 1000).toISOString()),
      allDay: false,
      location: "",
      description: "",
      status: "scheduled",
    },
  });

  const existingReminders = useLiveQuery(
    () => (event ? reminderRepository.listByEvent(event.id) : Promise.resolve([])),
    [event?.id],
    [],
  );

  useEffect(() => {
    form.register("type");
    form.register("courseId");
    form.register("allDay");
    form.register("status");
  }, [form]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const startAt = event?.startsAt ?? defaultStartAt ?? new Date().toISOString();
    const endAt = event?.endsAt ?? new Date(new Date(startAt).getTime() + 60 * 60 * 1000).toISOString();

    form.reset({
      title: event?.title ?? "",
      type: event?.type ?? "class",
      courseId: event?.courseId ?? null,
      startsAt: toDateTimeInputValue(startAt),
      endsAt: toDateTimeInputValue(endAt),
      allDay: event?.allDay ?? false,
      location: event?.location ?? "",
      description: event?.description ?? "",
      status: event?.status ?? "scheduled",
    });
    setSubmitError(null);
  }, [defaultStartAt, event, form, open]);

  useEffect(() => {
    if (event) {
      setReminders(
        existingReminders.map((reminder) => ({
          id: reminder.id,
          mode: reminder.mode,
          offsetMinutes: reminder.offsetMinutes,
          scheduledFor: reminder.scheduledFor,
        })),
      );
      return;
    }

    setReminders([]);
  }, [event, existingReminders]);

  async function handleSubmit(values: EventFormValues) {
    setSubmitError(null);
    setIsSaving(true);

    try {
      const savedEvent = await eventRepository.save(
        {
          title: values.title,
          description: values.description,
          type: values.type,
          courseId: values.courseId,
          startsAt: fromDateTimeInputValue(values.startsAt),
          endsAt: fromDateTimeInputValue(values.endsAt),
          allDay: values.allDay,
          location: values.location,
          status: values.status,
        },
        event?.id,
      );
      await reminderRepository.replaceForEvent(
        savedEvent.id,
        reminders.map((reminder) => ({
          ...reminder,
          scheduledFor: calculateReminderSchedule(savedEvent.startsAt, reminder),
        })),
      );
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleInvalid(errors: FieldErrors<EventFormValues>) {
    const firstMessage = Object.values(errors)
      .map((error) => error?.message)
      .find((message): message is string => Boolean(message));

    setSubmitError(firstMessage ?? t("validation.reviewForm"));
  }

  async function handleDelete() {
    if (!event) {
      return;
    }

    if (!window.confirm(t("calendar.delete"))) {
      return;
    }

    await Promise.all([eventRepository.remove(event.id), reminderRepository.removeByEvent(event.id)]);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? t("calendar.edit") : t("calendar.create")}</DialogTitle>
          <DialogDescription>{t("calendar.subtitle")}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}>
          {submitError ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}
          <div className="space-y-2">
            <Label htmlFor="event-title">{t("calendar.fields.title")}</Label>
            <Input id="event-title" {...form.register("title")} />
            {form.formState.errors.title ? <p className="text-xs text-red-600">{form.formState.errors.title.message}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("calendar.fields.type")}</Label>
              <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value as EventFormValues["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["personal", "deadline", "exam", "class", "meeting", "other"].map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`eventTypes.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("files.assignCourse")}</Label>
              <Select
                value={form.watch("courseId") ?? "none"}
                onValueChange={(value) => form.setValue("courseId", value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("common.all")}</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-start">{t("calendar.fields.startsAt")}</Label>
              <Input id="event-start" type="datetime-local" {...form.register("startsAt")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-end">{t("calendar.fields.endsAt")}</Label>
              <Input id="event-end" type="datetime-local" {...form.register("endsAt")} />
              {form.formState.errors.endsAt ? <p className="text-xs text-red-600">{form.formState.errors.endsAt.message}</p> : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-location">{t("calendar.fields.location")}</Label>
              <Input id="event-location" {...form.register("location")} />
            </div>
            <div className="space-y-2">
              <Label>{t("common.status")}</Label>
              <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as EventFormValues["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">{t("calendar.status.scheduled")}</SelectItem>
                  <SelectItem value="done">{t("calendar.status.done")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <Label htmlFor="event-all-day">{t("calendar.fields.allDay")}</Label>
            </div>
            <Switch
              id="event-all-day"
              checked={form.watch("allDay")}
              onCheckedChange={(checked) => form.setValue("allDay", checked, { shouldDirty: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">{t("calendar.fields.description")}</Label>
            <Textarea id="event-description" {...form.register("description")} />
          </div>

          <ReminderEditor reminders={reminders} onChange={setReminders} />

          <DialogFooter>
            {event ? (
              <Button type="button" variant="danger" onClick={() => void handleDelete()} className="mr-auto">
                {t("common.delete")}
              </Button>
            ) : null}
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
