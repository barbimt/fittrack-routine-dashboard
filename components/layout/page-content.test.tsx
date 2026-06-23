import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { PageContent } from "./page-content";

describe("PageContent", () => {
  it("applies default max width and padding", () => {
    const { container } = render(<PageContent>child</PageContent>);
    const el = container.firstElementChild;

    expect(el).toHaveClass("max-w-4xl");
    expect(el).toHaveClass("px-4");
    expect(el).toHaveClass("py-6");
    expect(el).toHaveClass("lg:px-8");
    expect(el).toHaveClass("lg:py-8");
  });

  it("merges Tailwind width and layout overrides via className", () => {
    const { container } = render(
      <PageContent className="max-w-5xl flex-1 lg:px-0">child</PageContent>
    );
    const el = container.firstElementChild;

    expect(el).toHaveClass("max-w-5xl");
    expect(el).not.toHaveClass("max-w-4xl");
    expect(el).toHaveClass("flex-1");
    expect(el).toHaveClass("lg:px-0");
  });
});
