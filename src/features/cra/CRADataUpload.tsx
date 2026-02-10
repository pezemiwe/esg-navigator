import React, { useState } from "react";
import * as XLSX from "xlsx";
import { downloadExcelTemplate } from "./utils/excelTemplates";
import { formatColumnHeader } from "./utils/craUtils";
import { TEMPLATE_DEFINITIONS } from "./utils/dataTemplates";
import CRANavigation from "./components/CRANavigation";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Database,
  XCircle,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  Clock,
  FileUp,
  BarChart4,
  Building2,
  Shield,
  Landmark,
  Wallet,
  UploadCloud,
  Download,
  Eye,
} from "lucide-react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha,
  IconButton,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  useTheme,
} from "@mui/material";
import CRALayout from "./layout/CRALayout";
import { useCRADataStore, useCRAStatusStore } from "@/store/craStore";
import type { Asset, AssetTypeData } from "@/types/craTypes";
const PROFESSIONAL_COLORS = {
  primary: "#1D1D1D",
  secondary: "#86BC25",
  accent: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  neutral: "#64748B",
  litBg: "#F8FAFC",
  darkBg: "#1D1D1D",
  success: "#10b981",
};
interface AssetType {
  id: string;
  name: string;
  category: string;
  description: string;
  templateFile: string;
  uploadedFile?: File;
  uploadedDate?: string;
  rowCount?: number;
  columnCount?: number;
  status: "not_uploaded" | "uploading" | "uploaded" | "validated" | "error";
  validationErrors?: string[];
  dataFields?: string[];
  icon?: React.ElementType;
  priority: "high" | "medium" | "low";
  estimatedRows: number;
}
const getStatusConfig = (status: string) => {
  switch (status) {
    case "uploading":
      return {
        icon: <CircularProgress size={16} />,
        label: "Uploading",
        color: PROFESSIONAL_COLORS.warning,
        bgColor: alpha(PROFESSIONAL_COLORS.warning, 0.08),
        iconComponent: Clock,
      };
    case "validated":
      return {
        icon: <CheckCircle2 size={16} />,
        label: "Validated",
        color: PROFESSIONAL_COLORS.success,
        bgColor: alpha(PROFESSIONAL_COLORS.success, 0.08),
        iconComponent: Check,
      };
    case "error":
      return {
        icon: <AlertCircle size={16} />,
        label: "Validation Error",
        color: PROFESSIONAL_COLORS.error,
        bgColor: alpha(PROFESSIONAL_COLORS.error, 0.08),
        iconComponent: AlertTriangle,
      };
    case "uploaded":
      return {
        icon: <Database size={16} />,
        label: "Uploaded",
        color: PROFESSIONAL_COLORS.info,
        bgColor: alpha(PROFESSIONAL_COLORS.info, 0.08),
        iconComponent: Database,
      };
    default:
      return {
        icon: <Database size={16} />,
        label: "Pending Upload",
        color: PROFESSIONAL_COLORS.neutral,
        bgColor: alpha(PROFESSIONAL_COLORS.neutral, 0.08),
        iconComponent: FileUp,
      };
  }
};

const getPriorityConfig = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return {
        label: "High Priority",
        color: PROFESSIONAL_COLORS.error,
        bgColor: alpha(PROFESSIONAL_COLORS.error, 0.08),
      };
    case "medium":
      return {
        label: "Medium Priority",
        color: PROFESSIONAL_COLORS.warning,
        bgColor: alpha(PROFESSIONAL_COLORS.warning, 0.08),
      };
    default:
      return {
        label: "Low Priority",
        color: PROFESSIONAL_COLORS.neutral,
        bgColor: alpha(PROFESSIONAL_COLORS.neutral, 0.08),
      };
  }
};

const CRADataUpload: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { assets, setAssetData, clearAssetData } = useCRADataStore();
  const { updateStatus } = useCRAStatusStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);
  const [filterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewDataDialog, setViewDataDialog] = useState<{
    open: boolean;
    assetId: string | null;
  }>({ open: false, assetId: null });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([
    {
      id: "loans_advances",
      name: "Loans & Advances",
      category: "Core Assets",
      description:
        "Corporate, retail, and commercial loan portfolios including term loans and revolving credit facilities",
      templateFile: "loans_advances_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Loan ID",
        "Principal",
        "Interest Rate",
        "Maturity Date",
        "Industry",
        "Geopolitical Zone",
        "State",
        "Collateral Type",
      ],
      icon: Building2,
      priority: "high",
      estimatedRows: 50000,
    },
    {
      id: "equities",
      name: "Equity Securities",
      category: "Investment Portfolio",
      description:
        "Listed and unlisted equity investments across global markets",
      templateFile: "equities_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Security ID",
        "Ticker",
        "Shares Held",
        "Market Value",
        "Sector",
        "ESG Score",
        "Dividend Yield",
      ],
      icon: TrendingUp,
      priority: "high",
      estimatedRows: 25000,
    },
    {
      id: "bonds_fixed_income",
      name: "Fixed Income Securities",
      category: "Investment Portfolio",
      description:
        "Government and corporate bonds, money market instruments, and other debt securities",
      templateFile: "bonds_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Bond ISIN",
        "Coupon Rate",
        "Maturity",
        "Credit Rating",
        "Issuer",
        "Yield",
        "Currency",
      ],
      icon: Landmark,
      priority: "medium",
      estimatedRows: 35000,
    },
    {
      id: "derivatives",
      name: "Derivative Instruments",
      category: "Trading Assets",
      description:
        "Options, futures, swaps, forward contracts, and structured products across asset classes",
      templateFile: "derivatives_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Contract ID",
        "Underlying Asset",
        "Notional Value",
        "Expiry",
        "Counterparty",
        "MTM Value",
        "Risk Category",
      ],
      icon: BarChart4,
      priority: "high",
      estimatedRows: 15000,
    },
    {
      id: "guarantees_obs",
      name: "Off-Balance Sheet Exposures",
      category: "Contingent Liabilities",
      description:
        "Guarantees, letters of credit, undrawn commitments, and other contingent exposures",
      templateFile: "guarantees_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Exposure ID",
        "Type",
        "Notional Amount",
        "Counterparty",
        "Tenor",
        "Collateral",
        "Probability of Default",
      ],
      icon: Shield,
      priority: "medium",
      estimatedRows: 12000,
    },
    {
      id: "investment_property",
      name: "Investment Property",
      category: "Real Assets",
      description:
        "Commercial real estate properties held for investment purposes",
      templateFile: "property_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Property ID",
        "State",
        "Property Type",
        "Area (sqm)",
        "Valuation",
        "Occupancy Rate",
        "Year Built",
      ],
      icon: Building2,
      priority: "medium",
      estimatedRows: 8000,
    },
    {
      id: "deposits_cash",
      name: "Deposits & Cash Equivalents",
      category: "Liquidity Assets",
      description:
        "Customer deposits, cash reserves, and hily liquid marketable securities",
      templateFile: "deposits_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Account ID",
        "Type",
        "Balance",
        "Currency",
        "Maturity",
        "Interest Rate",
        "Institution",
      ],
      icon: Wallet,
      priority: "low",
      estimatedRows: 100000,
    },
    {
      id: "insurance_assets",
      name: "Insurance & Reinsurance",
      category: "Specialized Assets",
      description:
        "Insurance contracts, reinsurance receivables, and technical reserves",
      templateFile: "insurance_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Policy ID",
        "Type",
        "Insured Amount",
        "Premium",
        "Term",
        "Risk Profile",
        "Counterparty",
      ],
      icon: Shield,
      priority: "low",
      estimatedRows: 15000,
    },
    {
      id: "other_asset_1",
      name: "Other Asset 1",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_1_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "other_asset_2",
      name: "Other Asset 2",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_2_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "other_asset_3",
      name: "Other Asset 3",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_3_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "other_asset_4",
      name: "Other Asset 4",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_4_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "other_asset_5",
      name: "Other Asset 5",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_5_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "other_asset_6",
      name: "Other Asset 6",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_6_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "other_asset_7",
      name: "Other Asset 7",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_7_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "other_asset_8",
      name: "Other Asset 8",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_8_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "other_asset_9",
      name: "Other Asset 9",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_9_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "other_asset_10",
      name: "Other Asset 10",
      category: "Additional Assets",
      description:
        "Additional financial asset classification for specialized exposures",
      templateFile: "other_asset_10_template.xlsx",
      status: "not_uploaded",
      dataFields: [
        "Asset ID",
        "Classification",
        "Value",
        "Risk Category",
        "Geopolitical Zone",
        "State",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
  ]);
  React.useEffect(() => {
    setAssetTypes((prev) =>
      prev.map((asset) => {
        const stored = assets[asset.id];
        if (
          stored &&
          stored.uploadedAt &&
          stored.validationStatus === "validated"
        ) {
          return {
            ...asset,
            status: "uploaded",
            uploadedDate: stored.uploadedAt,
            rowCount: stored.rowCount,
            columnCount: stored.columnCount,
            uploadedFile: new File([], stored.fileName || "Stored Data"),
            validationErrors: undefined,
          };
        }
        return asset;
      }),
    );
  }, [assets]);
  const statuses = [
    { value: "all", label: "All Status", color: PROFESSIONAL_COLORS.neutral },
    {
      value: "validated",
      label: "Validated",
      color: PROFESSIONAL_COLORS.success,
    },
    { value: "uploaded", label: "Uploaded", color: PROFESSIONAL_COLORS.info },
    {
      value: "not_uploaded",
      label: "Pending",
      color: PROFESSIONAL_COLORS.neutral,
    },
    { value: "error", label: "Error", color: PROFESSIONAL_COLORS.error },
    {
      value: "uploading",
      label: "Uploading",
      color: PROFESSIONAL_COLORS.warning,
    },
  ];
  const handleFileUpload = async (assetTypeId: string, file: File) => {
    setUploadQueue((prev) => [...prev, assetTypeId]);
    setAssetTypes((prev) =>
      prev.map((asset) =>
        asset.id === assetTypeId
          ? { ...asset, status: "uploading" as const }
          : asset,
      ),
    );
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      }) as unknown[][];
      if (jsonData.length === 0) {
        throw new Error("Empty file");
      }
      const headers = (jsonData[0] || []).map((h) => String(h).trim());
      const columnCount = headers.length;
      const templateDef =
        TEMPLATE_DEFINITIONS[assetTypeId as keyof typeof TEMPLATE_DEFINITIONS];
      if (templateDef) {
        const requiredColumns = templateDef.columns
          .filter((c) => c.required)
          .map((c) => c.field);
        const normalizedHeaders = headers.map((h) =>
          h.toLowerCase().replace(/[^a-z0-9]/g, ""),
        );
        const missingColumns = requiredColumns.filter((reqCol) => {
          const normReq = reqCol.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (normReq === "bondnameissuer") {
            return !(
              normalizedHeaders.includes("bondnameissuer") ||
              (normalizedHeaders.includes("bondname") &&
                normalizedHeaders.includes("issuer"))
            );
          }
          return !normalizedHeaders.includes(normReq);
        });
        if (missingColumns.length > 0) {
          throw new Error(
            `Missing required columns: ${missingColumns.join(", ")}`,
          );
        }
      }
      const columnMap: Record<string, number> = {};
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/[^a-z0-9]/g, "");
        columnMap[key] = index;
      });
      const findValue = (patterns: string[], values: unknown[]): string => {
        for (const pattern of patterns) {
          const idx = columnMap[pattern];
          if (
            idx !== undefined &&
            values[idx] !== undefined &&
            values[idx] !== null
          ) {
            return String(values[idx]).trim();
          }
        }
        return "";
      };
      const parsedAssets: Asset[] = [];
      for (let i = 1; i < jsonData.length; i++) {
        const values = jsonData[i];
        if (
          values &&
          values.length > 0 &&
          values.some(
            (v: unknown) =>
              v !== undefined && v !== null && String(v).trim() !== "",
          )
        ) {
          const id =
            findValue(
              ["id", "assetid", "loanid", "facilityid", "accountid"],
              values,
            ) || `${assetTypeId.toUpperCase()}-${String(i).padStart(5, "0")}`;
          const borrowerName =
            findValue(
              ["borrower", "borrowername", "name", "clientname", "customer"],
              values,
            ) || `Borrower ${i}`;
          const sector =
            findValue(
              [
                "sector",
                "industry",
                "industrysector",
                "businesstype",
                "segment",
                "category",
                "borrowertype",
                "classification",
                "assettype",
                "securitytype",
                "derivativetype",
                "guaranteetype",
                "producttype",
              ],
              values,
            ) || "Unclassified";
          const region =
            findValue(
              [
                "Geopolitical Zone",
                "State",
                "geopoliticalzone",
                "State",
                "area",
                "province",
                "state",
                "district",
                "zone",
                "city",
                "branch",
                "territory",
              ],
              values,
            ) || "Unknown";
          const exposureStr = findValue(
            [
              "exposure",
              "balance",
              "outstandingbalance",
              "amount",
              "principal",
              "loanamount",
              "valuation",
              "value",
              "marketvalue",
              "bookvalue",
              "insuredamount",
              "limit",
              "facilityamount",
              "notional",
              "notionalvalue",
              "parvalue",
              "facevalue",
            ],
            values,
          );
          const exposure = parseFloat(exposureStr.replace(/[^\d.-]/g, "")) || 0;
          const currency =
            findValue(["currency", "curr", "ccy"], values) || "NGN";
          const status =
            findValue(["status", "accountstatus", "loanstatus"], values) ||
            "Active";
          const latStr = findValue(["latitude", "lat"], values);
          const lngStr = findValue(["longitude", "lng", "lon", "long"], values);
          const row: Asset = {
            id,
            borrowerName,
            sector,
            region,
            outstandingBalance: exposure,
            currency,
            status,
            latitude: latStr ? parseFloat(latStr) : undefined,
            longitude: lngStr ? parseFloat(lngStr) : undefined,
          };
          headers.forEach((header, index) => {
            if (
              values[index] !== undefined &&
              ![
                "id",
                "borrower",
                "sector",
                "Geopolitical Zone",
                "State",
                "exposure",
                "currency",
                "status",
                "latitude",
                "longitude",
              ].includes(header.toLowerCase().replace(/[^a-z]/g, ""))
            ) {
              row[header] = values[index];
            }
          });
          parsedAssets.push(row);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUploadQueue((prev) => prev.filter((id) => id !== assetTypeId));
      const assetData: AssetTypeData = {
        type: assetTypeId,
        data: parsedAssets,
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        rowCount: parsedAssets.length,
        columnCount: columnCount,
        validationStatus: "validated",
        validationErrors: [],
      };
      setAssetData(assetTypeId, assetData);
      updateStatus("dataUploaded", true);
      setAssetTypes((prev) =>
        prev.map((asset) => {
          if (asset.id === assetTypeId) {
            return {
              ...asset,
              uploadedFile: file,
              uploadedDate: new Date().toISOString(),
              rowCount: parsedAssets.length,
              columnCount: columnCount,
              status: "validated",
              validationErrors: undefined,
            };
          }
          return asset;
        }),
      );
    } catch (error) {
      setUploadQueue((prev) => prev.filter((id) => id !== assetTypeId));
      setAssetTypes((prev) =>
        prev.map((asset) => {
          if (asset.id === assetTypeId) {
            return {
              ...asset,
              status: "error",
              validationErrors: [
                `Failed to parse file: ${(error as Error).message}`,
              ],
            };
          }
          return asset;
        }),
      );
    }
  };
  const handleRemoveFile = (assetTypeId: string) => {
    clearAssetData(assetTypeId);
    setAssetTypes((prev) =>
      prev.map((asset) =>
        asset.id === assetTypeId
          ? {
              ...asset,
              uploadedFile: undefined,
              uploadedDate: undefined,
              rowCount: undefined,
              columnCount: undefined,
              status: "not_uploaded",
              validationErrors: undefined,
            }
          : asset,
      ),
    );
    const hasData = Object.keys(useCRADataStore.getState().assets).length > 1;
    if (!hasData) {
      updateStatus("dataUploaded", false);
    }
  };
  const handleDownloadTemplate = (assetTypeId: string) => {
    downloadExcelTemplate(assetTypeId as keyof typeof TEMPLATE_DEFINITIONS);
  };
  const handleDownloadAllTemplates = () => {
    assetTypes.forEach((asset) => {
      setTimeout(() => {
        handleDownloadTemplate(asset.id);
      }, 500);
    });
  };
  const handleViewData = (assetTypeId: string) => {
    setViewDataDialog({ open: true, assetId: assetTypeId });
    setPage(0);
  };
  const getActiveAssetData = () => {
    if (!viewDataDialog.assetId) return [];
    return assets[viewDataDialog.assetId]?.data || [];
  };
  const filteredAssets = assetTypes.filter((asset) => {
    const matchesSearch =
      searchTerm === "" ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.dataFields?.some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesCategory =
      filterCategory === "all" || asset.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || asset.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  return (
    <CRALayout>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          py: 4,
          px: { xs: 3, md: 6 },
        }}
      >
        <Stack spacing={4} maxWidth="1600px" mx="auto">
          <Box
            sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 3 }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography
                  variant="overline"
                  color="primary"
                  fontWeight={700}
                  letterSpacing={1.5}
                >
                  Data Management
                </Typography>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  color="text.primary"
                  sx={{ mt: 1, letterSpacing: -0.5 }}
                >
                  Asset Portfolio Data Upload
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1, maxWidth: 800 }}
                >
                  Upload financial asset data for comprehensive climate risk
                  assessment. Ensure all required datasets are validated before
                  proceeding to analysis.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: "right" }}>
                <Button
                  variant="outlined"
                  startIcon={<FileText size={18} />}
                  sx={{
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.secondary,
                  }}
                  onClick={handleDownloadAllTemplates}
                >
                  Download All Templates
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Search size={20} color={theme.palette.text.secondary} />
            <TextField
              size="small"
              placeholder="Search asset types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                minWidth: 300,
                "& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              Status:
            </Typography>
            <TextField
              select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: status.color,
                      }}
                    />
                    <Typography>{status.label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Paper>
          <Paper
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead
                  sx={{
                    bgcolor: isDark
                      ? alpha(theme.palette.background.default, 0.5)
                      : theme.palette.action.hover,
                  }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        width: "30%",
                      }}
                    >
                      ASSET TYPE
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        width: "15%",
                      }}
                    >
                      STATUS
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        width: "15%",
                      }}
                    >
                      DATA METRICS
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        width: "15%",
                      }}
                    >
                      PRIORITY
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.secondary,
                        width: "25%",
                      }}
                    >
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const statusConfig = getStatusConfig(asset.status);
                    const priorityConfig = getPriorityConfig(asset.priority);
                    return (
                      <React.Fragment key={asset.id}>
                        <TableRow
                          hover
                          sx={{ "&:last-child td": { borderBottom: 0 } }}
                        >
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 1.5,
                                  bgcolor: isDark
                                    ? alpha(theme.palette.primary.main, 0.1)
                                    : alpha(theme.palette.primary.main, 0.05),
                                  color: isDark
                                    ? theme.palette.primary.main
                                    : theme.palette.primary.dark,
                                }}
                              >
                                {asset.icon && <asset.icon size={20} />}
                              </Box>
                              <Box>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={700}
                                  color="text.primary"
                                >
                                  {asset.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {asset.category}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={statusConfig.icon}
                              label={statusConfig.label}
                              size="small"
                              sx={{
                                bgcolor: statusConfig.bgColor,
                                color: statusConfig.color,
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                height: 24,
                                border: "1px solid",
                                borderColor: alpha(statusConfig.color, 0.2),
                              }}
                            />
                            {asset.uploadedDate && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                                sx={{ mt: 0.5, fontSize: "0.7rem" }}
                              >
                                {new Date(
                                  asset.uploadedDate,
                                ).toLocaleDateString()}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {asset.rowCount ? (
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {asset.rowCount.toLocaleString()}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  records
                                </Typography>
                              </Box>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontStyle="italic"
                              >
                                --
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              sx={{
                                color: priorityConfig.color,
                                textTransform: "uppercase",
                              }}
                            >
                              {asset.priority}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              {!asset.uploadedFile ? (
                                <>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    component="label"
                                    startIcon={<UploadCloud size={14} />}
                                    sx={{
                                      borderColor: theme.palette.divider,
                                      color: theme.palette.text.secondary,
                                      textTransform: "none",
                                    }}
                                  >
                                    {uploadQueue.includes(asset.id)
                                      ? "Uploading..."
                                      : "Upload"}
                                    <input
                                      type="file"
                                      accept=".xlsx,.xls,.csv"
                                      hidden
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file)
                                          handleFileUpload(asset.id, file);
                                      }}
                                    />
                                  </Button>
                                  <IconButton
                                    size="small"
                                    title="Download Template"
                                    onClick={() =>
                                      handleDownloadTemplate(asset.id)
                                    }
                                    sx={{
                                      color: theme.palette.text.secondary,
                                      border: `1px solid ${theme.palette.divider}`,
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Download size={16} />
                                  </IconButton>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleViewData(asset.id)}
                                    startIcon={<Eye size={14} />}
                                    sx={{
                                      bgcolor: isDark
                                        ? "primary.main"
                                        : "#1D1D1D",
                                      color: isDark
                                        ? "primary.contrastText"
                                        : "white",
                                    }}
                                  >
                                    View Data
                                  </Button>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveFile(asset.id)}
                                  >
                                    <XCircle size={16} />
                                  </IconButton>
                                </>
                              )}
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setExpandedAsset(
                                    expandedAsset === asset.id
                                      ? null
                                      : asset.id,
                                  )
                                }
                              >
                                {expandedAsset === asset.id ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                        {expandedAsset === asset.id && (
                          <TableRow sx={{ bgcolor: "action.hover" }}>
                            <TableCell colSpan={5}>
                              <Box sx={{ p: 2 }}>
                                <Typography
                                  variant="caption"
                                  fontWeight={600}
                                  color="text.secondary"
                                  gutterBottom
                                >
                                  DATA REQUIREMENTS
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                    mt: 1,
                                  }}
                                >
                                  {asset.dataFields?.map((field) => (
                                    <Chip
                                      key={field}
                                      label={field}
                                      size="small"
                                      sx={{
                                        bgcolor: isDark
                                          ? "background.paper"
                                          : "white",
                                        border: "1px solid",
                                        borderColor: "divider",
                                      }}
                                    />
                                  ))}
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                  <Typography
                                    variant="caption"
                                    fontWeight={600}
                                    color="text.secondary"
                                  >
                                    DESCRIPTION
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {asset.description}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </Box>
      <Dialog
        open={viewDataDialog.open}
        onClose={() => setViewDataDialog({ open: false, assetId: null })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Data Preview</Typography>
            <IconButton
              onClick={() => setViewDataDialog({ open: false, assetId: null })}
            >
              <XCircle size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {getActiveAssetData().length > 0 ? (
            <>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ maxHeight: 600 }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(getActiveAssetData()[0] || {}).map((key) => (
                        <TableCell
                          key={key}
                          sx={{
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            textTransform: "capitalize",
                            bgcolor: isDark
                              ? alpha(theme.palette.background.default, 0.5)
                              : "#f8fafc",
                          }}
                        >
                          {formatColumnHeader(key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getActiveAssetData()
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((row: Asset, index: number) => (
                        <TableRow key={index} hover>
                          {Object.values(row).map((value: unknown, i) => (
                            <TableCell
                              key={i}
                              sx={{
                                whiteSpace:
                                  String(value).length > 50
                                    ? "normal"
                                    : "nowrap",
                                maxWidth: 400,
                              }}
                            >
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={getActiveAssetData().length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          ) : (
            <Box py={4} textAlign="center">
              <Typography color="text.secondary">
                No data available for this asset type.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setViewDataDialog({ open: false, assetId: null })}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Box
        sx={{
          px: 3,
          py: 2,
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          backgroundColor: isDark
            ? alpha("#0F1623", 0.95)
            : alpha("#FFFFFF", 0.95),
          backdropFilter: "blur(8px)",
          boxShadow: isDark
            ? "0 -4px 20px rgba(0,0,0,0.2)"
            : "0 -4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <CRANavigation
          compact
          nextPath="/cra/segmentation"
          nextLabel="Next: Segmentation"
        />
      </Box>
    </CRALayout>
  );
};
export default CRADataUpload;
