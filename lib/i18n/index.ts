import { enMessages } from "@/lib/i18n/messages/en";
import { frMessages } from "@/lib/i18n/messages/fr";
import type { Locale } from "@/types/entities";
import type { MessageDictionary, MessageValue } from "@/types/i18n";

export const messages = {
  en: enMessages,
  fr: frMessages,
} satisfies Record<Locale, MessageDictionary>;

export type TranslationMessages = typeof enMessages;

export function getMessage(locale: Locale, key: string): string {
  const segments = key.split(".");
  let current: MessageValue = messages[locale];

  for (const segment of segments) {
    if (typeof current !== "object" || current === null || !(segment in current)) {
      return key;
    }

    current = current[segment];
  }

  return typeof current === "string" ? current : key;
}

export function t(locale: Locale, key: string, params?: Record<string, string | number>) {
  const template = getMessage(locale, key);

  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (accumulator, [paramKey, value]) => accumulator.replaceAll(`{${paramKey}}`, String(value)),
    template,
  );
}

export const supportedLocales: Locale[] = ["en", "fr"];
