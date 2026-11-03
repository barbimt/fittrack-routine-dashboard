/**
 * Builds public/templates/fittrack-routine-template.xlsx.
 * Run after changing columns or muscles: `pnpm template:generate`.
 */
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import ExcelJS from "exceljs";
import { MUSCLE_GROUPS } from "../features/routines/muscleGroups";
import { COLUMN_LABELS } from "../features/routine-import/types";
import { ROUTINE_TEMPLATE_FILENAME } from "../features/routine-import/template";

const OUTPUT = resolve(process.cwd(), "public/templates", ROUTINE_TEMPLATE_FILENAME);
const MAX_ROWS = 60;
const BRAND = "FF4F46E5";

const HEADERS = [
  { key: "EXERCISE", width: 28, note: "Exercise name. Required." },
  {
    key: "SETS_X_REPS",
    width: 26,
    note: "Required. Examples: 3x12 · 3x8-10 · 1x12 15kg-3x12 20kg · W1x15 20kg-3x8 60kg (W = warm-up, D = drop set).",
  },
  {
    key: "WEIGHT",
    width: 13,
    note: "Kg, numbers only (20 or 7.5). Used for every set. Leave empty if SETS x REPS has the kg or for bodyweight.",
  },
  { key: "MUSCLE", width: 16, note: "Main muscle. Pick from the list." },
  { key: "SECONDARY", width: 16, note: "Optional. Another muscle this exercise works." },
  { key: "REST", width: 11, note: "Rest between sets, in seconds. Example: 90." },
  { key: "NOTES", width: 34, note: "Anything else: tempo, per leg, machine number…" },
] as const;

type Row = [string, string, number | string, string, string, number | string, string];

const DAYS: { name: string; rows: Row[] }[] = [
  {
    name: "Day 1 - Legs",
    rows: [
      ["Back Squat", "W1x15 20kg-3x8 60kg", "", "Quads", "Glutes", 120, ""],
      ["Hip Thrust", "4x10", 60, "Glutes", "Hamstrings", 90, ""],
      ["Bulgarian Split Squat", "3x10", 12, "Quads", "Glutes", 60, "per leg"],
    ],
  },
  {
    name: "Day 2 - Upper",
    rows: [
      ["Dumbbell Row", "1x12 15kg-3x12 20kg", "", "Back", "Biceps", 90, ""],
      ["Lat Pulldown", "3x8-10", 35, "Back", "", 90, ""],
      ["Push-up", "3x12", "", "Chest", "Triceps", 60, "bodyweight"],
    ],
  },
  { name: "Day 3", rows: [] },
];

function addListSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Lists", { state: "veryHidden" });
  MUSCLE_GROUPS.forEach((muscle, index) => {
    sheet.getCell(index + 1, 1).value = muscle.label;
  });
  return `Lists!$A$1:$A$${MUSCLE_GROUPS.length}`;
}

function addDaySheet(
  workbook: ExcelJS.Workbook,
  name: string,
  rows: Row[],
  muscleRange: string
) {
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = HEADERS.map((header) => ({
    header: COLUMN_LABELS[header.key],
    key: header.key,
    width: header.width,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
  headerRow.height = 22;
  HEADERS.forEach((header, index) => {
    headerRow.getCell(index + 1).note = header.note;
  });

  for (const row of rows) {
    sheet.addRow(row);
  }

  for (let r = 2; r <= MAX_ROWS + 1; r += 1) {
    sheet.getCell(r, 2).numFmt = "@";
    sheet.getCell(r, 3).dataValidation = {
      type: "decimal",
      operator: "between",
      formulae: [0, 1000],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Kg only",
      error: "Write a number in kg, like 20 or 7.5.",
    };
    for (const col of [4, 5]) {
      sheet.getCell(r, col).dataValidation = {
        type: "list",
        formulae: [muscleRange],
        allowBlank: true,
        showErrorMessage: true,
        errorTitle: "Pick a muscle",
        error: "Choose a muscle from the list.",
      };
    }
    sheet.getCell(r, 6).dataValidation = {
      type: "whole",
      operator: "between",
      formulae: [0, 900],
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Seconds only",
      error: "Write the rest in seconds, like 90.",
    };
  }
}

function addHowToSheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("How to");
  sheet.getColumn(1).width = 90;
  const lines: [string, boolean][] = [
    ["How to fill this template", true],
    ["1. One tab = one training day. Rename tabs like “Day 1 - Legs”. Copy a tab to add a day.", false],
    ["2. One row = one exercise. Only EXERCISE and SETS x REPS are required.", false],
    ["3. Save as .xlsx and upload it in FitTrack. You can check everything before saving.", false],
    ["", false],
    ["How to write SETS x REPS", true],
    ["3x12  →  3 sets of 12 reps", false],
    ["3x8-10  →  3 sets of 8 to 10 reps", false],
    ["1x12 15kg-3x12 20kg  →  1 set with 15 kg, then 3 sets with 20 kg (leave WEIGHT empty)", false],
    ["W1x15 20kg-3x8 60kg  →  1 warm-up set, then 3 working sets. D = drop set", false],
    ["", false],
    ["This tab is not imported.", false],
  ];
  lines.forEach(([text, bold], index) => {
    const cell = sheet.getCell(index + 1, 1);
    cell.value = text;
    cell.font = bold ? { bold: true, size: 13 } : { size: 11 };
  });
}

async function main() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FitTrack";
  addHowToSheet(workbook);
  const muscleRange = addListSheet(workbook);
  for (const day of DAYS) {
    addDaySheet(workbook, day.name, day.rows, muscleRange);
  }
  workbook.views = [{ x: 0, y: 0, width: 20000, height: 12000, firstSheet: 0, activeTab: 2, visibility: "visible" }];

  mkdirSync(dirname(OUTPUT), { recursive: true });
  await workbook.xlsx.writeFile(OUTPUT);
  console.log(`Wrote ${OUTPUT}`);
}

void main();
