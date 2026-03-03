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
  Database,
  XCircle,
  ChevronDown,
  ChevronUp,
  Check,
  AlertTriangle,
  Clock,
  FileUp,
  UploadCloud,
  Download,
  Eye,
  Plus,
  Trash2,
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
  Tooltip,
} from "@mui/material";
import CRALayout from "./layout/CRALayout";
import { useCRADataStore, useCRAStatusStore } from "@/store/craStore";
import type { Asset, AssetTypeData } from "@/types/craTypes";
import { useIndustry } from "@/hooks/useIndustry";
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
  const { config: industryConfig } = useIndustry();
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
  const [addAssetDialog, setAddAssetDialog] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: "",
    category: "",
    description: "",
    columns: "" as string, // comma-separated column names
    priority: "medium" as "high" | "medium" | "low",
  });
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(() =>
    industryConfig.assetTypes.map((a) => ({
      id: a.id,
      name: a.name,
      category: a.category,
      description: a.description,
      templateFile: a.templateFile,
      dataFields: a.dataFields,
      icon: a.icon,
      priority: a.priority,
      estimatedRows: a.estimatedRows,
      status: "not_uploaded" as const,
    })),
  );
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
              [
                "id",
                "assetid",
                "loanid",
                "facilityid",
                "accountid",
                "towerid",
                "segmentid",
                "equipmentid",
                "systemid",
                "licenseid",
                "routeid",
                "vehicleid",
                "propertyid",
                "platformid",
              ],
              values,
            ) || `${assetTypeId.toUpperCase()}-${String(i).padStart(5, "0")}`;
          const borrowerName =
            findValue(
              [
                "borrower",
                "borrowername",
                "name",
                "clientname",
                "customer",
                "sitename",
                "towername",
                "routename",
                "facilityname",
                "equipmentname",
                "licensename",
                "systemname",
                "assetname",
                "platformname",
                "vehiclename",
                "description",
              ],
              values,
            ) || `Asset ${i}`;
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
              "netbookvalue",
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
            findValue(
              [
                "status",
                "accountstatus",
                "loanstatus",
                "operationalstatus",
                "condition",
              ],
              values,
            ) || "Active";
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
      updateStatus("segmentationReady", true);
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
  const handleAddCustomAssetType = () => {
    if (!newAsset.name.trim()) return;
    const id = newAsset.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const columns = newAsset.columns
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const customAsset: AssetType = {
      id,
      name: newAsset.name.trim(),
      category: newAsset.category.trim() || "Custom",
      description:
        newAsset.description.trim() ||
        (industryConfig.id === "telecommunications"
          ? `Custom infrastructure & operations: ${newAsset.name}`
          : `Custom asset type: ${newAsset.name}`),
      templateFile: `${id}_template.csv`,
      dataFields: columns.length > 0 ? columns : ["ID", "Name", "Value"],
      icon: Database,
      priority: newAsset.priority,
      estimatedRows: 50,
      status: "not_uploaded",
    };
    setAssetTypes((prev) => [...prev, customAsset]);
    setNewAsset({
      name: "",
      category: "",
      description: "",
      columns: "",
      priority: "medium",
    });
    setAddAssetDialog(false);
  };
  const handleRemoveCustomAsset = (assetId: string) => {
    // Only allow removing custom (non-config) asset types
    const configIds = industryConfig.assetTypes.map((a) => a.id);
    if (configIds.includes(assetId)) return;
    clearAssetData(assetId);
    setAssetTypes((prev) => prev.filter((a) => a.id !== assetId));
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
                  variant="h4"
                  fontWeight={700}
                  color="text.primary"
                  sx={{ mt: 1, letterSpacing: -0.5 }}
                >
                  {industryConfig.craLabels.dataUploadTitle}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 1, maxWidth: 800 }}
                >
                  {industryConfig.craLabels.dataUploadSubtitle}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: "right" }}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => setAddAssetDialog(true)}
                    sx={{
                      bgcolor: PROFESSIONAL_COLORS.secondary,
                      color: "#000",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#6B9B1E" },
                    }}
                  >
                    Add{" "}
                    {industryConfig.id === "telecommunications"
                      ? "New"
                      : "Asset Type"}
                  </Button>
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
                </Stack>
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
              placeholder={
                industryConfig.id === "telecommunications"
                  ? "Search infrastructure & operations..."
                  : "Search asset types..."
              }
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
                      {industryConfig.id === "telecommunications"
                        ? "INFRASTRUCTURE & OPERATIONS"
                        : "ASSET TYPE"}
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
                                  {asset.rowCount.toLocaleString()} records
                                </Typography>
                                {(() => {
                                  const stored = assets[asset.id];
                                  if (stored?.data?.length) {
                                    const totalExposure = stored.data.reduce(
                                      (sum, r) =>
                                        sum +
                                        (Number(r.outstandingBalance) ||
                                          Number(r["Net Book Value"]) ||
                                          Number(r["Book Value"]) ||
                                          0),
                                      0,
                                    );
                                    if (totalExposure > 0) {
                                      return (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {
                                            industryConfig.craLabels
                                              .exposureLabel
                                          }
                                          :{" "}
                                          {totalExposure >= 1e9
                                            ? `₦${(totalExposure / 1e9).toFixed(1)}B`
                                            : totalExposure >= 1e6
                                              ? `₦${(totalExposure / 1e6).toFixed(1)}M`
                                              : `₦${totalExposure.toLocaleString()}`}
                                        </Typography>
                                      );
                                    }
                                  }
                                  return null;
                                })()}
                              </Box>
                            ) : (
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Est. {asset.estimatedRows} records
                                </Typography>
                              </Box>
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
                              {!industryConfig.assetTypes.some(
                                (a) => a.id === asset.id,
                              ) && (
                                <Tooltip
                                  title={
                                    industryConfig.id === "telecommunications"
                                      ? "Remove custom infrastructure & operations"
                                      : "Remove custom asset type"
                                  }
                                >
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleRemoveCustomAsset(asset.id)
                                    }
                                  >
                                    <Trash2 size={14} />
                                  </IconButton>
                                </Tooltip>
                              )}
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
                {industryConfig.id === "telecommunications"
                  ? "No data available for this infrastructure & operations type."
                  : "No data available for this asset type."}
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
      {/* Add Custom Asset Type Dialog */}
      <Dialog
        open={addAssetDialog}
        onClose={() => setAddAssetDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" gap={1}>
            <Plus size={20} />
            <Typography variant="h6" fontWeight={700}>
              Add Custom{" "}
              {industryConfig.id === "telecommunications"
                ? "Infrastructure & Operations"
                : "Asset Type"}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label={
                industryConfig.id === "telecommunications"
                  ? "Infrastructure & Operations Name *"
                  : "Asset Type Name *"
              }
              fullWidth
              value={newAsset.name}
              onChange={(e) =>
                setNewAsset({ ...newAsset, name: e.target.value })
              }
              placeholder="e.g., Satellite Equipment"
            />
            <TextField
              label="Category"
              fullWidth
              value={newAsset.category}
              onChange={(e) =>
                setNewAsset({ ...newAsset, category: e.target.value })
              }
              placeholder="e.g., Network Infrastructure"
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={newAsset.description}
              onChange={(e) =>
                setNewAsset({ ...newAsset, description: e.target.value })
              }
              placeholder={
                industryConfig.id === "telecommunications"
                  ? "Brief description of this infrastructure & operations type"
                  : "Brief description of this asset type"
              }
            />
            <TextField
              label="Template Columns (comma-separated) *"
              fullWidth
              multiline
              rows={3}
              value={newAsset.columns}
              onChange={(e) =>
                setNewAsset({ ...newAsset, columns: e.target.value })
              }
              placeholder="ID, Name, Location, Net Book Value, Status, Category, Region"
              helperText={
                industryConfig.id === "telecommunications"
                  ? "Define the CSV column headers. Include at minimum: ID, Name, and a value field (e.g. Net Book Value)."
                  : "Define the CSV column headers. Include at minimum: ID, Name, and a value field (e.g. Outstanding Balance)."
              }
            />
            <TextField
              select
              label="Priority"
              value={newAsset.priority}
              onChange={(e) =>
                setNewAsset({
                  ...newAsset,
                  priority: e.target.value as "high" | "medium" | "low",
                })
              }
              fullWidth
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </TextField>
            {newAsset.columns && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  gutterBottom
                >
                  TEMPLATE PREVIEW
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 0.5,
                    flexWrap: "wrap",
                    mt: 1,
                  }}
                >
                  {newAsset.columns
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((col) => (
                      <Chip
                        key={col}
                        label={col}
                        size="small"
                        sx={{
                          bgcolor: alpha(PROFESSIONAL_COLORS.secondary, 0.1),
                          border: `1px solid ${alpha(PROFESSIONAL_COLORS.secondary, 0.3)}`,
                          fontWeight: 500,
                        }}
                      />
                    ))}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddAssetDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddCustomAssetType}
            disabled={!newAsset.name.trim() || !newAsset.columns.trim()}
            sx={{
              bgcolor: PROFESSIONAL_COLORS.secondary,
              color: "#000",
              fontWeight: 600,
              "&:hover": { bgcolor: "#6B9B1E" },
            }}
          >
            Add{" "}
            {industryConfig.id === "telecommunications"
              ? "Infrastructure & Operations"
              : "Asset Type"}
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
