"use client";

import { useState } from "react";
import { ArrowDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/fitness/input";
import { Label } from "@/components/ui/label";
import { COLUMN_LABELS } from "../types";
import { parsePrescriptionToSets } from "../utils/parsePrescription";
import { PlannedSetsTable } from "./PlannedSetsTable";

type Example = {
  id: string;
  tab: string;
  exercise: string;
  setsText: string;
  weight: string;
  tip: string;
};

const EXAMPLES: Example[] = [
  {
    id: "same",
    tab: "Same weight",
    exercise: "Hip Thrust",
    setsText: "4x10",
    weight: "60",
    tip: "Most exercises look like this.",
  },
  {
    id: "changes",
    tab: "Weight changes",
    exercise: "Dumbbell Row",
    setsText: "1x12 15kg-3x12 20kg",
    weight: "",
    tip: "Write the kg next to each part. Leave WEIGHT empty.",
  },
  {
    id: "range",
    tab: "Rep range",
    exercise: "Lat Pulldown",
    setsText: "3x8-10",
    weight: "35",
    tip: "8-10 means: do between 8 and 10 reps.",
  },
  {
    id: "warmup",
    tab: "Warm-up",
    exercise: "Back Squat",
    setsText: "W1x15 20kg-3x8 60kg",
    weight: "",
    tip: "W = warm-up set. D = drop set.",
  },
];

function SpreadsheetRow({
  exercise,
  setsText,
  weight,
}: Pick<Example, "exercise" | "setsText" | "weight">) {
  const cells = [
    { label: COLUMN_LABELS.EXERCISE, value: exercise },
    { label: COLUMN_LABELS.SETS_X_REPS, value: setsText, highlight: true },
    { label: COLUMN_LABELS.WEIGHT, value: weight },
  ];

  return (
    <div className="border-border overflow-hidden rounded-lg border text-xs">
      <table
        className="w-full table-fixed border-collapse"
        aria-label="Spreadsheet row"
      >
        <thead>
          <tr>
            {cells.map((cell) => (
              <th
                key={cell.label}
                scope="col"
                className="bg-muted/60 text-muted-foreground border-border truncate border-r border-b px-2 py-1 text-left font-semibold last:border-r-0"
              >
                {cell.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {cells.map((cell) => (
              <td
                key={cell.label}
                className={`border-border min-h-7 truncate border-r px-2 py-1.5 font-mono last:border-r-0 ${
                  cell.highlight
                    ? "text-foreground font-semibold"
                    : "text-foreground"
                }`}
              >
                {cell.value || (
                  <span className="text-muted-foreground">empty</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function AppPreview({
  exercise,
  setsText,
  weight,
}: Pick<Example, "exercise" | "setsText" | "weight">) {
  const parsed = parsePrescriptionToSets(setsText, weight || null);

  return (
    <div className="bg-card border-border rounded-xl border p-3 shadow-sm sm:max-w-sm">
      <p className="text-foreground mb-1 text-sm font-semibold">{exercise}</p>
      {parsed.ok ? (
        <PlannedSetsTable sets={parsed.sets} caption={`Sets for ${exercise}`} />
      ) : (
        <p className="text-muted-foreground text-sm" role="status">
          We can&apos;t read this yet. Try 3x12 or 4x8-10.
        </p>
      )}
      {parsed.ok && parsed.notes.length > 0 ? (
        <p className="text-muted-foreground mt-1 text-xs">
          Saved as a note: {parsed.notes.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

function RowToApp(props: Pick<Example, "exercise" | "setsText" | "weight">) {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-medium">In Excel</p>
      <SpreadsheetRow {...props} />
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
        In the app
      </div>
      <AppPreview {...props} />
    </div>
  );
}

function TryYourOwn() {
  const [setsText, setSetsText] = useState("3x12");
  const [weight, setWeight] = useState("20");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1.6fr_1fr] gap-2">
        <div className="space-y-1">
          <Label htmlFor="try-sets" className="text-xs">
            {COLUMN_LABELS.SETS_X_REPS}
          </Label>
          <Input
            id="try-sets"
            value={setsText}
            autoComplete="off"
            onChange={(e) => setSetsText(e.target.value)}
            className="h-10 font-mono text-base md:text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="try-weight" className="text-xs">
            {COLUMN_LABELS.WEIGHT}
          </Label>
          <Input
            id="try-weight"
            value={weight}
            inputMode="decimal"
            autoComplete="off"
            onChange={(e) => setWeight(e.target.value)}
            className="h-10 font-mono text-base md:text-sm"
          />
        </div>
      </div>
      <div aria-live="polite">
        <AppPreview
          exercise="Your exercise"
          setsText={setsText}
          weight={weight}
        />
      </div>
    </div>
  );
}

const RULES = [
  "One tab = one training day. Name it like “Day 1 - Legs”.",
  "Weight in kg, numbers only (20 or 7.5). Leave it empty for bodyweight.",
  "MUSCLE: pick one from the list. ALSO WORKS is optional.",
  "REST in seconds, like 90.",
  "Extra words like “per leg” go to NOTES.",
];

export function FormatExample() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue={EXAMPLES[0].id}>
        <TabsList className="h-auto w-full flex-wrap justify-start">
          {EXAMPLES.map((example) => (
            <TabsTrigger
              key={example.id}
              value={example.id}
              className="text-xs"
            >
              {example.tab}
            </TabsTrigger>
          ))}
          <TabsTrigger value="try" className="text-xs">
            Try your own
          </TabsTrigger>
        </TabsList>
        {EXAMPLES.map((example) => (
          <TabsContent
            key={example.id}
            value={example.id}
            className="mt-3 space-y-2"
          >
            <p className="text-foreground text-sm">{example.tip}</p>
            <RowToApp {...example} />
          </TabsContent>
        ))}
        <TabsContent value="try" className="mt-3 space-y-2">
          <p className="text-foreground text-sm">
            Type what you would write in Excel.
          </p>
          <TryYourOwn />
        </TabsContent>
      </Tabs>

      <details className="group">
        <summary className="text-foreground cursor-pointer text-sm font-medium">
          More rules
        </summary>
        <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm">
          {RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
