import React from "react";
import { cn } from "@/lib/utils";
export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hoverable?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped, hoverable, ...props }, ref) => (
    <div className="w-full overflow-x-auto rounded-lg border border-neutral-200">
      <table
        ref={ref}
        className={cn(
          "w-full text-sm",
          striped && "[&_tbody_tr:nth-child(even)]:bg-neutral-50",
          hoverable &&
            "[&_tbody_tr]:hover:bg-neutral-50 [&_tbody_tr]:transition-colors",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-neutral-50 border-b border-neutral-200", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:not(:last-child)]:border-b [&_tr]:border-neutral-200",
      className,
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("transition-colors", className)} {...props} />
));
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-4 py-3 text-neutral-700", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-neutral-200 bg-neutral-50 font-medium",
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
};
