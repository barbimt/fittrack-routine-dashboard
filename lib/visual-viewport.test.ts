import { describe, expect, it } from "vitest";
import {
  readVisualViewportMetrics,
  scrollFieldWithin,
} from "./visual-viewport";

describe("readVisualViewportMetrics", () => {
  it("uses the visual viewport when the keyboard shrinks it", () => {
    expect(
      readVisualViewportMetrics({
        visualHeight: 420.4,
        offsetTop: 96.6,
        layoutHeight: 852,
      })
    ).toEqual({ height: 420, offsetTop: 97 });
  });

  it("falls back to the layout height before the visual viewport exists", () => {
    expect(
      readVisualViewportMetrics({
        visualHeight: null,
        offsetTop: null,
        layoutHeight: 800,
      })
    ).toEqual({ height: 800, offsetTop: 0 });
  });
});

describe("scrollFieldWithin", () => {
  function mockRect(top: number, bottom: number) {
    return {
      top,
      bottom,
      left: 0,
      right: 0,
      width: 0,
      height: bottom - top,
      x: 0,
      y: top,
      toJSON() {
        return {};
      },
    } as DOMRect;
  }

  it("scrolls a field that sits below the visible region into view", () => {
    const scroller = document.createElement("div");
    const field = document.createElement("input");
    scroller.appendChild(field);
    scroller.scrollTop = 40;

    viRect(scroller, mockRect(100, 300));
    viRect(field, mockRect(280, 340));

    scrollFieldWithin(field, scroller, 12);

    expect(scroller.scrollTop).toBe(40 + (340 - (300 - 12)));
  });

  it("scrolls a field that sits above the visible region into view", () => {
    const scroller = document.createElement("div");
    const field = document.createElement("input");
    scroller.appendChild(field);
    scroller.scrollTop = 80;

    viRect(scroller, mockRect(100, 300));
    viRect(field, mockRect(40, 80));

    scrollFieldWithin(field, scroller, 12);

    expect(scroller.scrollTop).toBe(80 - (100 + 12 - 40));
  });
});

function viRect(element: HTMLElement, rect: DOMRect) {
  element.getBoundingClientRect = () => rect;
}
