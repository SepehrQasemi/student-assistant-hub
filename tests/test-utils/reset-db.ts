import { db } from "@/lib/db/app-db";

export async function resetDb() {
  await db.transaction("rw", [db.courses, db.files, db.fileBlobs, db.tags, db.events, db.reminders, db.notifications, db.settings], async () => {
    await Promise.all([
      db.courses.clear(),
      db.files.clear(),
      db.fileBlobs.clear(),
      db.tags.clear(),
      db.events.clear(),
      db.reminders.clear(),
      db.notifications.clear(),
      db.settings.clear(),
    ]);
  });
}
