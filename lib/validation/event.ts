import { z } from "zod";

export function createEventSchema(requiredMessage: string, invalidDateRangeMessage: string) {
  return z
    .object({
      title: z.string().trim().min(1, requiredMessage),
      type: z.enum(["personal", "deadline", "exam", "class", "meeting", "other"]),
      courseId: z.string().nullable(),
      startsAt: z.string().trim().min(1, requiredMessage),
      endsAt: z.string().trim().min(1, requiredMessage),
      allDay: z.boolean(),
      location: z.string().trim().max(120),
      description: z.string().trim().max(2000),
      status: z.enum(["scheduled", "done"]),
    })
    .refine((value) => new Date(value.endsAt) >= new Date(value.startsAt), {
      message: invalidDateRangeMessage,
      path: ["endsAt"],
    });
}
