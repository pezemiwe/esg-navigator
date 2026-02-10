import { useState, useMemo, useRef, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  alpha,
  useTheme,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Grid,
} from "@mui/material";
import {
  Search,
  Download,
  PieChart as PieChartIcon,
  Filter,
  X,
  AlertTriangle,
  MapPin,
  Eye,
  FileSpreadsheet,
  Database,
  Save,
  Layers,
  Printer,
  Share2,
  Map as MapIcon,
  Info,
} from "lucide-react";
import CRANavigation from "../components/CRANavigation";
import { useSegmentationStore, useCRADataStore } from "@/store/craStore";
import CRALayout from "../layout/CRALayout";
import {
  formatCurrency,
  formatShortCurrency,
  formatAssetType,
} from "../utils/craUtils";
import { NIGERIA_REGIONS, NIGERIA_LOCATIONS, SECTORS } from "../data/constants";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  Label,
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";
interface DataQuality {
  totalRecords: number;
  missingSector: number;
  missingRegion: number;
  missingExposure: number;
  invalidDates: number;
  duplicates: number;
  completeness: number;
  issues: string[];
}
interface AssetDetail {
  id?: string;
  name?: string;
  sector?: string;
  region?: string;
  exposure?: number;
  status?: string;
}
interface SelectedSegment {
  type: string;
  value: string | AssetDetail;
}
const COLORS = [
  "#86BC25",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#8B5CF6",
  "#EC4899",
];

export default function PortfolioSegmentation() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { filters, setFilters, saveSegment, groupingMode, setGroupingMode } =
    useSegmentationStore();
  const { assets } = useCRADataStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSegment, setSelectedSegment] =
    useState<SelectedSegment | null>(null);
  const [showDrilldown, setShowDrilldown] = useState(false);
  const [portfolioFilter, setPortfolioFilter] = useState("All");
  const [timeRange, setTimeRange] = useState("1Y");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  const allAssetsFlat = useMemo(() => {
    return Object.values(assets).flatMap((assetType) =>
      (assetType.data || []).map((asset) => ({
        ...asset,
        _sourceType: assetType.type,
      })),
    );
  }, [assets]);
  const assetTypesOptions = useMemo(() => {
    const types = Object.values(assets)
      .filter((a) => a.data && a.data.length > 0)
      .map((a) => a.type);
    return types;
  }, [assets]);
  const dataQualityCalc: DataQuality | null = useMemo(() => {
    if (allAssetsFlat.length === 0) {
      return null;
    }
    const totalRecords = allAssetsFlat.length;
    const missingSector = allAssetsFlat.filter(
      (a) => !a.sector || a.sector.trim() === "",
    ).length;
    const missingRegion = allAssetsFlat.filter(
      (a) => !a.region || a.region.trim() === "",
    ).length;
    const missingExposure = allAssetsFlat.filter(
      (a) => !a.outstandingBalance && a.outstandingBalance !== 0,
    ).length;
    const invalidDates = allAssetsFlat.filter(
      (a) =>
        a.maturityDate && isNaN(new Date(a.maturityDate as string).getTime()),
    ).length;
    const ids = allAssetsFlat.map((a) => a.id);
    const duplicates = ids.length - new Set(ids).size;
    const totalPossiblePoints = totalRecords * 3;
    const actualPoints =
      totalPossiblePoints - missingSector - missingRegion - missingExposure;
    const completeness = (actualPoints / totalPossiblePoints) * 100;
    return {
      totalRecords,
      missingSector,
      missingRegion,
      missingExposure,
      invalidDates,
      duplicates,
      completeness: Math.round(completeness * 100) / 100,
      issues: [
        ...(missingSector > 0
          ? [`${missingSector} records missing sector classification`]
          : []),
        ...(missingRegion > 0
          ? [`${missingRegion} records missing region`]
          : []),
        ...(missingExposure > 0
          ? [`${missingExposure} records missing exposure amount`]
          : []),
        ...(invalidDates > 0
          ? [`${invalidDates} records have invalid dates`]
          : []),
        ...(duplicates > 0 ? [`${duplicates} duplicate records found`] : []),
      ],
    };
  }, [allAssetsFlat]);
  const availableSectors = useMemo(() => {
    const sectors = [
      ...new Set(allAssetsFlat.map((a) => a.sector).filter(Boolean)),
    ];
    return sectors.length > 0 ? sectors : SECTORS;
  }, [allAssetsFlat]);
  const availableRegions = useMemo(() => {
    const regions = [
      ...new Set(
        allAssetsFlat
          .map(
            (a) =>
              ((a as Record<string, unknown>)["Geopolitical Zone"] as string) ||
              a.region,
          )
          .filter(Boolean),
      ),
    ];
    return regions.length > 0 ? regions : NIGERIA_REGIONS;
  }, [allAssetsFlat]);
  const availableLocations = useMemo(() => {
    let relevantAssets = allAssetsFlat;
    if (filters.region && filters.region.length > 0) {
      relevantAssets = relevantAssets.filter((a) =>
        filters.region.includes(
          ((a as Record<string, unknown>)["Geopolitical Zone"] as string) ||
            a.region,
        ),
      );
    }

    const locations = [
      ...new Set(
        relevantAssets
          .map(
            (a) =>
              ((a as Record<string, unknown>)["State"] as string) ||
              ((a as Record<string, unknown>)["Location"] as string) ||
              ((a as Record<string, unknown>)["location"] as string),
          )
          .filter(Boolean),
      ),
    ];
    // Only return defaults if we haven't filtered and have no data
    if (locations.length > 0) return locations;
    if (filters.region.length === 0)
      return Object.values(NIGERIA_LOCATIONS).flat();
    return [];
  }, [allAssetsFlat, filters.region]);
  const hasLocationData = useMemo(() => {
    return allAssetsFlat.some(
      (a) =>
        (a as Record<string, unknown>)["State"] ||
        (a as Record<string, unknown>)["Location"] ||
        (a as Record<string, unknown>)["location"],
    );
  }, [allAssetsFlat]);
  const filteredAssets = useMemo(() => {
    let result = allAssetsFlat;
    if (portfolioFilter !== "All") {
      result = result.filter((asset) => {
        if (asset["_sourceType"]) {
          return asset["_sourceType"] === portfolioFilter;
        }
        const assetTypeName = assetTypesOptions.find((type) =>
          type
            .toLowerCase()
            .includes(String(asset.id).split("-")[0].toLowerCase() || ""),
        );
        return assetTypeName === portfolioFilter;
      });
    }
    if (filters.sector.length > 0) {
      result = result.filter((asset) => filters.sector.includes(asset.sector));
    }
    if (filters.region.length > 0) {
      result = result.filter((asset) =>
        filters.region.includes(
          ((asset as Record<string, unknown>)["Geopolitical Zone"] as string) ||
            asset.region,
        ),
      );
    }
    if (filters.location && filters.location.length > 0) {
      result = result.filter((asset) =>
        filters.location.includes(
          ((asset as Record<string, unknown>)["State"] as string) ||
            ((asset as Record<string, unknown>)["Location"] as string) ||
            ((asset as Record<string, unknown>)["location"] as string),
        ),
      );
    }
    return result;
  }, [allAssetsFlat, filters, portfolioFilter, assetTypesOptions]);
  const totalExposure = useMemo(() => {
    return filteredAssets.reduce(
      (sum, asset) => sum + (Number(asset.outstandingBalance) || 0),
      0,
    );
  }, [filteredAssets]);
  const totalAssetCount = filteredAssets.length;
  const sectorData = useMemo(() => {
    const sectorMap = new Map<string, { count: number; exposure: number }>();
    filteredAssets.forEach((asset) => {
      const sector = asset.sector || "Unclassified";
      const current = sectorMap.get(sector) || { count: 0, exposure: 0 };
      sectorMap.set(sector, {
        count: current.count + 1,
        exposure: current.exposure + (Number(asset.outstandingBalance) || 0),
      });
    });
    return Array.from(sectorMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        exposure: data.exposure,
        percentage: (data.exposure / totalExposure) * 100,
      }))
      .sort((a, b) => b.exposure - a.exposure);
  }, [filteredAssets, totalExposure]);
  const regionData = useMemo(() => {
    const regionMap = new Map<string, { count: number; exposure: number }>();
    filteredAssets.forEach((asset) => {
      const region = asset.region || "Unclassified";
      const current = regionMap.get(region) || { count: 0, exposure: 0 };
      regionMap.set(region, {
        count: current.count + 1,
        exposure: current.exposure + (Number(asset.outstandingBalance) || 0),
      });
    });
    return Array.from(regionMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        exposure: data.exposure,
      }))
      .sort((a, b) => b.exposure - a.exposure)
      .slice(0, 10);
  }, [filteredAssets]);
  const ratingData = useMemo(() => {
    const ratingMap = new Map<string, { count: number; exposure: number }>();
    filteredAssets.forEach((asset) => {
      const r = asset as Record<string, unknown>;
      const rating =
        (r["Internal Rating"] as string) ||
        (r["Credit Rating"] as string) ||
        (r["Risk Rating"] as string) ||
        (r["riskRating"] as string) ||
        (r["rating"] as string) ||
        "Unrated";
      const current = ratingMap.get(rating) || { count: 0, exposure: 0 };
      ratingMap.set(rating, {
        count: current.count + 1,
        exposure: current.exposure + (Number(asset.outstandingBalance) || 0),
      });
    });
    return Array.from(ratingMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        exposure: data.exposure,
        percentage: (data.exposure / totalExposure) * 100,
      }))
      .sort((a, b) => {
        if (a.name === "Unrated") return 1;
        if (b.name === "Unrated") return -1;
        return b.exposure - a.exposure;
      });
  }, [filteredAssets, totalExposure]);
  const maturityData = useMemo(() => {
    const yearMap = new Map<string, { count: number; exposure: number }>();
    filteredAssets.forEach((asset) => {
      let year = "Unknown";
      const dateStr =
        ((asset as Record<string, unknown>)["Maturity Date"] as string) ||
        asset.maturityDate;
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          year = date.getFullYear().toString();
        }
      }
      const current = yearMap.get(year) || { count: 0, exposure: 0 };
      yearMap.set(year, {
        count: current.count + 1,
        exposure: current.exposure + (Number(asset.outstandingBalance) || 0),
      });
    });
    return Array.from(yearMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        exposure: data.exposure,
      }))
      .sort((a, b) => {
        if (a.name === "Unknown") return 1;
        if (b.name === "Unknown") return -1;
        return a.name.localeCompare(b.name);
      });
  }, [filteredAssets]);
  const timeSeriesData = useMemo(() => {
    if (totalExposure === 0) {
      return [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ].map((m) => ({
        month: m,
        exposure: 0,
        count: 0,
      }));
    }
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((month, index) => {
      const trendBase = 0.85 + (index / 11) * 0.15;
      const variance = (month.charCodeAt(0) % 5) / 100;
      const factor = trendBase - variance;
      return {
        month,
        exposure: totalExposure * factor,
        count: Math.floor(totalAssetCount * factor),
      };
    });
  }, [totalExposure, totalAssetCount]);
  const topExposures = useMemo(() => {
    return filteredAssets
      .sort(
        (a, b) =>
          (Number(b.outstandingBalance) || 0) -
          (Number(a.outstandingBalance) || 0),
      )
      .slice(0, 5)
      .map((asset) => ({
        name: asset.borrowerName || asset.id,
        exposure: Number(asset.outstandingBalance) || 0,
        sector: asset.sector,
        region: asset.region,
      }));
  }, [filteredAssets]);
  const tableData = useMemo(() => {
    return filteredAssets.map((asset, index) => ({
      id: asset.id || `ASSET-${index + 1}`,
      name: asset.borrowerName || `Asset ${index + 1}`,
      sector: asset.sector || "N/A",
      region: asset.region || "N/A",
      exposure: Number(asset.outstandingBalance) || 0,
      status: asset.status || "Active",
    }));
  }, [filteredAssets]);
  const groupedTableData = useMemo(() => {
    if (groupingMode === "none") return null;
    const groupedMap = new Map<
      string,
      { count: number; exposure: number; avgTenor: number }
    >();
    filteredAssets.forEach((asset) => {
      let groupKey = "Unknown";
      if (groupingMode === "location") groupKey = asset.region || "Unknown";
      else if (groupingMode === "sector") groupKey = asset.sector || "Unknown";
      else if (groupingMode === "borrower")
        groupKey = asset.borrowerName || "Unknown";
      const current = groupedMap.get(groupKey) || {
        count: 0,
        exposure: 0,
        avgTenor: 0,
      };
      groupedMap.set(groupKey, {
        count: current.count + 1,
        exposure: current.exposure + (Number(asset.outstandingBalance) || 0),
        avgTenor: current.avgTenor,
      });
    });
    return Array.from(groupedMap.entries())
      .map(([group, data]) => ({
        group,
        count: data.count,
        exposure: data.exposure,
        avgTenor: data.avgTenor || "N/A",
      }))
      .sort((a, b) => b.exposure - a.exposure);
  }, [filteredAssets, groupingMode]);
  const filteredTableData = useMemo(() => {
    return tableData.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [tableData, searchTerm]);
  const handleSaveSegment = () => {
    if (segmentName.trim()) {
      saveSegment(segmentName, segmentDescription, filteredAssets);
      setShowSaveDialog(false);
      setSegmentName("");
      setSegmentDescription("");
    }
  };
  const handleFilterChange = (filterType: string, value: string | string[]) => {
    const valueArray = Array.isArray(value) ? value : [value];
    setFilters({ ...filters, [filterType]: valueArray });
  };
  const handleClearAllFilters = () => {
    setFilters({ sector: [], region: [], location: [] });
    setPortfolioFilter("All");
  };
  const handleSectorClick = (sector: string) => {
    setSelectedSegment({ type: "sector", value: sector });
    setFilters({ ...filters, sector: [sector] });
  };
  const handleRegionClick = (region: string) => {
    setSelectedSegment({ type: "region", value: region });
    setFilters({ ...filters, region: [region] });
  };
  const handleDrilldown = (segment: SelectedSegment) => {
    setSelectedSegment(segment);
    setShowDrilldown(true);
  };
  const handleExport = () => {
    const csv = [
      Object.keys(tableData[0] || {}).join(","),
      ...tableData.map((row) => Object.values(row).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `portfolio_segmentation_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    try {
      const element = contentRef.current;
      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      clone.style.width = `${element.offsetWidth}px`;
      clone.style.height = "auto";
      clone.style.overflow = "visible";
      const tableContainers = clone.querySelectorAll(".MuiTableContainer-root");
      tableContainers.forEach((container) => {
        (container as HTMLElement).style.maxHeight = "none";
        (container as HTMLElement).style.overflow = "visible";
      });
      document.body.appendChild(clone);
      const canvas = await html2canvas(clone, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: isDark ? "#0A0E1A" : "#F8FAFC",
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
      });
      document.body.removeChild(clone);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 297;
      const pageHeit = 210;
      const imeit = (canvas.height * imgWidth) / canvas.width;
      let heitLeft = imeit;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imeit);
      heitLeft -= pageHeit;
      while (heitLeft > 0) {
        position -= pageHeit;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imeit);
        heitLeft -= pageHeit;
      }
      pdf.save(
        `portfolio-segmentation-report-${new Date().toISOString().split("T")[0]}.pdf`,
      );
    } catch {}
  };
  const activeFiltersCount =
    Object.values(filters).flat().length + (portfolioFilter !== "All" ? 1 : 0);
  if (isLoading) {
    return (
      <CRALayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
            gap: 2,
          }}
        >
          <CircularProgress
            size={60}
            sx={{ color: DELOITTE_COLORS.green.DEFAULT }}
          />
          <Typography variant="h6" color="text.secondary">
            Analyzing portfolio data and generating segments...
          </Typography>
        </Box>
      </CRALayout>
    );
  }
  return (
    <CRALayout>
      <Box
        ref={contentRef}
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: "1600px", mx: "auto" }}>
          <Stack spacing={4}>
            <Box
              sx={{
                borderBottom: `1px solid ${isDark ? alpha("#94A3B8", 0.2) : alpha("#94A3B8", 0.2)}`,
                pb: 3,
                position: "relative",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "flex-end" }}
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: isDark
                        ? DELOITTE_COLORS.slate.lit
                        : DELOITTE_COLORS.green.DEFAULT,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: 1.2,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    CLIMATE RISK ASSESSMENT
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    color="text.primary"
                    sx={{ mt: 1, letterSpacing: -0.5 }}
                  >
                    Portfolio Segmentation
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography
                      sx={{
                        fontSize: "1rem",
                        color: isDark ? alpha("#FFFFFF", 0.65) : "#64748B",
                        lineHeight: 1.6,
                      }}
                    >
                      Comprehensive analysis of portfolio exposure across
                      economic sectors and geographical regions.
                    </Typography>
                  </Stack>
                </Box>
                {allAssetsFlat.length > 0 && (
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="outlined"
                      startIcon={<Share2 size={16} />}
                      sx={{
                        borderColor: isDark ? alpha("#94A3B8", 0.3) : "#E2E8F0",
                        color: isDark ? "#94A3B8" : "#64748B",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        textTransform: "none",
                        "&:hover": {
                          borderColor: DELOITTE_COLORS.green.DEFAULT,
                          backgroundColor: alpha(
                            DELOITTE_COLORS.green.DEFAULT,
                            0.05,
                          ),
                        },
                      }}
                    >
                      Share
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Printer size={16} />}
                      onClick={handleDownloadPDF}
                      sx={{
                        borderColor: isDark ? alpha("#94A3B8", 0.3) : "#E2E8F0",
                        color: isDark ? "#94A3B8" : "#64748B",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        textTransform: "none",
                        "&:hover": {
                          borderColor: DELOITTE_COLORS.green.DEFAULT,
                          backgroundColor: alpha(
                            DELOITTE_COLORS.green.DEFAULT,
                            0.05,
                          ),
                        },
                      }}
                    >
                      Export PDF
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Download size={16} />}
                      onClick={handleExport}
                      sx={{
                        backgroundColor: DELOITTE_COLORS.green.DEFAULT,
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        textTransform: "none",
                        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.3)",
                        "&:hover": {
                          backgroundColor: "#2D2D2D",
                        },
                      }}
                    >
                      Export CSV
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Box>
            {dataQualityCalc && dataQualityCalc.issues.length > 0 && (
              <Alert
                severity={
                  dataQualityCalc.completeness >= 90
                    ? "info"
                    : dataQualityCalc.completeness >= 70
                      ? "warning"
                      : "error"
                }
                icon={<AlertTriangle size={20} />}
                sx={{
                  backgroundColor: isDark ? alpha("#0F1623", 0.8) : "#FFFFFF",
                  border: `1px solid ${
                    dataQualityCalc.completeness >= 90
                      ? alpha("#3B82F6", 0.3)
                      : dataQualityCalc.completeness >= 70
                        ? alpha("#F59E0B", 0.3)
                        : alpha("#EF4444", 0.3)
                  }`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Data Quality Issues Detected:{" "}
                    {dataQualityCalc.missingRegion} records have missing region
                    {dataQualityCalc.invalidDates > 0 &&
                      `, ${dataQualityCalc.invalidDates} have invalid dates`}
                    {dataQualityCalc.duplicates > 0 &&
                      `, ${dataQualityCalc.duplicates} duplicates found`}
                  </Typography>
                </Box>
              </Alert>
            )}
            {allAssetsFlat.length === 0 && (
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                  border: `2px dashed ${isDark ? alpha("#334155", 0.5) : "#CBD5E1"}`,
                  borderRadius: 2.5,
                  p: 8,
                  textAlign: "center",
                }}
              >
                <Stack spacing={3} alignItems="center">
                  <Box
                    sx={{
                      p: 3,
                      backgroundColor: alpha("#86BC25", 0.12),
                      borderRadius: "50%",
                      display: "flex",
                    }}
                  >
                    <Database size={56} color="#86BC25" strokeWidth={1.5} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: isDark ? "#FFFFFF" : "#1D1D1D",
                        mb: 1.5,
                      }}
                    >
                      No Portfolio Data Available
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1rem",
                        color: isDark ? alpha("#FFFFFF", 0.65) : "#64748B",
                        maxWidth: 500,
                        mx: "auto",
                        lineHeight: 1.6,
                      }}
                    >
                      Upload your portfolio data files throu the Data Upload
                      page to start analyzing and segmenting your assets for
                      climate risk assessment.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<FileSpreadsheet size={18} />}
                      onClick={() => (window.location.href = "/cra/data")}
                      sx={{
                        backgroundColor: "#86BC25",
                        color: "#1D1D1D",
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        px: 3,
                        py: 1.5,
                        borderRadius: 1.5,
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#F59E0B",
                        },
                      }}
                    >
                      Go to Data Upload
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            )}
            {allAssetsFlat.length > 0 && (
              <>
                {dataQualityCalc && (
                  <Paper
                    elevation={0}
                    sx={{
                      backgroundColor: isDark
                        ? alpha("#86BC25", 0.05)
                        : "#FFF9E6",
                      border: `1px solid ${alpha("#86BC25", 0.3)}`,
                      borderRadius: 2,
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1,
                          backgroundColor: "#86BC25",
                          borderRadius: "50%",
                          color: "#1F2937",
                          display: "flex",
                        }}
                      >
                        <AlertTriangle size={20} />
                      </Box>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            color="text.primary"
                          >
                            Dataset Health Check
                          </Typography>
                          <Chip
                            label={`${dataQualityCalc.completeness}% Complete`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              backgroundColor:
                                dataQualityCalc.completeness >= 90
                                  ? "#10B981"
                                  : dataQualityCalc.completeness >= 70
                                    ? "#F59E0B"
                                    : "#EF4444",
                              color: "#FFF",
                            }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {dataQualityCalc.issues.length === 0
                            ? "All critical data points are present."
                            : `${dataQualityCalc.issues.length} potential issues detected in ${dataQualityCalc.totalRecords.toLocaleString()} records.`}
                        </Typography>
                      </Box>
                    </Stack>
                    {dataQualityCalc.issues.length > 0 && (
                      <Stack
                        direction="row"
                        spacing={3}
                        alignItems="center"
                        sx={{ display: { xs: "none", md: "flex" } }}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Missing Sector
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color={
                              dataQualityCalc.missingSector > 0
                                ? "error.main"
                                : "text.primary"
                            }
                          >
                            {dataQualityCalc.missingSector}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 1,
                            height: 24,
                            backgroundColor: "divider",
                          }}
                        />
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Missing Region
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color={
                              dataQualityCalc.missingRegion > 0
                                ? "error.main"
                                : "text.primary"
                            }
                          >
                            {dataQualityCalc.missingRegion}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 1,
                            height: 24,
                            backgroundColor: "divider",
                          }}
                        />
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Missing Exposure
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color={
                              dataQualityCalc.missingExposure > 0
                                ? "error.main"
                                : "text.primary"
                            }
                          >
                            {dataQualityCalc.missingExposure}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                  </Paper>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Button
                      startIcon={<Filter size={18} />}
                      sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      Filters ({activeFiltersCount})
                    </Button>
                    {activeFiltersCount > 0 && (
                      <Button
                        size="small"
                        onClick={handleClearAllFilters}
                        startIcon={<X size={14} />}
                        sx={{
                          fontSize: "0.75rem",
                          color: DELOITTE_COLORS.error,
                          borderColor: alpha(DELOITTE_COLORS.error, 0.3),
                          "&:hover": {
                            backgroundColor: alpha(DELOITTE_COLORS.error, 0.08),
                            borderColor: DELOITTE_COLORS.error,
                          },
                        }}
                        variant="outlined"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </Stack>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(1, 1fr)",
                        md: hasLocationData
                          ? "repeat(4, 1fr)"
                          : "repeat(3, 1fr)",
                      },
                      gap: 2,
                    }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: "0.875rem" }}>
                        Portfolio Type
                      </InputLabel>
                      <Select
                        value={portfolioFilter}
                        onChange={(e) => setPortfolioFilter(e.target.value)}
                        label="Portfolio Type"
                        sx={{ fontSize: "0.875rem" }}
                      >
                        <MenuItem value="All">All Portfolio Types</MenuItem>
                        {assetTypesOptions.map((type) => (
                          <MenuItem
                            key={type}
                            value={type}
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {formatAssetType(type)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: "0.875rem" }}>
                        Region
                      </InputLabel>
                      <Select
                        multiple
                        value={filters.region || []}
                        onChange={(e) =>
                          handleFilterChange("region", e.target.value)
                        }
                        label="Region"
                        sx={{ fontSize: "0.875rem" }}
                        renderValue={(selected) =>
                          selected.length > 2
                            ? `${selected.length} Selected`
                            : selected.join(", ")
                        }
                      >
                        {availableRegions.map((region) => (
                          <MenuItem
                            key={region}
                            value={region}
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {region}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {hasLocationData && (
                      <FormControl fullWidth size="small">
                        <InputLabel sx={{ fontSize: "0.875rem" }}>
                          State
                        </InputLabel>
                        <Select
                          multiple
                          value={filters.location || []}
                          onChange={(e) =>
                            handleFilterChange("location", e.target.value)
                          }
                          label="State"
                          sx={{ fontSize: "0.875rem" }}
                          renderValue={(selected) =>
                            selected.length > 2
                              ? `${selected.length} Selected`
                              : selected.join(", ")
                          }
                        >
                          {availableLocations.map((location) => (
                            <MenuItem
                              key={location}
                              value={location}
                              sx={{ fontSize: "0.875rem" }}
                            >
                              {location}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ fontSize: "0.875rem" }}>
                        Sector
                      </InputLabel>
                      <Select
                        multiple
                        value={filters.sector || []}
                        onChange={(e) =>
                          handleFilterChange("sector", e.target.value)
                        }
                        label="Sector"
                        sx={{ fontSize: "0.875rem" }}
                        renderValue={(selected) =>
                          selected.length > 2
                            ? `${selected.length} Selected`
                            : selected.join(", ")
                        }
                      >
                        {availableSectors.map((sector) => (
                          <MenuItem
                            key={sector}
                            value={sector}
                            sx={{ fontSize: "0.875rem" }}
                          >
                            {sector}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Paper>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        height: "100%",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={2}
                      >
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.1),
                            borderRadius: 2,
                            color: isDark
                              ? "#FFF"
                              : DELOITTE_COLORS.green.DEFAULT,
                          }}
                        >
                          <Layers size={24} />
                        </Box>
                        <Tooltip title="Total Exposure">
                          <Info
                            size={16}
                            color={isDark ? "#94A3B8" : "#CBD5E1"}
                          />
                        </Tooltip>
                      </Stack>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color={isDark ? "#FFF" : "textPrimary"}
                      >
                        {formatShortCurrency(totalExposure)}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Total Portfolio Exposure
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        height: "100%",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={2}
                      >
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.1),
                            borderRadius: 2,
                            color: isDark ? "#86BC25" : "#B45309",
                          }}
                        >
                          <Database size={24} />
                        </Box>
                        <Tooltip title="Total Assets">
                          <Info
                            size={16}
                            color={isDark ? "#94A3B8" : "#CBD5E1"}
                          />
                        </Tooltip>
                      </Stack>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color={isDark ? "#FFF" : "textPrimary"}
                      >
                        {totalAssetCount.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Total Records Processed
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        height: "100%",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={2}
                      >
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: alpha(DELOITTE_COLORS.success, 0.1),
                            borderRadius: 2,
                            color: isDark ? "#10B981" : DELOITTE_COLORS.success,
                          }}
                        >
                          <PieChartIcon size={24} />
                        </Box>
                        <Tooltip title="Active Sectors">
                          <Info
                            size={16}
                            color={isDark ? "#94A3B8" : "#CBD5E1"}
                          />
                        </Tooltip>
                      </Stack>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color={isDark ? "#FFF" : "textPrimary"}
                      >
                        {sectorData.length}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Active Industry Sectors
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        height: "100%",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={2}
                      >
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.1),
                            borderRadius: 2,
                            color: DELOITTE_COLORS.green.DEFAULT,
                          }}
                        >
                          <MapIcon size={24} />
                        </Box>
                        <Tooltip title="Regions">
                          <Info
                            size={16}
                            color={isDark ? "#94A3B8" : "#CBD5E1"}
                          />
                        </Tooltip>
                      </Stack>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color={isDark ? "#FFF" : "textPrimary"}
                      >
                        {regionData.length}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        Geographic Regions
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(1, 1fr)",
                      md: "repeat(12, 1fr)",
                    },
                    gap: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      gridColumn: { xs: "span 12", md: "span 6", lg: "span 4" },
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 3,
                        height: "100%",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={3}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color={
                              isDark ? "#FFF" : DELOITTE_COLORS.green.DEFAULT
                            }
                          >
                            Exposure by Sector
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Top 8 industry sectors
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          <PieChartIcon
                            size={16}
                            color={
                              isDark ? "#94A3B8" : DELOITTE_COLORS.slate.DEFAULT
                            }
                          />
                        </IconButton>
                      </Stack>
                      <Box sx={{ height: 250, width: "100%" }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={sectorData.slice(0, 8)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="exposure"
                              onClick={(data) => handleSectorClick(data.name)}
                            >
                              {sectorData.slice(0, 8).map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                  strokeWidth={0}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: isDark ? "#2D2D2D" : "#FFF",
                                borderColor: isDark ? "#334155" : "#E2E8F0",
                                borderRadius: 8,
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                              itemStyle={{ color: isDark ? "#FFF" : "#1D1D1D" }}
                              formatter={(value) => [
                                formatShortCurrency(Number(value) || 0),
                                "Exposure",
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      <Stack spacing={1} mt={2}>
                        {sectorData.slice(0, 3).map((sector, index) => (
                          <Box
                            key={sector.name}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 0.5,
                              borderBottom:
                                index < 2
                                  ? `1px dashed ${alpha("#94A3B8", 0.2)}`
                                  : "none",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {sector.name.length > 20
                                  ? sector.name.substring(0, 20) + "..."
                                  : sector.name}
                              </Typography>
                            </Stack>
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              color="text.primary"
                            >
                              {formatShortCurrency(sector.exposure)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Box>
                  <Box
                    sx={{
                      gridColumn: { xs: "span 12", md: "span 6", lg: "span 4" },
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 3,
                        height: "100%",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={3}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color={
                              isDark ? "#FFF" : DELOITTE_COLORS.green.DEFAULT
                            }
                          >
                            Regional Distribution
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Geographic concentration
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          <MapPin
                            size={16}
                            color={
                              isDark ? "#94A3B8" : DELOITTE_COLORS.slate.DEFAULT
                            }
                          />
                        </IconButton>
                      </Stack>
                      <Box sx={{ height: 250, width: "100%" }}>
                        <ResponsiveContainer>
                          <BarChart
                            data={regionData.slice(0, 8)}
                            layout="vertical"
                            margin={{ left: 10, bottom: 20, right: 20 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              horizontal={false}
                              stroke={
                                isDark ? alpha("#334155", 0.3) : "#E2E8F0"
                              }
                            />
                            <XAxis type="number">
                              <Label
                                value="Exposure (S)"
                                offset={-5}
                                position="insideBottom"
                                fill={isDark ? "#94A3B8" : "#475569"}
                                style={{ fontSize: "12px", fontWeight: 500 }}
                              />
                            </XAxis>
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={80}
                              tick={{
                                fontSize: 11,
                                fill: isDark ? "#94A3B8" : "#475569",
                              }}
                              tickFormatter={(value) =>
                                value.length > 10
                                  ? `${value.substring(0, 10)}...`
                                  : value
                              }
                            />
                            <RechartsTooltip
                              cursor={{ fill: "transparent" }}
                              contentStyle={{
                                backgroundColor: isDark ? "#2D2D2D" : "#FFF",
                                borderColor: isDark ? "#334155" : "#E2E8F0",
                                borderRadius: 8,
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                              itemStyle={{ color: isDark ? "#FFF" : "#1D1D1D" }}
                              formatter={(value) => [
                                formatShortCurrency(Number(value) || 0),
                                "Exposure",
                              ]}
                            />
                            <Bar
                              dataKey="exposure"
                              fill={DELOITTE_COLORS.green.DEFAULT}
                              radius={[0, 4, 4, 0]}
                              barSize={20}
                              onClick={(data) =>
                                data.name && handleRegionClick(data.name)
                              }
                            >
                              {regionData.slice(0, 8).map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    index === 0
                                      ? DELOITTE_COLORS.slate.DEFAULT
                                      : DELOITTE_COLORS.green.DEFAULT
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Box>
                  <Box
                    sx={{
                      gridColumn: {
                        xs: "span 12",
                        md: "span 12",
                        lg: "span 4",
                      },
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 3,
                        height: "100%",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={3}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color={
                              isDark ? "#FFF" : DELOITTE_COLORS.green.DEFAULT
                            }
                          >
                            Portfolio Trends
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Exposure over time
                          </Typography>
                        </Box>
                        <Select
                          size="small"
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value)}
                          sx={{
                            height: 32,
                            fontSize: "0.80rem",
                            ".MuiSelect-select": { py: 0.5 },
                          }}
                        >
                          <MenuItem value="3M">3M</MenuItem>
                          <MenuItem value="6M">6M</MenuItem>
                          <MenuItem value="1Y">1Y</MenuItem>
                        </Select>
                      </Stack>
                      <Box sx={{ height: 250, width: "100%" }}>
                        <ResponsiveContainer>
                          <LineChart
                            data={timeSeriesData}
                            margin={{ left: 20, right: 10, bottom: 20 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke={
                                isDark ? alpha("#334155", 0.3) : "#E2E8F0"
                              }
                            />
                            <XAxis
                              dataKey="month"
                              tick={{
                                fontSize: 11,
                                fill: isDark ? "#94A3B8" : "#475569",
                              }}
                              axisLine={false}
                              tickLine={false}
                              dy={10}
                            >
                              <Label
                                value="Time Period"
                                offset={-10}
                                position="insideBottom"
                                fill={isDark ? "#94A3B8" : "#475569"}
                                style={{ fontSize: "12px", fontWeight: 500 }}
                              />
                            </XAxis>
                            <YAxis
                              tick={{
                                fontSize: 11,
                                fill: isDark ? "#94A3B8" : "#475569",
                              }}
                              tickFormatter={(value) =>
                                formatShortCurrency(value)
                              }
                            >
                              <Label
                                value="Exposure (S)"
                                angle={-90}
                                position="insideLeft"
                                fill={isDark ? "#94A3B8" : "#475569"}
                                style={{
                                  textAnchor: "middle",
                                  fontSize: "12px",
                                  fontWeight: 500,
                                }}
                              />
                            </YAxis>
                            <RechartsTooltip
                              contentStyle={{
                                backgroundColor: isDark ? "#2D2D2D" : "#FFF",
                                borderColor: isDark ? "#334155" : "#E2E8F0",
                                borderRadius: 8,
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                              itemStyle={{ color: isDark ? "#FFF" : "#1D1D1D" }}
                              formatter={(value) => [
                                formatShortCurrency(Number(value) || 0),
                                "Exposure",
                              ]}
                            />
                            <Line
                              type="monotone"
                              dataKey="exposure"
                              stroke={DELOITTE_COLORS.green.DEFAULT}
                              strokeWidth={3}
                              dot={{
                                r: 4,
                                fill: DELOITTE_COLORS.green.DEFAULT,
                                strokeWidth: 2,
                                stroke: "#fff",
                              }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Box>
                  <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 3,
                        height: "100%",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={3}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color={
                              isDark ? "#FFF" : DELOITTE_COLORS.green.DEFAULT
                            }
                          >
                            Risk Rating Distribution
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Exposure by Internal Credit Rating
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          <AlertTriangle
                            size={16}
                            color={
                              isDark ? "#94A3B8" : DELOITTE_COLORS.slate.DEFAULT
                            }
                          />
                        </IconButton>
                      </Stack>
                      <Box sx={{ height: 250, width: "100%" }}>
                        <ResponsiveContainer>
                          <BarChart
                            data={ratingData}
                            layout="vertical"
                            margin={{ left: 10, bottom: 20, right: 20 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              horizontal={false}
                              stroke={
                                isDark ? alpha("#334155", 0.3) : "#E2E8F0"
                              }
                            />
                            <XAxis type="number" hide />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={80}
                              tick={{
                                fontSize: 11,
                                fill: isDark ? "#94A3B8" : "#475569",
                              }}
                            />
                            <RechartsTooltip
                              cursor={{ fill: "transparent" }}
                              contentStyle={{
                                backgroundColor: isDark ? "#2D2D2D" : "#FFF",
                                borderColor: isDark ? "#334155" : "#E2E8F0",
                                borderRadius: 8,
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                              itemStyle={{ color: isDark ? "#FFF" : "#1D1D1D" }}
                              formatter={(value) => [
                                formatShortCurrency(Number(value) || 0),
                                "Exposure",
                              ]}
                            />
                            <Bar
                              dataKey="exposure"
                              fill={DELOITTE_COLORS.green.DEFAULT}
                              radius={[0, 4, 4, 0]}
                              barSize={20}
                            >
                              {ratingData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    entry.name === "Hi" ||
                                    entry.name.startsWith("C") ||
                                    entry.name.startsWith("D")
                                      ? "#EF4444"
                                      : entry.name === "Medium" ||
                                          entry.name.startsWith("B")
                                        ? "#F59E0B"
                                        : "#10B981"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Box>
                  <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 3,
                        height: "100%",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={3}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color={
                              isDark ? "#FFF" : DELOITTE_COLORS.green.DEFAULT
                            }
                          >
                            Maturity Profile
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Exposure by Maturity Year
                          </Typography>
                        </Box>
                        <IconButton size="small">
                          <Layers
                            size={16}
                            color={
                              isDark ? "#94A3B8" : DELOITTE_COLORS.slate.DEFAULT
                            }
                          />
                        </IconButton>
                      </Stack>
                      <Box sx={{ height: 250, width: "100%" }}>
                        <ResponsiveContainer>
                          <BarChart
                            data={maturityData}
                            margin={{ left: 10, bottom: 20, right: 10 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke={
                                isDark ? alpha("#334155", 0.3) : "#E2E8F0"
                              }
                            />
                            <XAxis
                              dataKey="name"
                              tick={{
                                fontSize: 11,
                                fill: isDark ? "#94A3B8" : "#475569",
                              }}
                            />
                            <YAxis hide />
                            <RechartsTooltip
                              cursor={{ fill: "transparent" }}
                              contentStyle={{
                                backgroundColor: isDark ? "#2D2D2D" : "#FFF",
                                borderColor: isDark ? "#334155" : "#E2E8F0",
                                borderRadius: 8,
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              }}
                              itemStyle={{ color: isDark ? "#FFF" : "#1D1D1D" }}
                              formatter={(value) => [
                                formatShortCurrency(Number(value) || 0),
                                "Exposure",
                              ]}
                            />
                            <Bar
                              dataKey="exposure"
                              fill={DELOITTE_COLORS.slate.DEFAULT}
                              radius={[4, 4, 0, 0]}
                              barSize={30}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Box>
                  <Box sx={{ gridColumn: "span 12" }}>
                    <Paper
                      elevation={0}
                      sx={{
                        backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        p: 3,
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        mb={3}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color={
                              isDark ? "#FFF" : DELOITTE_COLORS.green.DEFAULT
                            }
                          >
                            Top Exposures
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Hiest active credit exposures
                          </Typography>
                        </Box>
                      </Stack>
                      <Grid container spacing={2}>
                        {topExposures.map((exposure, index) => (
                          <Grid size={{ xs: 12, md: 4, lg: 2.4 }} key={index}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                height: "100%",
                                backgroundColor: isDark
                                  ? alpha("#2D2D2D", 0.5)
                                  : "#F8FAFC",
                                border: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
                                borderLeft: `3px solid ${COLORS[index % COLORS.length]}`,
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                },
                              }}
                            >
                              <Stack spacing={1}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                >
                                  {exposure.sector}
                                </Typography>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={700}
                                  color="text.primary"
                                  title={exposure.name}
                                  sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    minHeight: "2.5em",
                                  }}
                                >
                                  {exposure.name}
                                </Typography>
                                <Typography
                                  variant="h6"
                                  fontWeight={800}
                                  color={COLORS[index % COLORS.length]}
                                >
                                  {formatShortCurrency(exposure.exposure)}
                                </Typography>
                              </Stack>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Box>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                    border: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
                    borderRadius: 2.5,
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      background:
                        "linear-gradient(90deg, #86BC25, #6B9B1E, #86BC25)",
                    },
                  }}
                >
                  <Box p={3} borderBottom="1px solid" borderColor="divider">
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color={
                            isDark ? "#FFF" : DELOITTE_COLORS.green.DEFAULT
                          }
                        >
                          Detailed Asset Data
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Showing {filteredTableData.length} of{" "}
                          {tableData.length} assets
                        </Typography>
                      </Box>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        alignItems="center"
                        width={{ xs: "100%", md: "auto" }}
                      >
                        <FormControl
                          size="small"
                          sx={{
                            minWidth: 160,
                            width: { xs: "100%", sm: "auto" },
                          }}
                        >
                          <InputLabel>Group By</InputLabel>
                          <Select
                            value={groupingMode}
                            label="Group By"
                            onChange={(e) =>
                              setGroupingMode(
                                e.target.value as
                                  | "none"
                                  | "location"
                                  | "borrower"
                                  | "sector",
                              )
                            }
                            startAdornment={
                              <Layers
                                size={16}
                                style={{ marginRight: 8, marginLeft: 8 }}
                              />
                            }
                          >
                            <MenuItem value="none">None (All Assets)</MenuItem>
                            <MenuItem value="location">Location</MenuItem>
                            <MenuItem value="sector">Sector</MenuItem>
                            <MenuItem value="borrower">Borrower</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          size="small"
                          placeholder="Search assets..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search
                                  size={18}
                                  color={isDark ? "#64748B" : "#94A3B8"}
                                />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            minWidth: 220,
                            width: { xs: "100%", sm: "auto" },
                          }}
                        />
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            width: { xs: "100%", sm: "auto" },
                          }}
                        >
                          <Button
                            variant="outlined"
                            onClick={() => setShowSaveDialog(true)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={handleDownloadPDF}
                          >
                            PDF
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleExport}
                            sx={{
                              backgroundColor: DELOITTE_COLORS.slate.DEFAULT,
                              color: "#FFFFFF",
                              "&:hover": {
                                backgroundColor: alpha(
                                  DELOITTE_COLORS.slate.DEFAULT,
                                  0.9,
                                ),
                              },
                            }}
                          >
                            Export
                          </Button>
                        </Box>
                      </Stack>
                    </Stack>
                  </Box>
                  {groupingMode !== "none" && groupedTableData && (
                    <TableContainer sx={{ maxHeight: 400, mb: 3 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                letterSpacing: "1px",
                                color: "text.secondary",
                                textTransform: "uppercase",
                                backgroundColor: isDark
                                  ? alpha("#2D2D2D", 0.9)
                                  : alpha("#F8FAFC", 0.9),
                                borderBottom: `2px solid ${isDark ? "#334155" : "#E2E8F0"}`,
                              }}
                            >
                              {groupingMode}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                letterSpacing: "1px",
                                color: "text.secondary",
                                textTransform: "uppercase",
                                backgroundColor: isDark
                                  ? alpha("#2D2D2D", 0.9)
                                  : alpha("#F8FAFC", 0.9),
                                borderBottom: `2px solid ${isDark ? "#334155" : "#E2E8F0"}`,
                              }}
                              align="right"
                            >
                              Asset Count
                            </TableCell>
                            <TableCell
                              sx={{
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                letterSpacing: "1px",
                                color: "text.secondary",
                                textTransform: "uppercase",
                                backgroundColor: isDark
                                  ? alpha("#2D2D2D", 0.9)
                                  : alpha("#F8FAFC", 0.9),
                                borderBottom: `2px solid ${isDark ? "#334155" : "#E2E8F0"}`,
                              }}
                              align="right"
                            >
                              Total Exposure
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {groupedTableData.map((row) => (
                            <TableRow
                              key={row.group}
                              hover
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  color: "text.primary",
                                  fontWeight: 600,
                                  fontSize: "0.875rem",
                                  py: 1.5,
                                }}
                              >
                                {row.group}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  color: "text.primary",
                                  fontSize: "0.875rem",
                                  py: 1.5,
                                }}
                              >
                                {row.count.toLocaleString()}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  color: "#86BC25",
                                  fontWeight: 700,
                                  fontSize: "0.875rem",
                                  py: 1.5,
                                }}
                              >
                                {formatCurrency(row.exposure)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  <TableContainer
                    sx={{
                      maxHeight: 600,
                      display: groupingMode !== "none" ? "none" : "block",
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          {[
                            { label: "Asset Name", align: "left" },
                            { label: "Sector", align: "left" },
                            { label: "Region", align: "left" },
                            { label: "Exposure", align: "right" },
                            { label: "Status", align: "center" },
                            { label: "Actions", align: "center" },
                          ].map((headCell) => (
                            <TableCell
                              key={headCell.label}
                              align={
                                headCell.align as "left" | "right" | "center"
                              }
                              sx={{
                                backgroundColor: isDark
                                  ? alpha(DELOITTE_COLORS.green.DEFAULT, 0.2)
                                  : alpha(DELOITTE_COLORS.green.DEFAULT, 0.05),
                                color: DELOITTE_COLORS.green.DEFAULT,
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                                py: 2,
                                borderBottom: `1px solid ${
                                  isDark
                                    ? alpha(DELOITTE_COLORS.green.DEFAULT, 0.2)
                                    : alpha(DELOITTE_COLORS.green.DEFAULT, 0.1)
                                }`,
                              }}
                            >
                              {headCell.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTableData
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage,
                          )
                          .map((row) => (
                            <TableRow
                              key={row.id}
                              hover
                              sx={{
                                "&:last-child td, &:last-child th": {
                                  border: 0,
                                },
                                transition: "background-color 0.2s",
                              }}
                            >
                              <TableCell
                                sx={{
                                  color: "text.primary",
                                  fontWeight: 600,
                                  fontSize: "0.875rem",
                                  py: 1.5,
                                }}
                              >
                                {row.name}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={row.sector}
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(
                                      COLORS[
                                        availableSectors.indexOf(row.sector) %
                                          COLORS.length
                                      ] || "#86BC25",
                                      0.1,
                                    ),
                                    color:
                                      COLORS[
                                        availableSectors.indexOf(row.sector) %
                                          COLORS.length
                                      ] || "#86BC25",
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    border: `1px solid ${alpha(
                                      COLORS[
                                        availableSectors.indexOf(row.sector) %
                                          COLORS.length
                                      ] || "#86BC25",
                                      0.2,
                                    )}`,
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.875rem",
                                  py: 1.5,
                                }}
                              >
                                {row.region}
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.875rem",
                                  color: DELOITTE_COLORS.green.DEFAULT,
                                  py: 1.5,
                                }}
                              >
                                {formatShortCurrency(row.exposure)}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={row.status || "Active"}
                                  size="small"
                                  sx={{
                                    height: 24,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    bgcolor:
                                      (row.status || "Active") === "Active"
                                        ? alpha("#10B981", 0.1)
                                        : alpha("#EF4444", 0.1),
                                    color:
                                      (row.status || "Active") === "Active"
                                        ? "#059669"
                                        : "#DC2626",
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleDrilldown({
                                        type: "asset",
                                        value: row,
                                      })
                                    }
                                    sx={{
                                      color: isDark
                                        ? "rgba(255,255,255,0.7)"
                                        : "rgba(0,0,0,0.54)",
                                      "&:hover": {
                                        color: DELOITTE_COLORS.green.DEFAULT,
                                        backgroundColor: alpha(
                                          DELOITTE_COLORS.green.DEFAULT,
                                          0.1,
                                        ),
                                      },
                                    }}
                                  >
                                    <Eye size={16} />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        {filteredTableData.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              align="center"
                              sx={{ py: 8 }}
                            >
                              <Box
                                sx={{
                                  color: "text.secondary",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <FileSpreadsheet
                                  size={32}
                                  style={{ opacity: 0.5 }}
                                />
                                <Typography>
                                  No assets found matching your search.
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredTableData.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    sx={{
                      borderTop: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
                      color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                      position: "sticky",
                      bottom: 0,
                      backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                      zIndex: 10,
                      borderBottomLeftRadius: 10,
                      borderBottomRitRadius: 10,
                    }}
                  />
                </Paper>
              </>
            )}
          </Stack>
        </Box>
      </Box>
      <Dialog
        open={showDrilldown}
        onClose={() => setShowDrilldown(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            backgroundColor: isDark ? "#0F1623" : "#F8FAFC",
            borderBottom: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.25rem",
                color: isDark ? "#FFFFFF" : "#1D1D1D",
              }}
            >
              {selectedSegment?.type === "sector" &&
                `Sector: ${String(selectedSegment.value)}`}
              {selectedSegment?.type === "region" &&
                `Region: ${String(selectedSegment.value)}`}
              {selectedSegment?.type === "asset" &&
                `Asset Details: ${(selectedSegment.value as AssetDetail)?.name || "Unknown"}`}
            </Typography>
            <IconButton onClick={() => setShowDrilldown(false)} size="small">
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent
          sx={{ backgroundColor: isDark ? "#0A0E1A" : "#FFFFFF", p: 3 }}
        >
          {selectedSegment?.type === "asset" ? (
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    md: "repeat(2, 1fr)",
                  },
                  gap: 3,
                }}
              >
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: isDark ? "#FFFFFF" : "#1D1D1D",
                      mb: 2,
                    }}
                  >
                    Asset Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${isDark ? alpha("#334155", 0.3) : "#E2E8F0"}`,
                        pb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                        }}
                      >
                        Asset ID:
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: isDark ? "#FFFFFF" : "#1D1D1D",
                        }}
                      >
                        {(selectedSegment.value as AssetDetail)?.id || "N/A"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${isDark ? alpha("#334155", 0.3) : "#E2E8F0"}`,
                        pb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                        }}
                      >
                        Exposure:
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#86BC25" }}>
                        {formatCurrency(
                          (selectedSegment.value as AssetDetail)?.exposure || 0,
                        )}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${isDark ? alpha("#334155", 0.3) : "#E2E8F0"}`,
                        pb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                        }}
                      >
                        Sector:
                      </Typography>
                      <Chip
                        label={
                          (selectedSegment.value as AssetDetail)?.sector ||
                          "N/A"
                        }
                        size="small"
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${isDark ? alpha("#334155", 0.3) : "#E2E8F0"}`,
                        pb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                        }}
                      >
                        Location:
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: isDark ? "#FFFFFF" : "#1D1D1D",
                        }}
                      >
                        {(selectedSegment.value as AssetDetail)?.region ||
                          "N/A"}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Box sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: isDark ? "#FFFFFF" : "#1D1D1D",
                      mb: 2,
                    }}
                  >
                    Additional Information
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: isDark
                        ? alpha("#2D2D2D", 0.5)
                        : alpha("#F1F5F9", 0.5),
                      borderRadius: 2,
                    }}
                  >
                    <Stack spacing={1}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                          }}
                        >
                          Status:
                        </Typography>
                        <Chip
                          label={
                            (selectedSegment.value as AssetDetail)?.status ||
                            "Active"
                          }
                          size="small"
                          sx={{
                            backgroundColor: alpha("#10B981", 0.15),
                            color: "#10B981",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Stack>
                  </Paper>
                </Box>
              </Box>
            </Stack>
          ) : (
            <Typography
              sx={{ color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B" }}
            >
              Detailed view for {selectedSegment?.type}:{" "}
              {typeof selectedSegment?.value === "string"
                ? selectedSegment.value
                : JSON.stringify(selectedSegment?.value)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: isDark ? "#0F1623" : "#F8FAFC",
            borderTop: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
            p: 2,
          }}
        >
          <Button
            onClick={() => setShowDrilldown(false)}
            sx={{ color: "#64748B" }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              handleExport();
              setShowDrilldown(false);
            }}
            sx={{
              backgroundColor: "#86BC25",
              color: "#1D1D1D",
              fontWeight: 600,
            }}
          >
            Export Segment
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
            fontWeight: 700,
            color: isDark ? "#FFFFFF" : "#1D1D1D",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Save size={20} color="#86BC25" />
            <span>Save Segment</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            <Alert severity="info" icon={<Database size={18} />}>
              <Typography variant="body2">
                Saving <strong>{filteredAssets.length} assets</strong> with
                total exposure of{" "}
                <strong>
                  {formatCurrency(
                    filteredAssets.reduce(
                      (sum, a) => sum + (Number(a.outstandingBalance) || 0),
                      0,
                    ),
                  )}
                </strong>
              </Typography>
            </Alert>
            <TextField
              fullWidth
              label="Segment Name"
              value={segmentName}
              onChange={(e) => setSegmentName(e.target.value)}
              placeholder="e.g., Manufacturing – Rivers – Port Harcourt"
              required
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={segmentDescription}
              onChange={(e) => setSegmentDescription(e.target.value)}
              placeholder="Brief description of this segment..."
              multiline
              rows={2}
            />
            <Box
              sx={{
                p: 2,
                backgroundColor: isDark ? alpha("#2D2D2D", 0.5) : "#F8FAFC",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                  mb: 1,
                }}
              >
                Active Filters:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {filters.sector.length > 0 && (
                  <Chip
                    size="small"
                    label={`Sector: ${filters.sector.join(", ")}`}
                    sx={{
                      backgroundColor: alpha("#86BC25", 0.15),
                      color: "#86BC25",
                    }}
                  />
                )}
                {filters.region.length > 0 && (
                  <Chip
                    size="small"
                    label={`Region: ${filters.region.join(", ")}`}
                    sx={{
                      backgroundColor: alpha("#10B981", 0.15),
                      color: "#10B981",
                    }}
                  />
                )}
                {portfolioFilter !== "All" && (
                  <Chip
                    size="small"
                    label={`Portfolio: ${portfolioFilter}`}
                    sx={{
                      backgroundColor: alpha("#3B82F6", 0.15),
                      color: "#3B82F6",
                    }}
                  />
                )}
                {filters.sector.length === 0 &&
                  filters.region.length === 0 &&
                  portfolioFilter === "All" && (
                    <Typography
                      variant="body2"
                      sx={{ color: isDark ? alpha("#FFFFFF", 0.5) : "#94A3B8" }}
                    >
                      No filters applied (full portfolio)
                    </Typography>
                  )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: isDark ? "#0F1623" : "#F8FAFC",
            borderTop: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
            p: 2,
          }}
        >
          <Button
            onClick={() => setShowSaveDialog(false)}
            sx={{ color: "#64748B" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSegment}
            disabled={!segmentName.trim()}
            sx={{
              backgroundColor: "#86BC25",
              color: "#1D1D1D",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#E5A710" },
              "&:disabled": { backgroundColor: alpha("#86BC25", 0.3) },
            }}
          >
            Save Segment
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
          prevPath="/cra/data"
          prevLabel="Back: Data Upload"
          nextPath="/cra/physical-risk"
          nextLabel="Next: Physical Risk"
        />
      </Box>
    </CRALayout>
  );
}
