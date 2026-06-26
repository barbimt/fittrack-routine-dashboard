import "@testing-library/jest-dom/vitest";

/**
 * Component tests: import from `@/test/render` (not `@testing-library/react` directly)
 * so i18n/providers can be added in one place. Prefer roles, aria state, and data-testid
 * over asserting translated UI strings.
 */
