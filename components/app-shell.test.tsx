import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render";
import { AppShell } from "@/components/app-shell";
import { navItems } from "@/components/layout/sidebar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

afterEach(() => {
  cleanup();
});

describe("AppShell", () => {
  it("does not render the removed mobile bottom tab bar", () => {
    renderWithProviders(
      <AppShell>
        <p>Page content</p>
      </AppShell>
    );

    expect(
      screen.queryByRole("navigation", { name: "Mobile navigation" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
    expect(document.querySelector("header")).toHaveClass("safe-area-pt");
  });

  it("opens the hamburger drawer with all sidebar nav links", async () => {
    renderWithProviders(
      <AppShell>
        <p>Dashboard</p>
      </AppShell>
    );

    const drawer = screen.getByLabelText("Mobile navigation menu");
    expect(drawer).toHaveAttribute("aria-hidden", "true");

    await userEvent.click(
      screen.getByRole("button", { name: "Open navigation menu" })
    );

    expect(drawer).toHaveAttribute("aria-hidden", "false");

    const nav = within(drawer).getByRole("navigation", {
      name: "Main navigation",
    });
    for (const item of navItems) {
      expect(
        within(nav).getByRole("link", { name: item.label })
      ).toBeInTheDocument();
    }
  });
});
