import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/features/auth/components/LogoutButton", () => ({
  LogoutButton: () => null,
}));

import { DashboardEmptyState } from "@/components/fitness/dashboard-empty-state";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DashboardEmptyState", () => {
  it("offers import and create-from-scratch actions", async () => {
    const user = userEvent.setup();
    render(<DashboardEmptyState />);

    expect(
      screen.getByRole("heading", { name: /choose how to start/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /import routine/i }));
    expect(pushMock).toHaveBeenCalledWith("/upload");

    await user.click(
      screen.getByRole("button", { name: /create from scratch/i })
    );
    expect(pushMock).toHaveBeenCalledWith("/editor");

    expect(
      screen.getByRole("link", { name: /preview example/i })
    ).toHaveAttribute("href", "/demo");

    expect(
      screen.queryByRole("button", { name: /use sample routine/i })
    ).not.toBeInTheDocument();
  });
});
