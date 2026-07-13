import type { ComponentType } from "react";

/** Satisfy recharts Formatter generics under strict tsc -b without per-call casts. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tooltipFormatter(
  fn: (value: unknown, name: unknown) => string | [string, string] | [] | [string],
): any {
  return fn;
}

/** Satisfy recharts Tooltip content prop under strict tsc -b. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tooltipContent(component: ComponentType<Record<string, unknown>>): any {
  return component;
}
