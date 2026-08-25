"use client";

import type { CSSProperties } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function useEditorSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
}

export function useSortableRow(id: string, dragZIndex = 10) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? dragZIndex : undefined,
  };

  return {
    setNodeRef,
    setActivatorNodeRef,
    isDragging,
    style,
    handleProps: { ...attributes, ...listeners },
  };
}

interface DragHandleProps extends React.ComponentProps<"button"> {
  label: string;
}

export function DragHandle({
  label,
  className,
  ref,
  ...props
}: DragHandleProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "text-muted-foreground hover:text-foreground cursor-grab touch-none rounded p-1 active:cursor-grabbing",
        className
      )}
      {...props}
    >
      <GripVertical className="h-5 w-5" aria-hidden />
    </button>
  );
}
