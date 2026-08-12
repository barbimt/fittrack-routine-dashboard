import { describe, expect, it } from "vitest";
import { sanitizeAuthRedirectPath } from "./safe-redirect-path";

describe("sanitizeAuthRedirectPath", () => {
  it("allows known app paths", () => {
    expect(sanitizeAuthRedirectPath("/")).toBe("/");
    expect(sanitizeAuthRedirectPath("/editor")).toBe("/editor");
    expect(sanitizeAuthRedirectPath("/upload?x=1")).toBe("/upload");
  });

  it("rejects open-redirect tricks", () => {
    expect(sanitizeAuthRedirectPath("//evil.com")).toBe("/");
    expect(sanitizeAuthRedirectPath("/\\evil")).toBe("/");
    expect(sanitizeAuthRedirectPath("https://evil.com")).toBe("/");
    expect(sanitizeAuthRedirectPath("/login")).toBe("/");
    expect(sanitizeAuthRedirectPath("%2F%2Eevil")).toBe("/");
  });

  it("uses fallback when empty", () => {
    expect(sanitizeAuthRedirectPath(null, "/empty")).toBe("/empty");
    expect(sanitizeAuthRedirectPath("  ", "/demo")).toBe("/demo");
  });
});
