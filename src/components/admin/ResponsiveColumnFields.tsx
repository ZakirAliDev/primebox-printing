import { adminField, adminMuted } from "@/components/admin/ui";
import type { CategoryGridColumns } from "@/lib/catalog";
import { GRID_BREAKPOINTS, type GridBreakpointId } from "@/lib/template-layout";

const FIELD_SUFFIX: Record<GridBreakpointId, string> = {
  base: "Base",
  sm: "Sm",
  md: "Md",
  lg: "Lg",
  xl: "Xl",
  "2xl": "2xl",
};

export function categoryGridFieldName(prefix: string, breakpoint: GridBreakpointId) {
  return `${prefix}${FIELD_SUFFIX[breakpoint]}`;
}

export function ResponsiveColumnFields({
  namePrefix,
  values,
  min,
  max,
}: {
  namePrefix: string;
  values: CategoryGridColumns;
  min: number;
  max: number;
}) {
  const breakpoints = [...GRID_BREAKPOINTS].reverse();

  return (
    <div className="space-y-3">
      {breakpoints.map((breakpoint) => (
        <label
          key={breakpoint.id}
          className="grid grid-cols-[minmax(0,88px)_minmax(0,1fr)] items-center gap-3 rounded-lg border border-navy/10 bg-navy/[0.02] px-3 py-2"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-navy">{breakpoint.short}</span>
            <span className={`block text-xs ${adminMuted}`}>{breakpoint.label}</span>
            <span className={`block text-[11px] ${adminMuted}`}>{breakpoint.minWidth}px+</span>
          </span>
          <input
            type="number"
            name={categoryGridFieldName(namePrefix, breakpoint.id)}
            min={min}
            max={max}
            step={1}
            defaultValue={values[breakpoint.id]}
            className={adminField}
          />
        </label>
      ))}
    </div>
  );
}
