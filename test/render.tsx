import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * Wrap UI under test. Add i18n (and other) providers here when introduced —
 * use a fixed test locale or mock t() to return keys, not translated copy.
 */
function TestProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: TestProviders, ...options });
}

export * from "@testing-library/react";
