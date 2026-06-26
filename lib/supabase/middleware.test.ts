import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { updateSession } from "./middleware";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  })),
}));

function makeRequest(pathname: string) {
  return new NextRequest(new URL(`http://localhost:3000${pathname}`));
}

describe("updateSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null } });
  });

  it.each(["/demo", "/preview", "/week", "/progress"])(
    "allows unauthenticated access to %s",
    async (pathname) => {
      const response = await updateSession(makeRequest(pathname));

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    }
  );

  it("redirects unauthenticated users from protected routes to /login", async () => {
    const response = await updateSession(makeRequest("/upload"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("redirects authenticated users away from /login to /", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "demo@example.com" } },
    });

    const response = await updateSession(makeRequest("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });
});
