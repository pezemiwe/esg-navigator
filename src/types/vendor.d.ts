/* -----------------------------------------------------------------------
   Vendor type shims for packages that use CommonJS-style exports
   and are not always resolved by TypeScript's bundler moduleResolution.
   ----------------------------------------------------------------------- */

declare module "exceljs" {
  export interface CellValue {
    text?: string;
    hyperlink?: string;
    tooltip?: string;
    date?: Date;
  }

  export interface Cell {
    value: string | number | boolean | Date | CellValue | null | undefined;
    fill: Record<string, unknown>;
    font: Record<string, unknown>;
    alignment: Record<string, unknown>;
    border: Record<string, unknown>;
    numFmt: string;
  }

  export interface Row {
    values: (string | number | boolean | Date | null | undefined)[];
    eachCell(
      callback: (cell: Cell, colNumber: number) => void,
    ): void;
    eachCell(
      options: { includeEmpty: boolean },
      callback: (cell: Cell, colNumber: number) => void,
    ): void;
    commit(): void;
    getCell(col: number | string): Cell;
  }

  export interface Column {
    width: number;
    key: string;
    header: string;
    eachCell(callback: (cell: Cell, rowNumber: number) => void): void;
  }

  export interface Worksheet {
    name: string;
    addRow(values: unknown[]): Row;
    addRows(values: unknown[][]): void;
    getColumn(key: number | string): Column;
    eachRow(callback: (row: Row, rowNumber: number) => void): void;
    eachRow(
      options: { includeEmpty: boolean },
      callback: (row: Row, rowNumber: number) => void,
    ): void;
    getCell(row: number, col: number): Cell;
    spliceColumns(index: number, count: number, ...cols: unknown[]): void;
  }

  export interface XlsxSerializer {
    load(buffer: ArrayBuffer | Buffer): Promise<void>;
    writeBuffer(): Promise<Buffer>;
    write(stream: unknown): Promise<void>;
    writeFile(filename: string): Promise<void>;
    readFile(filename: string): Promise<Workbook>;
  }

  export class Workbook {
    worksheets: Worksheet[];
    xlsx: XlsxSerializer;
    addWorksheet(name: string, options?: Record<string, unknown>): Worksheet;
    getWorksheet(nameOrId: string | number): Worksheet | undefined;
  }
}

declare module "jspdf-autotable" {
  import type { jsPDF } from "jspdf";

  interface Styles {
    font?: string;
    fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
    overflow?: "linebreak" | "ellipsize" | "visible" | "hidden";
    fillColor?: number | number[] | false;
    textColor?: number | number[];
    halign?: "left" | "center" | "right" | "justify";
    valign?: "top" | "middle" | "bottom";
    fontSize?: number;
    cellPadding?: number | number[] | Record<string, number>;
    lineWidth?: number;
    lineColor?: number | number[];
    minCellHeight?: number;
    minCellWidth?: number;
  }

  interface UserOptions {
    head?: unknown[][];
    body?: unknown[][];
    foot?: unknown[][];
    html?: string | HTMLTableElement;
    startY?: number;
    margin?:
      | number
      | number[]
      | { top?: number; right?: number; bottom?: number; left?: number };
    theme?: "striped" | "grid" | "plain" | "css";
    styles?: Styles;
    headStyles?: Styles;
    bodyStyles?: Styles;
    footStyles?: Styles;
    alternateRowStyles?: Styles;
    columnStyles?: Record<string | number, Styles>;
    tableWidth?: "auto" | "wrap" | number;
    showHead?: "everyPage" | "firstPage" | "never";
    showFoot?: "everyPage" | "lastPage" | "never";
    pageBreak?: "auto" | "avoid" | "always";
    rowPageBreak?: "auto" | "avoid";
    tableLineWidth?: number;
    tableLineColor?: number | number[];
    didParseCell?: (data: unknown) => void;
    willDrawCell?: (data: unknown) => void;
    didDrawCell?: (data: unknown) => void;
    didDrawPage?: (data: unknown) => void;
    [key: string]: unknown;
  }

  function autoTable(doc: jsPDF, options: UserOptions): void;
  export default autoTable;
}
