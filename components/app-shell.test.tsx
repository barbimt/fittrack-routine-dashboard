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
    expect(document.querySelector("main")).toHaveClass("safe-area-pb");
  });

  it("docks bottomChrome outside the scroll region", () => {
    renderWithProviders(
      <AppShell bottomChrome={<button type="button">Save</button>}>
        <p>Page content</p>
      </AppShell>
    );

    const main = document.querySelector("main");
    expect(main).not.toHaveClass("safe-area-pb");
    expect(main?.querySelector(".app-bottom-chrome")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("keeps page content in the scroll region when bottomChrome is set", () => {
    const { container } = renderWithProviders(
      <AppShell bottomChrome={<div>Chrome</div>}>
        <h1>Routine Editor</h1>
      </AppShell>
    );

    const scrollRegion = container.querySelector("main > div.h-0");
    expect(scrollRegion).toBeTruthy();
    expect(scrollRegion).toHaveTextContent("Routine Editor");
    expect(scrollRegion).not.toHaveTextContent("Chrome");
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
