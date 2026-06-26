"use client";

import { DemoDashboardClient } from "@/components/fitness/demo-dashboard-client";
import { trainingDays } from "@/lib/mock-data";

const DEMO_ROUTINE_NAME = "Sample Glute & Strength Week";

export default function DemoPage() {
  return (
    <DemoDashboardClient
      days={trainingDays}
      routineName={DEMO_ROUTINE_NAME}
      initialDayId={trainingDays[0]?.id ?? "monday"}
    />
  );
}
