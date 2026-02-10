export interface Asset {
  id: string;
  facilityId?: string;
  borrowerName?: string;
  sector: string;
  region: string;
  outstandingBalance?: number;
  maturityDate?: string;
  currency?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  [key: string]: unknown;
}

export interface AssetTypeData {
  type: string;
  data: Asset[];
  uploadedAt: string | null;
  fileName: string | null;
  rowCount: number;
  columnCount: number;
  validationStatus: "pending" | "validated" | "error";
  validationErrors: string[];
}
