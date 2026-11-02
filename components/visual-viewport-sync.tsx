"use client";

import { useEffect } from "react";
import {
  scrollActiveFieldIntoRegion,
  syncVisualViewport,
} from "@/lib/visual-viewport";

/**
 * iOS Chrome pans the visual viewport when the keyboard opens and leaves a blank
 * band if the page is sized with dvh. Track the visible viewport and keep the
 * focused field inside its own scroller instead of scrolling the document.
 */
export function VisualViewportSync() {
  useEffect(() => {
    let frame = 0;
    let focusTimer = 0;

    const apply = () => {
      syncVisualViewport();
      scrollActiveFieldIntoRegion();
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };

    const onFocusIn = () => {
      schedule();
      window.clearTimeout(focusTimer);
      focusTimer = window.setTimeout(schedule, 300);
    };

    schedule();
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("orientationchange", schedule);
    document.addEventListener("focusin", onFocusIn);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(focusTimer);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("orientationchange", schedule);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return null;
}
