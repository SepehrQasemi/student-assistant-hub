import { db } from "@/lib/db/app-db";
import { getDefaultSettings, SETTINGS_KEY } from "@/lib/db/defaults";
import { nowIso } from "@/lib/utils";
import type { AppSettings } from "@/types/entities";

export class SettingsRepository {
  async ensure() {
    const existing = await db.settings.get(SETTINGS_KEY);

    if (existing) {
      return existing;
    }

    const defaults = getDefaultSettings();
    await db.settings.put(defaults);
    return defaults;
  }

  async get() {
    return db.settings.get(SETTINGS_KEY);
  }

  async update(partial: Partial<Omit<AppSettings, "key" | "createdAt">>) {
    const current = await this.ensure();
    const nextSettings: AppSettings = {
      ...current,
      ...partial,
      updatedAt: nowIso(),
    };

    await db.settings.put(nextSettings);
    return nextSettings;
  }
}

export const settingsRepository = new SettingsRepository();
