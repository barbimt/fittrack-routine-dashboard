import "@testing-library/jest-dom/vitest";

/**
 * Component tests: import from `@/test/render` (not `@testing-library/react` directly)
 * so i18n/providers can be added in one place. See test/README.md — avoid asserting
 * translated UI strings; prefer roles, aria state, and data-testid.
 */
