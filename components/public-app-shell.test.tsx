import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import { renderWithProviders } from "@/test/render";
import { PublicAppShell } from "@/components/public-app-shell";
import { publicNavItems } from "@/components/layout/public-nav-items";
import { navItems } from "@/components/layout/sidebar";

const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/demo",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
  }),
}));

vi.mock("@/features/auth/components/LogoutButton", () => ({
  LogoutButton: () => <button type="button">Log out</button>,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeEach(() => {
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
});

describe("PublicAppShell", () => {
  it("shows public nav and sign-up CTA for visitors", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    renderWithProviders(
      <PublicAppShell>
        <p>Demo content</p>
      </PublicAppShell>
    );

    await waitFor(() => {
      expect(screen.getByText("Demo content")).toBeInTheDocument();
    });

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    for (const item of publicNavItems) {
      expect(
        within(nav).getByRole("link", { name: item.label })
      ).toBeInTheDocument();
    }

    expect(
      screen.getByRole("link", { name: "Create free account" })
    ).toHaveAttribute("href", "/signup");
    expect(
      screen.queryByRole("button", { name: "Log out" })
    ).not.toBeInTheDocument();
  });

  it("shows full app nav when the visitor is authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "demo@example.com" } },
    });

    renderWithProviders(
      <PublicAppShell>
        <p>Authenticated demo view</p>
      </PublicAppShell>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Log out" })
      ).toBeInTheDocument();
    });

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    for (const item of navItems) {
      expect(
        within(nav).getByRole("link", { name: item.label })
      ).toBeInTheDocument();
    }

    expect(
      screen.queryByRole("link", { name: "Create free account" })
    ).not.toBeInTheDocument();
  });
});
