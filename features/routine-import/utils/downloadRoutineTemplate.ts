import * as XLSX from "xlsx";

const TEMPLATE_FILENAME = "fittrack-routine-template.xlsx";

const ENGLISH_HEADERS = ["EXERCISE", "SETS x REPS", "WEIGHT", "NOTES"] as const;

type TemplateSheet = {
  name: string;
  rows: (string | number)[][];
};

const TEMPLATE_SHEETS: TemplateSheet[] = [
  {
    name: "Day 1 - FULL BODY",
    rows: [
      [...ENGLISH_HEADERS],
      ["Hip Thrust", "4x10", "60kg", "2s pause at top"],
      ["RDL", "3x8", "45kg", ""],
      ["Lat Pulldown", "3x12", "35kg", ""],
    ],
  },
  {
    name: "Day 2 - BACK + CHEST",
    rows: [
      [...ENGLISH_HEADERS],
      ["Barbell Row", "4x8", "40kg", ""],
      ["Bench Press", "3x10", "50kg", ""],
    ],
  },
  {
    name: "Day 3 - GLUTES",
    rows: [
      [...ENGLISH_HEADERS],
      ["Bulgarian Split Squat", "3x10 per leg", "12kg", ""],
      ["Cable Kickback", "3x15", "15kg", ""],
    ],
  },
];

export function downloadRoutineTemplate(): void {
  const workbook = XLSX.utils.book_new();

  for (const sheet of TEMPLATE_SHEETS) {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  }

  XLSX.writeFile(workbook, TEMPLATE_FILENAME);
}
