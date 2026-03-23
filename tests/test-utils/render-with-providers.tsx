import { render, type RenderOptions } from "@testing-library/react";

import { I18nProvider } from "@/lib/providers/i18n-provider";

export function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, {
    wrapper: ({ children }) => <I18nProvider>{children}</I18nProvider>,
    ...options,
  });
}
