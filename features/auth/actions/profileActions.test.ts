import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const getUserMock = vi.fn();
const maybeSingleMock = vi.fn();
const updateEqMock = vi.fn();
const updateMock = vi.fn(() => ({ eq: updateEqMock }));
const selectMock = vi.fn(() => ({
  eq: vi.fn(() => ({ maybeSingle: maybeSingleMock })),
}));
const fromMock = vi.fn(() => ({
  select: selectMock,
  update: updateMock,
}));
const updateUserMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
      updateUser: updateUserMock,
    },
    from: fromMock,
  })),
}));

import { getUserProfile, updateUserProfile } from "./profileActions";

describe("profileActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserMock.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "alex@example.com",
          user_metadata: {},
        },
      },
    });
    maybeSingleMock.mockResolvedValue({
      data: { display_name: "Alex", email: "alex@example.com" },
      error: null,
    });
    updateEqMock.mockResolvedValue({ error: null });
    updateUserMock.mockResolvedValue({ data: {}, error: null });
  });

  it("loads display name and email from profile + auth", async () => {
    const profile = await getUserProfile();
    expect(profile).toEqual({
      email: "alex@example.com",
      displayName: "Alex",
    });
  });

  it("updates display name on profiles and auth metadata", async () => {
    const result = await updateUserProfile({
      displayName: "Alex Rivera",
      email: "alex@example.com",
    });

    expect(result).toEqual({ ok: true, emailChangePending: false });
    expect(fromMock).toHaveBeenCalledWith("profiles");
    expect(updateMock).toHaveBeenCalledWith({
      display_name: "Alex Rivera",
      email: "alex@example.com",
    });
    expect(updateUserMock).toHaveBeenCalledWith({
      data: {
        display_name: "Alex Rivera",
        full_name: "Alex Rivera",
      },
    });
  });

  it("requests email change confirmation when email differs", async () => {
    const result = await updateUserProfile({
      displayName: "Alex",
      email: "new@example.com",
    });

    expect(result).toEqual({ ok: true, emailChangePending: true });
    expect(updateMock).toHaveBeenCalledWith({
      display_name: "Alex",
    });
    expect(updateUserMock).toHaveBeenCalledWith({
      email: "new@example.com",
      data: {
        display_name: "Alex",
        full_name: "Alex",
      },
    });
  });

  it("rejects an empty display name", async () => {
    const result = await updateUserProfile({
      displayName: "   ",
      email: "alex@example.com",
    });
    expect(result).toEqual({
      ok: false,
      error: "Display name is required.",
    });
  });
});
