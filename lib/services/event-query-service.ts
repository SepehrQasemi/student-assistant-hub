import type { CalendarEvent, Course, EventType } from "@/types/entities";

const fallbackColors: Record<EventType, string> = {
  personal: "#64748b",
  deadline: "#dc2626",
  exam: "#7c3aed",
  class: "#0f766e",
  meeting: "#ea580c",
  other: "#475569",
};

export function filterEvents(events: CalendarEvent[], courseId: string, type: EventType | "all") {
  return events.filter((event) => {
    const matchesCourse = courseId === "all" || event.courseId === courseId;
    const matchesType = type === "all" || event.type === type;

    return !event.deletedAt && matchesCourse && matchesType;
  });
}

export function getEventColor(event: CalendarEvent, courseMap: Map<string, Course>) {
  if (event.courseId && courseMap.get(event.courseId)?.color) {
    return courseMap.get(event.courseId)!.color;
  }

  return fallbackColors[event.type];
}
