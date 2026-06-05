"use client";

import { cn } from "@/lib/utils";
import type { TrainingDay } from "@/lib/mock-data";

interface DaySelectorProps {
  days: TrainingDay[];
  selectedDay: string;
  onSelectDay: (dayId: string) => void;
}

export function DaySelector({
  days,
  selectedDay,
  onSelectDay,
}: DaySelectorProps) {
  return (
    <div className="scrollbar-hide w-full overflow-x-auto">
      <div className="flex min-w-min gap-2 pb-2">
        {days.map((day) => {
          const isSelected = day.id === selectedDay;
          const dayAbbrev = day.dayName.slice(0, 3);

          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={cn(
                "flex min-w-[72px] flex-col items-center rounded-xl px-4 py-3 transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-card-foreground border-border hover:border-primary/30 border"
              )}
              aria-label={`Select ${day.dayName}`}
              aria-pressed={isSelected}
            >
              <span className="text-xs font-medium opacity-80">
                {dayAbbrev}
              </span>
              <span className="mt-0.5 text-sm font-semibold whitespace-nowrap">
                {day.focus.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
