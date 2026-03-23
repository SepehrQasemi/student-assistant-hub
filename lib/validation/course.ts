import { z } from "zod";

export function createCourseSchema(requiredMessage: string) {
  return z.object({
    name: z.string().trim().min(1, requiredMessage),
    code: z.string().trim().max(20),
    instructor: z.string().trim().max(80),
    semester: z.string().trim().max(40),
    color: z.string().trim().min(1, requiredMessage),
    notes: z.string().trim().max(1000),
  });
}

export type CourseSchema = ReturnType<typeof createCourseSchema>;
