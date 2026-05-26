/**
 * FitTrack Routine Dashboard — design tokens
 * Map to CSS variables in app/globals.css and Tailwind @theme.
 */
export const fitTrackPalette = {
  background: "oklch(0.975 0.005 85)",
  surface: "oklch(0.995 0.002 90)",
  surfaceMuted: "oklch(0.94 0.005 85)",
  border: "oklch(0.90 0.008 85)",
  textPrimary: "oklch(0.22 0.01 75)",
  textSecondary: "oklch(0.35 0.01 75)",
  textMuted: "oklch(0.50 0.01 75)",
  accent: "oklch(0.52 0.08 155)",
  accentSoft: "oklch(0.90 0.025 155)",
  success: "oklch(0.62 0.14 150)",
  warning: "oklch(0.72 0.14 70)",
  danger: "oklch(0.60 0.18 25)",
} as const;

export const fitTrackNavItems = [
  { label: "Today", href: "/", icon: "home" as const },
  { label: "Upload Routine", href: "/upload", icon: "upload" as const },
  { label: "Week Overview", href: "/week", icon: "calendar" as const },
  { label: "Progress", href: "/progress", icon: "chart" as const },
  { label: "Routine Editor", href: "/editor", icon: "edit" as const },
  { label: "Settings", href: "/settings", icon: "settings" as const },
] as const;
