"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { deepEqual } from "@/lib/deep-equal";

export interface DirtyState<T> {
  /** The editable working copy. */
  value: T;
  /** Update the working copy (same signature as `useState`'s setter). */
  setValue: Dispatch<SetStateAction<T>>;
  /** The last committed snapshot (the upstream `source`). */
  baseline: T;
  /** True when `value` diverges from `baseline`. */
  isDirty: boolean;
}

/**
 * Holds an editable draft of `source` and tracks whether it diverges from the
 * last committed baseline. When `source` changes (e.g. fresh server data after
 * a save + refresh) the draft and baseline are re-seeded from it.
 *
 * `isEqual` defaults to a structural deep compare; pass a stable reference if
 * you override it (it participates in the re-seed effect's dependencies).
 */
export function useDirtyState<T>(
  source: T,
  isEqual: (a: T, b: T) => boolean = deepEqual
): DirtyState<T> {
  const [value, setValue] = useState<T>(() => structuredClone(source));
  const [baseline, setBaseline] = useState<T>(() => structuredClone(source));
  const sourceRef = useRef(source);

  // Draft + baseline must live in state (editable working copy). Re-seed when
  // upstream `source` identity/content changes after save/refresh — not derived UI.
  // react-doctor-disable-next-line react-doctor/no-derived-state-effect,react-doctor/no-derived-state
  useEffect(() => {
    if (isEqual(sourceRef.current, source)) return;
    sourceRef.current = source;
    const fresh = structuredClone(source);
    // react-doctor-disable-next-line react-doctor/no-derived-state
    setBaseline(fresh);
    // react-doctor-disable-next-line react-doctor/no-derived-state
    setValue(fresh);
  }, [source, isEqual]);

  const isDirty = useMemo(
    () => !isEqual(value, baseline),
    [value, baseline, isEqual]
  );

  return { value, setValue, baseline, isDirty };
}
