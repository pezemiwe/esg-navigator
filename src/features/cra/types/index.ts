export interface DataQuality {
  totalRecords: number;
  missingSector: number;
  missingRegion: number;
  missingExposure: number;
  invalidDates: number;
  duplicates: number;
  completeness: number;
  issues: string[];
}

export interface AssetDetail {
  id?: string;
  name?: string;
  sector?: string;
  region?: string;
  exposure?: number;
  status?: string;
}

export interface SelectedSegment {
  type: string;
  value: string | AssetDetail;
}

export interface ReportMetadata {
  title: string;
  date: string;
  horizon: "short" | "medium" | "long";
  frameworks: {
    tcfd: boolean;
    ngfs: boolean;
    issb: boolean;
    cbn: boolean;
  };
}

export interface SectionConfig {
  id: string;
  title: string;
  included: boolean;
}

export interface CollateralItem {
  id: string;
  type: string;
  sector: string;
  location: string;
  value: number;
  exposure: number;
  status: string;
}

export interface CollateralAssessment extends CollateralItem {
  physScore: number;
  physLabel: string;
  transScore: number;
  transLabel: string;
  vulnScore: number;
  combinedScore: number;
  combinedLevel: string;
  haircut: number;
  adjustedValue: number;
}
