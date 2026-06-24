import { describe, expect, it } from "vitest";
import {
  editorPatchFromPrescription,
  editorPatchFromSimpleFields,
  getPrescriptionEditorUiState,
  resolvePrescriptionForSave,
} from "./editorPrescription";

describe("editorPatchFromPrescription", () => {
  it("parses variable blocks into sets and reps", () => {
    expect(editorPatchFromPrescription("1x12 15kg-3x12 20kg", null)).toEqual({
      prescription: "1x12 15kg-3x12 20kg",
      plannedSets: 4,
      targetReps: "12",
      weight: null,
    });
  });

  it("keeps weight when prescription has no embedded load", () => {
    expect(editorPatchFromPrescription("3x12", "10kg")).toEqual({
      prescription: "3x12",
      plannedSets: 3,
      targetReps: "12",
      weight: "10kg",
    });
  });

  it("clears weight when prescription embeds a uniform load", () => {
    expect(editorPatchFromPrescription("3x12 40kg", "10kg")).toEqual({
      prescription: "3x12 40kg",
      plannedSets: 3,
      targetReps: "12",
      weight: null,
    });
  });

  it("returns null prescription fields when input is cleared", () => {
    expect(editorPatchFromPrescription("", "10kg")).toEqual({
      prescription: null,
      plannedSets: null,
      targetReps: null,
      weight: "10kg",
    });
  });
});

describe("getPrescriptionEditorUiState", () => {
  it("hides editable weight when loads are in the prescription", () => {
    expect(getPrescriptionEditorUiState("1x12 15kg-3x12 20kg")).toEqual({
      setsRepsEditable: false,
      weightMode: "in-prescription",
      weightNote: "Varies by set",
      setsRepsNote: "Synced from prescription",
    });
  });

  it("keeps weight editable for simple prescriptions", () => {
    expect(getPrescriptionEditorUiState("3x12")).toEqual({
      setsRepsEditable: true,
      weightMode: "editable",
      weightNote: "Optional — same load for every set (e.g. 60kg)",
    });
  });

  it("shows uniform embedded load in read-only weight mode", () => {
    expect(getPrescriptionEditorUiState("3x12 40kg")).toEqual({
      setsRepsEditable: false,
      weightMode: "in-prescription",
      weightNote: "40kg",
      setsRepsNote: "Synced from prescription",
    });
  });

  it("locks sets and reps for multi-block prescriptions without embedded weight", () => {
    expect(getPrescriptionEditorUiState("3x10-2x8")).toEqual({
      setsRepsEditable: false,
      weightMode: "editable",
      weightNote: "Optional — same load for every set in this prescription",
      setsRepsNote: "Synced from prescription",
    });
  });

  it("allows editing all fields when prescription is empty", () => {
    expect(getPrescriptionEditorUiState(null)).toEqual({
      setsRepsEditable: true,
      weightMode: "editable",
      weightNote: "Optional — same load for every set (e.g. 60kg)",
    });
  });
});

describe("editorPatchFromSimpleFields", () => {
  it("builds a simple prescription string", () => {
    expect(editorPatchFromSimpleFields(3, "12", "60kg")).toEqual({
      prescription: "3x12",
      plannedSets: 3,
      targetReps: "12",
      weight: "60kg",
    });
  });

  it("allows saving reps without weight", () => {
    expect(editorPatchFromSimpleFields(3, "12", null)).toEqual({
      prescription: "3x12",
      plannedSets: 3,
      targetReps: "12",
      weight: null,
    });
  });
});

describe("resolvePrescriptionForSave", () => {
  it("keeps the full prescription when provided", () => {
    expect(
      resolvePrescriptionForSave({
        id: "ex-1",
        dayId: "day-1",
        name: "Leg press",
        muscleGroup: null,
        prescription: "1x12 15kg-3x12 20kg",
        plannedSets: 4,
        targetReps: "12",
        weight: null,
        restTime: null,
        notes: null,
        sortOrder: 0,
      })
    ).toEqual({
      prescription: "1x12 15kg-3x12 20kg",
      plannedSets: 4,
      targetReps: "12",
    });
  });

  it("falls back to sets and reps when prescription is empty", () => {
    expect(
      resolvePrescriptionForSave({
        id: "ex-1",
        dayId: "day-1",
        name: "Squat",
        muscleGroup: null,
        prescription: null,
        plannedSets: 3,
        targetReps: "10",
        weight: "60kg",
        restTime: null,
        notes: null,
        sortOrder: 0,
      })
    ).toEqual({
      prescription: "3x10",
      plannedSets: 3,
      targetReps: "10",
    });
  });

  it("keeps simple prescription text when weight is in the weight column", () => {
    expect(
      resolvePrescriptionForSave({
        id: "ex-1",
        dayId: "day-1",
        name: "Squat",
        muscleGroup: null,
        prescription: "3x12",
        plannedSets: 3,
        targetReps: "12",
        weight: "10kg",
        restTime: null,
        notes: null,
        sortOrder: 0,
      })
    ).toEqual({
      prescription: "3x12",
      plannedSets: 3,
      targetReps: "12",
    });
  });
});
