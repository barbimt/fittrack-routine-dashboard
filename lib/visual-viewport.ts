export interface VisualViewportMetrics {
  height: number;
  offsetTop: number;
}

export function readVisualViewportMetrics(input: {
  visualHeight: number | null;
  offsetTop: number | null;
  layoutHeight: number;
}): VisualViewportMetrics {
  const height = input.visualHeight ?? input.layoutHeight;
  const offsetTop = input.offsetTop ?? 0;

  return {
    height: Math.max(0, Math.round(height)),
    offsetTop: Math.max(0, Math.round(offsetTop)),
  };
}

export function applyVisualViewportMetrics(
  root: HTMLElement,
  metrics: VisualViewportMetrics
) {
  const height = `${metrics.height}px`;
  const offsetTop = `${metrics.offsetTop}px`;

  if (root.style.getPropertyValue("--vv-height") !== height) {
    root.style.setProperty("--vv-height", height);
  }
  if (root.style.getPropertyValue("--vv-offset-top") !== offsetTop) {
    root.style.setProperty("--vv-offset-top", offsetTop);
  }
}

/** Keep a focused field inside its own scroller. Avoids window scrollIntoView, which pans iOS Chrome. */
export function scrollFieldWithin(
  field: HTMLElement,
  scroller: HTMLElement,
  padding = 12
) {
  const fieldRect = field.getBoundingClientRect();
  const scrollerRect = scroller.getBoundingClientRect();
  const below = fieldRect.bottom - (scrollerRect.bottom - padding);
  const above = scrollerRect.top + padding - fieldRect.top;

  if (below > 0) {
    scroller.scrollTop += below;
  } else if (above > 0) {
    scroller.scrollTop -= above;
  }
}

export function syncVisualViewport(
  root: HTMLElement = document.documentElement
) {
  const viewport = window.visualViewport;
  applyVisualViewportMetrics(
    root,
    readVisualViewportMetrics({
      visualHeight: viewport?.height ?? null,
      offsetTop: viewport?.offsetTop ?? null,
      layoutHeight: window.innerHeight,
    })
  );
}

export function scrollActiveFieldIntoRegion() {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return;
  if (!active.matches("input, textarea, select")) return;

  const scroller = active.closest("[data-scroll-region]");
  if (!(scroller instanceof HTMLElement) || scroller === active) return;

  scrollFieldWithin(active, scroller);
}
