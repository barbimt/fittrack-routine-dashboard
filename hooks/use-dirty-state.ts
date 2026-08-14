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
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  baseline: T;
  isDirty: boolean;
}

export function useDirtyState<T>(
  source: T,
  isEqual: (a: T, b: T) => boolean = deepEqual
): DirtyState<T> {
  const [value, setValue] = useState<T>(() => structuredClone(source));
  const [baseline, setBaseline] = useState<T>(() => structuredClone(source));
  const sourceRef = useRef(source);

  // Re-seed after save/refresh when `source` actually changes.
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
