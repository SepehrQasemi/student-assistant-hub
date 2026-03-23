"use client";

import { useMemo, useState } from "react";
import type { EventClickArg } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { type DateClickArg } from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import multiMonthPlugin from "@fullcalendar/multimonth";
import timeGridPlugin from "@fullcalendar/timegrid";
import { CalendarPlus, Filter, ListChecks } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";

import { EventFormDialog } from "@/components/calendar/event-form-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/providers/i18n-provider";
import { courseRepository, eventRepository, settingsRepository } from "@/lib/repositories";
import { filterEvents, getEventColor } from "@/lib/services/event-query-service";
import type { CalendarEvent, CalendarView, EventType } from "@/types/entities";

const calendarViewMap: Record<Exclude<CalendarView, "agenda">, string> = {
  day: "timeGridDay",
  week: "timeGridWeek",
  month: "dayGridMonth",
  quarter: "multiMonthQuarter",
};

export function CalendarPageClient() {
  const { t } = useI18n();
  const [viewOverride, setViewOverride] = useState<CalendarView | null>(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultStartAt, setDefaultStartAt] = useState<string | null>(null);

  const events = useLiveQuery(() => eventRepository.list(), [], undefined);
  const courses = useLiveQuery(() => courseRepository.list(), [], []);
  const settings = useLiveQuery(() => settingsRepository.get(), [], undefined);
  const view = viewOverride ?? settings?.defaultCalendarView ?? "month";
  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const visibleEvents = useMemo(
    () => filterEvents(events ?? [], courseFilter, typeFilter),
    [courseFilter, events, typeFilter],
  );

  const agendaEvents = useMemo(
    () =>
      visibleEvents
        .filter((event) => event.status !== "done")
        .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
        .slice(0, 20),
    [visibleEvents],
  );

  const calendarEvents = visibleEvents.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startsAt,
    end: event.endsAt,
    allDay: event.allDay,
    backgroundColor: getEventColor(event, courseMap),
    borderColor: getEventColor(event, courseMap),
  }));

  function openCreate(defaultStart?: string | null) {
    setEditingEvent(null);
    setDefaultStartAt(defaultStart ?? null);
    setDialogOpen(true);
  }

  function handleDateClick(arg: DateClickArg) {
    openCreate(arg.date.toISOString());
  }

  function handleEventClick(arg: EventClickArg) {
    const selected = visibleEvents.find((event) => event.id === arg.event.id) ?? null;
    setEditingEvent(selected);
    setDefaultStartAt(null);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("calendar.title")}
        subtitle={t("calendar.subtitle")}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={() => setViewOverride("agenda")}>
              <ListChecks className="h-4 w-4" />
              {t("calendar.viewAgenda")}
            </Button>
            <Button onClick={() => openCreate()}>
              <CalendarPlus className="h-4 w-4" />
              {t("calendar.create")}
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <CardTitle>{t("common.filters")}</CardTitle>
          </div>
          <CardDescription>{t("calendar.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Select value={view} onValueChange={(value) => setViewOverride(value as CalendarView)}>
            <SelectTrigger>
              <SelectValue placeholder={t("common.view")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{t("calendar.viewDay")}</SelectItem>
              <SelectItem value="week">{t("calendar.viewWeek")}</SelectItem>
              <SelectItem value="month">{t("calendar.viewMonth")}</SelectItem>
              <SelectItem value="quarter">{t("calendar.viewQuarter")}</SelectItem>
              <SelectItem value="agenda">{t("calendar.viewAgenda")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger>
              <SelectValue placeholder={t("files.filterByCourse")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EventType | "all")}>
            <SelectTrigger>
              <SelectValue placeholder={t("calendar.fields.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {["personal", "deadline", "exam", "class", "meeting", "other"].map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`eventTypes.${type}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            onClick={() => {
              setViewOverride(null);
              setCourseFilter("all");
              setTypeFilter("all");
            }}
          >
            {t("common.clearFilters")}
          </Button>
        </CardContent>
      </Card>

      {events === undefined ? (
        <Card>
          <CardContent className="py-12 text-sm text-slate-600">{t("common.loading")}</CardContent>
        </Card>
      ) : visibleEvents.length === 0 ? (
        <EmptyState
          title={t("calendar.emptyTitle")}
          description={t("calendar.emptyDescription")}
          action={<Button onClick={() => openCreate()}>{t("calendar.create")}</Button>}
        />
      ) : view === "agenda" ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("calendar.viewAgenda")}</CardTitle>
            <CardDescription>{t("dashboard.eventsThisWeek")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {agendaEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => {
                  setEditingEvent(event);
                  setDialogOpen(true);
                }}
                className="flex w-full items-start justify-between rounded-2xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{t(`eventTypes.${event.type}`)}</Badge>
                    {event.courseId && courseMap.get(event.courseId) ? <Badge variant="muted">{courseMap.get(event.courseId)?.name}</Badge> : null}
                  </div>
                  <h3 className="font-semibold text-slate-900">{event.title}</h3>
                  <p className="text-sm text-slate-600">{new Date(event.startsAt).toLocaleString()}</p>
                </div>
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: getEventColor(event, courseMap) }} />
              </button>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-3 md:p-5">
            <FullCalendar
              key={view}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin, listPlugin]}
              initialView={calendarViewMap[view as Exclude<CalendarView, "agenda">]}
              headerToolbar={false}
              height="auto"
              dayMaxEvents={3}
              nowIndicator
              selectable
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              views={{
                multiMonthQuarter: {
                  type: "multiMonth",
                  duration: { months: 3 },
                  multiMonthMaxColumns: 3,
                },
              }}
              firstDay={settings?.weekStartsOn ?? 1}
            />
          </CardContent>
        </Card>
      )}

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        event={editingEvent}
        courses={courses}
        defaultStartAt={defaultStartAt}
      />
    </div>
  );
}
