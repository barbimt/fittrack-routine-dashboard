"use client";

import { cn } from "@/lib/utils";
import type { TrainingDay } from "@/lib/mock-data";

interface DaySelectorProps {
  days: TrainingDay[];
  selectedDay: string;
  onSelectDay: (dayId: string) => void;
}

export function DaySelector({ days, selectedDay, onSelectDay }: DaySelectorProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 pb-2 min-w-min">
        {days.map((day) => {
          const isSelected = day.id === selectedDay;
          const dayAbbrev = day.dayName.slice(0, 3);

          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={cn(
                "flex flex-col items-center px-4 py-3 rounded-xl transition-all min-w-[72px]",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-card-foreground border border-border hover:border-primary/30"
              )}
              aria-label={`Select ${day.dayName}`}
              aria-pressed={isSelected}
            >
              <span className="text-xs font-medium opacity-80">{dayAbbrev}</span>
              <span className="text-sm font-semibold mt-0.5 whitespace-nowrap">{day.focus.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
