export type ParsedSheetName = {
  name: string;
  focus: string | null;
};

const DAY_FOCUS_PATTERN = /^(.+?)\s*-\s*(.+)$/;

export function parseSheetName(sheetName: string): ParsedSheetName {
  const trimmed = sheetName.trim();
  const match = trimmed.match(DAY_FOCUS_PATTERN);

  if (!match) {
    return { name: trimmed, focus: null };
  }

  const name = match[1].trim();
  const focus = match[2].trim();

  if (!name || !focus) {
    return { name: trimmed, focus: null };
  }

  return { name, focus };
}
