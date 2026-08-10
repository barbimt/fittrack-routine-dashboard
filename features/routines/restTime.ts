export type RestParts = {
  minutes: number;
  seconds: number;
};

/** Split total seconds into whole minutes + remainder seconds (0–59). */
export function secondsToParts(totalSeconds: number): RestParts {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return { minutes: 0, seconds: 0 };
  }
  const whole = Math.round(totalSeconds);
  return {
    minutes: Math.floor(whole / 60),
    seconds: whole % 60,
  };
}

/**
 * Parse stored `rest_time` (e.g. `90s`, `2m`) into minutes + seconds.
 * Unknown free-text falls back to the first number as seconds when possible.
 */
export function parseRestTime(value: string | null | undefined): RestParts {
  if (!value?.trim() || value.trim() === "—") {
    return { minutes: 0, seconds: 0 };
  }

  const trimmed = value.trim().toLowerCase();

  const minutesMatch = trimmed.match(
    /^(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)$/
  );
  if (minutesMatch) {
    const amount = Number(minutesMatch[1]);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { minutes: 0, seconds: 0 };
    }
    return secondsToParts(amount * 60);
  }

  const secondsMatch = trimmed.match(
    /^(\d+(?:\.\d+)?)\s*(s|sec|secs|second|seconds)?$/
  );
  if (secondsMatch) {
    const seconds = Number(secondsMatch[1]);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return { minutes: 0, seconds: 0 };
    }
    return secondsToParts(seconds);
  }

  const loose = trimmed.match(/(\d+)/);
  if (loose) {
    const amount = Number(loose[1]);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { minutes: 0, seconds: 0 };
    }
    if (/\bm/.test(trimmed) && !/\bs/.test(trimmed)) {
      return secondsToParts(amount * 60);
    }
    return secondsToParts(amount);
  }

  return { minutes: 0, seconds: 0 };
}

/** Always persist rest as whole seconds with an `s` suffix (e.g. `90s`). */
export function formatRestTime(
  minutes: number,
  seconds: number
): string | null {
  const m = Number.isFinite(minutes) ? Math.max(0, Math.floor(minutes)) : 0;
  const s = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const clampedSeconds = Math.min(s, 59);
  const total = m * 60 + clampedSeconds;
  if (total <= 0) return null;
  return `${total}s`;
}

/** Human label for the closed input (e.g. `1m 30s`, `45s`). */
export function formatRestLabel(value: string | null | undefined): string {
  const { minutes, seconds } = parseRestTime(value);
  if (minutes <= 0 && seconds <= 0) return "";
  if (minutes > 0 && seconds > 0) return `${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

/** Total seconds from a stored rest_time value (0 if empty/invalid). */
export function restTimeToSeconds(value: string | null | undefined): number {
  const { minutes, seconds } = parseRestTime(value);
  return Math.max(0, minutes * 60 + seconds);
}

/** Format remaining seconds as `m:ss` (e.g. `1:05`, `0:45`). */
export function formatCountdown(totalSeconds: number): string {
  const whole = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(whole / 60);
  const seconds = whole % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
