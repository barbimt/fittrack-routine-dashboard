export const MUSCLE_GROUPS = [
  { slug: "glutes", label: "Glutes" },
  { slug: "hamstrings", label: "Hamstrings" },
  { slug: "quads", label: "Quads" },
  { slug: "calves", label: "Calves" },
  { slug: "chest", label: "Chest" },
  { slug: "back", label: "Back" },
  { slug: "shoulders", label: "Shoulders" },
  { slug: "biceps", label: "Biceps" },
  { slug: "triceps", label: "Triceps" },
  { slug: "core", label: "Core" },
  { slug: "forearms", label: "Forearms" },
  { slug: "full_body", label: "Full Body" },
  { slug: "cardio", label: "Cardio" },
  { slug: "other", label: "Other" },
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]["slug"];

export const MUSCLE_GROUP_SLUGS: readonly MuscleGroup[] = MUSCLE_GROUPS.map(
  (group) => group.slug
);

/** Sentinel value for the "no muscle selected" option (Radix Select forbids ""). */
export const MUSCLE_GROUP_NONE = "none";

const SYNONYMS: Record<string, MuscleGroup> = {
  glute: "glutes",
  glutes: "glutes",
  gluteo: "glutes",
  gluteos: "glutes",
  hamstring: "hamstrings",
  hamstrings: "hamstrings",
  isquio: "hamstrings",
  isquios: "hamstrings",
  isquiotibiales: "hamstrings",
  femoral: "hamstrings",
  femorales: "hamstrings",
  quad: "quads",
  quads: "quads",
  quadriceps: "quads",
  cuadriceps: "quads",
  calf: "calves",
  calves: "calves",
  gemelo: "calves",
  gemelos: "calves",
  pantorrilla: "calves",
  pantorrillas: "calves",
  chest: "chest",
  pecho: "chest",
  pectoral: "chest",
  pectorales: "chest",
  back: "back",
  espalda: "back",
  lats: "back",
  dorsal: "back",
  dorsales: "back",
  shoulder: "shoulders",
  shoulders: "shoulders",
  hombro: "shoulders",
  hombros: "shoulders",
  deltoides: "shoulders",
  bicep: "biceps",
  biceps: "biceps",
  tricep: "triceps",
  triceps: "triceps",
  core: "core",
  abs: "core",
  abdomen: "core",
  abdominales: "core",
  forearm: "forearms",
  forearms: "forearms",
  antebrazo: "forearms",
  antebrazos: "forearms",
  "full body": "full_body",
  full_body: "full_body",
  fullbody: "full_body",
  "cuerpo completo": "full_body",
  cardio: "cardio",
  other: "other",
  otro: "other",
  otros: "other",
};

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Maps a label, slug, or ES/EN synonym to a slug. Unknown values return null. */
export function toMuscleGroup(
  value: string | null | undefined
): MuscleGroup | null {
  if (!value) return null;
  const key = normalizeKey(value);
  if (!key) return null;
  return SYNONYMS[key] ?? SYNONYMS[key.replace(/ /g, "_")] ?? null;
}

export function muscleGroupLabel(
  value: string | null | undefined
): string | null {
  const slug = toMuscleGroup(value);
  if (!slug) return null;
  return MUSCLE_GROUPS.find((group) => group.slug === slug)?.label ?? null;
}

/** Splits `"glutes, isquios"` into unique slugs; unknown entries are returned separately. */
export function parseMuscleList(value: string | null | undefined): {
  muscles: MuscleGroup[];
  unknown: string[];
} {
  const muscles: MuscleGroup[] = [];
  const unknown: string[] = [];
  for (const part of (value ?? "").split(/[,;/+]|\by\b|\band\b/i)) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const slug = toMuscleGroup(trimmed);
    if (!slug) {
      unknown.push(trimmed);
    } else if (!muscles.includes(slug)) {
      muscles.push(slug);
    }
  }
  return { muscles, unknown };
}
