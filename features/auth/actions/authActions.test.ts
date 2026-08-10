import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  signUpMock,
  signInWithPasswordMock,
  signInWithOAuthMock,
  signOutMock,
  getUserMock,
  redirectMock,
  revalidatePathMock,
  headersMock,
} = vi.hoisted(() => ({
  signUpMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  signInWithOAuthMock: vi.fn(),
  signOutMock: vi.fn(),
  getUserMock: vi.fn(),
  redirectMock: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  revalidatePathMock: vi.fn(),
  headersMock: vi.fn(
    async () => new Headers({ origin: "http://localhost:3000" })
  ),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: signUpMock,
      signInWithPassword: signInWithPasswordMock,
      signInWithOAuth: signInWithOAuthMock,
      signOut: signOutMock,
      getUser: getUserMock,
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

import { login, signup, signInWithGoogle } from "./authActions";

beforeEach(() => {
  vi.clearAllMocks();
  redirectMock.mockImplementation(() => {
    throw new Error("NEXT_REDIRECT");
  });
  headersMock.mockResolvedValue(
    new Headers({ origin: "http://localhost:3000" })
  );
});

describe("signup", () => {
  it("redirects to / when signUp returns a session", async () => {
    signUpMock.mockResolvedValue({
      data: { session: { access_token: "t" }, user: { id: "u1" } },
      error: null,
    });

    await expect(signup(null, makeForm("a@b.com", "secret1"))).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(signOutMock).not.toHaveBeenCalled();
    expect(revalidatePathMock).toHaveBeenCalledWith("/", "layout");
    expect(redirectMock).toHaveBeenCalledWith("/");
  });

  it("redirects to login when signUp returns no session", async () => {
    signUpMock.mockResolvedValue({
      data: { session: null, user: { id: "u1" } },
      error: null,
    });

    await expect(signup(null, makeForm("a@b.com", "secret1"))).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(signOutMock).not.toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/login?registered=1");
  });

  it("returns an error without redirecting", async () => {
    signUpMock.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "taken" },
    });

    const result = await signup(null, makeForm("a@b.com", "secret1"));

    expect(result).toEqual({ error: "taken" });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("login", () => {
  it("redirects to / on success", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });

    await expect(login(null, makeForm("a@b.com", "secret1"))).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});

describe("signInWithGoogle", () => {
  it("redirects to the OAuth URL", async () => {
    signInWithOAuthMock.mockResolvedValue({
      data: { url: "https://accounts.google.com/o/oauth2" },
      error: null,
    });

    await expect(signInWithGoogle(null, new FormData())).rejects.toThrow(
      "NEXT_REDIRECT"
    );

    expect(signInWithOAuthMock).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback",
      },
    });
    expect(redirectMock).toHaveBeenCalledWith(
      "https://accounts.google.com/o/oauth2"
    );
  });

  it("returns an error when OAuth fails", async () => {
    signInWithOAuthMock.mockResolvedValue({
      data: { url: null },
      error: { message: "provider disabled" },
    });

    const result = await signInWithGoogle(null, new FormData());

    expect(result).toEqual({ error: "provider disabled" });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

function makeForm(email: string, password: string): FormData {
  const form = new FormData();
  form.set("email", email);
  form.set("password", password);
  return form;
}
