import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { getAssetExposure } from "@/lib/utils";
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
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ChevronDown,
  Check,
} from "lucide-react";
import CRANavigation from "../components/CRANavigation";
import { useSegmentationStore, useCRADataStore } from "@/store/craStore";
import CRALayout from "../layout/CRALayout";
import {
  formatCurrency,
  formatShortCurrency,
  formatAssetType,
} from "../utils/craUtils";
import { NIGERIA_REGIONS, NIGERIA_LOCATIONS } from "../data/constants";
import { useIndustry } from "@/hooks/useIndustry";
import { useThemeStore } from "@/store/themeStore";
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
import { useNavigate } from "react-router-dom";

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
];

// ─── Custom multi-checkbox dropdown ──────────────────────────────────────────
function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  onClear,
  isDark,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  onClear: () => void;
  isDark: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full h-10 px-3 flex items-center justify-between gap-2 rounded-xl border text-sm font-medium transition-all outline-none ${
          open
            ? "border-[#86BC25] ring-2 ring-[#86BC25]/15"
            : "border-[#E0E0DE] dark:border-white/[0.10]"
        } ${isDark ? "bg-[#1C1C1C] text-white/80" : "bg-white text-[#1A1A1A]"}`}
      >
        <span
          className={
            selected.length > 0
              ? "text-[#86BC25] font-semibold"
              : "text-[#888] dark:text-white/40"
          }
        >
          {selected.length > 0
            ? `${selected.length} selected`
            : `All ${label}s`}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""} text-[#AAA]`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-30 top-[calc(100%+6px)] left-0 w-64 rounded-2xl border shadow-2xl overflow-hidden ${isDark ? "bg-[#1C1C1C] border-white/[0.10]" : "bg-white border-[#E5E5E3]"}`}
        >
          <div
            className={`flex items-center justify-between px-3 py-2.5 border-b ${isDark ? "border-white/[0.07] bg-[#222]" : "border-[#F0F0EE] bg-[#FAFAFA]"}`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#AAA] dark:text-white/30">
              {label}
            </span>
            {selected.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <X size={11} /> Clear
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto">
            {options.length === 0 ? (
              <p className="px-3 py-4 text-sm text-center text-[#AAA] dark:text-white/30">
                No options available
              </p>
            ) : (
              options.map((opt) => {
                const isChecked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    onClick={() => onToggle(opt)}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${isDark ? "hover:bg-white/[0.05]" : "hover:bg-[#F6F9F2]"}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isChecked ? "bg-[#86BC25] border-[#86BC25]" : "border-[#CCC] dark:border-white/[0.25]"}`}
                    >
                      {isChecked && (
                        <Check
                          size={10}
                          className="text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <span className="text-sm text-[#333] dark:text-white/70 truncate">
                      {opt}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function PortfolioSegmentation() {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const { config: industryConfig } = useIndustry();
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
  const navigate = useNavigate();

  const toggleFilter = useCallback(
    (type: "sector" | "region" | "location", value: string) => {
      const current = filters[type] || [];
      setFilters({
        [type]: current.includes(value)
          ? current.filter((x) => x !== value)
          : [...current, value],
      });
    },
    [filters, setFilters],
  );

  const allAssetsFlat = useMemo(() => {
    return Object.values(assets).flatMap((assetType) =>
      (assetType.data || []).map((asset) => ({
        ...asset,
        _sourceType: assetType.type,
      })),
    );
  }, [assets]);

  const assetTypesOptions = useMemo(() => {
    return Object.values(assets)
      .filter((a) => a.data && a.data.length > 0)
      .map((a) => a.type);
  }, [assets]);

  const dataQualityCalc: DataQuality | null = useMemo(() => {
    if (allAssetsFlat.length === 0) return null;
    const totalRecords = allAssetsFlat.length;
    const missingSector = allAssetsFlat.filter(
      (a) => !a.sector || a.sector.trim() === "",
    ).length;
    const missingRegion = allAssetsFlat.filter(
      (a) => !a.region || a.region.trim() === "",
    ).length;
    const missingExposure = allAssetsFlat.filter(
      (a) => !getAssetExposure(a) && getAssetExposure(a) !== 0,
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
          ? [`${missingSector} records missing sector`]
          : []),
        ...(missingRegion > 0
          ? [`${missingRegion} records missing region`]
          : []),
        ...(missingExposure > 0
          ? [`${missingExposure} records missing exposure`]
          : []),
        ...(invalidDates > 0 ? [`${invalidDates} invalid dates`] : []),
        ...(duplicates > 0 ? [`${duplicates} duplicates`] : []),
      ],
    };
  }, [allAssetsFlat]);

  const availableSectors = useMemo(() => {
    const s = [...new Set(allAssetsFlat.map((a) => a.sector).filter(Boolean))];
    return s.length > 0 ? s : industryConfig.segmentation.sectors;
  }, [allAssetsFlat, industryConfig]);

  const availableRegions = useMemo(() => {
    const r = [
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
    return r.length > 0 ? r : NIGERIA_REGIONS;
  }, [allAssetsFlat]);

  const availableLocations = useMemo(() => {
    let rel = allAssetsFlat;
    if (filters.region && filters.region.length > 0) {
      rel = rel.filter((a) =>
        filters.region.includes(
          ((a as Record<string, unknown>)["Geopolitical Zone"] as string) ||
            a.region,
        ),
      );
    }
    const locs = [
      ...new Set(
        rel
          .map(
            (a) =>
              ((a as Record<string, unknown>)["State"] as string) ||
              ((a as Record<string, unknown>)["Location"] as string) ||
              ((a as Record<string, unknown>)["location"] as string),
          )
          .filter(Boolean),
      ),
    ];
    if (locs.length > 0) return locs;
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
    if (portfolioFilter !== "All")
      result = result.filter((a) => a["_sourceType"] === portfolioFilter);
    if (filters.sector.length > 0)
      result = result.filter((a) => filters.sector.includes(a.sector));
    if (filters.region.length > 0) {
      result = result.filter((a) =>
        filters.region.includes(
          ((a as Record<string, unknown>)["Geopolitical Zone"] as string) ||
            a.region,
        ),
      );
    }
    if (filters.location && filters.location.length > 0) {
      result = result.filter((a) =>
        filters.location.includes(
          ((a as Record<string, unknown>)["State"] as string) ||
            ((a as Record<string, unknown>)["Location"] as string) ||
            ((a as Record<string, unknown>)["location"] as string),
        ),
      );
    }
    return result;
  }, [allAssetsFlat, filters, portfolioFilter]);

  const totalExposure = useMemo(
    () => filteredAssets.reduce((sum, a) => sum + getAssetExposure(a), 0),
    [filteredAssets],
  );
  const totalAssetCount = filteredAssets.length;

  const sectorData = useMemo(() => {
    const map = new Map<string, { count: number; exposure: number }>();
    filteredAssets.forEach((a) => {
      const s = a.sector || "Unclassified";
      const cur = map.get(s) || { count: 0, exposure: 0 };
      map.set(s, {
        count: cur.count + 1,
        exposure: cur.exposure + getAssetExposure(a),
      });
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({
        name,
        count: d.count,
        exposure: d.exposure,
        percentage: totalExposure ? (d.exposure / totalExposure) * 100 : 0,
      }))
      .sort((a, b) => b.exposure - a.exposure);
  }, [filteredAssets, totalExposure]);

  const regionData = useMemo(() => {
    const map = new Map<string, { count: number; exposure: number }>();
    filteredAssets.forEach((a) => {
      const r =
        ((a as Record<string, unknown>)["Geopolitical Zone"] as string) ||
        a.region ||
        "Unclassified";
      const cur = map.get(r) || { count: 0, exposure: 0 };
      map.set(r, {
        count: cur.count + 1,
        exposure: cur.exposure + getAssetExposure(a),
      });
    });
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, count: d.count, exposure: d.exposure }))
      .sort((a, b) => b.exposure - a.exposure)
      .slice(0, 10);
  }, [filteredAssets]);

  const timeSeriesData = useMemo(() => {
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
    if (totalExposure === 0)
      return months.map((m) => ({ month: m, exposure: 0, count: 0 }));
    return months.map((month, i) => {
      const f = 0.85 + (i / 11) * 0.15 - (month.charCodeAt(0) % 5) / 100;
      return {
        month,
        exposure: totalExposure * f,
        count: Math.floor(totalAssetCount * f),
      };
    });
  }, [totalExposure, totalAssetCount]);

  const topExposures = useMemo(() => {
    const sorted = [...filteredAssets].sort(
      (a, b) => getAssetExposure(b) - getAssetExposure(a),
    );
    return sorted.slice(0, 5).map((a) => ({
      name:
        a.borrowerName ||
        ((a as Record<string, unknown>)["Tower ID"] as string) ||
        ((a as Record<string, unknown>)["Segment ID"] as string) ||
        ((a as Record<string, unknown>)["Facility ID"] as string) ||
        ((a as Record<string, unknown>)["Equipment ID"] as string) ||
        a.id,
      exposure: getAssetExposure(a),
      sector: a.sector,
      region:
        ((a as Record<string, unknown>)["Geopolitical Zone"] as string) ||
        a.region,
    }));
  }, [filteredAssets]);

  const tableData = useMemo(() => {
    return filteredAssets.map((a, i) => ({
      id: a.id || `ASSET-${i + 1}`,
      name:
        a.borrowerName ||
        ((a as Record<string, unknown>)["Tower ID"] as string) ||
        ((a as Record<string, unknown>)["Route Name"] as string) ||
        ((a as Record<string, unknown>)["Facility Type"] as string) ||
        `Asset ${i + 1}`,
      sector: a.sector || "N/A",
      region:
        ((a as Record<string, unknown>)["Geopolitical Zone"] as string) ||
        a.region ||
        "N/A",
      exposure: getAssetExposure(a),
      status: a.status || "Active",
    }));
  }, [filteredAssets]);

  const groupedTableData = useMemo(() => {
    if (groupingMode === "none") return null;
    const map = new Map<string, { count: number; exposure: number }>();
    filteredAssets.forEach((a) => {
      let key = "Unknown";
      if (groupingMode === "location")
        key =
          ((a as Record<string, unknown>)["Geopolitical Zone"] as string) ||
          a.region ||
          "Unknown";
      else if (groupingMode === "sector") key = a.sector || "Unknown";
      else if (groupingMode === "borrower") key = a.borrowerName || "Unknown";
      const cur = map.get(key) || { count: 0, exposure: 0 };
      map.set(key, {
        count: cur.count + 1,
        exposure: cur.exposure + getAssetExposure(a),
      });
    });
    return Array.from(map.entries())
      .map(([group, d]) => ({ group, count: d.count, exposure: d.exposure }))
      .sort((a, b) => b.exposure - a.exposure);
  }, [filteredAssets, groupingMode]);

  const filteredTableData = useMemo(() => {
    return tableData.filter((row) =>
      Object.values(row).some((v) =>
        String(v).toLowerCase().includes(searchTerm.toLowerCase()),
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
  const handleClearAllFilters = () => {
    setFilters({ sector: [], region: [], location: [] });
    setPortfolioFilter("All");
  };
  const handleSectorClick = (sector: string) => {
    setSelectedSegment({ type: "sector", value: sector });
    setFilters({ sector: [sector] });
  };
  const handleRegionClick = (region: string) => {
    setSelectedSegment({ type: "region", value: region });
    setFilters({ region: [region] });
  };
  const handleDrilldown = (segment: SelectedSegment) => {
    setSelectedSegment(segment);
    setShowDrilldown(true);
  };
  const handleExport = () => {
    const csv = [
      Object.keys(tableData[0] || {}).join(","),
      ...tableData.map((r) => Object.values(r).join(",")),
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
      const el = contentRef.current;
      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.cssText = `position:absolute;left:-9999px;top:0;width:${el.offsetWidth}px;height:auto;overflow:visible;`;
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
    } catch {
      /* no-op */
    }
  };

  const activeFiltersCount =
    (filters.sector?.length || 0) +
    (filters.region?.length || 0) +
    (filters.location?.length || 0) +
    (portfolioFilter !== "All" ? 1 : 0);
  const totalPages = Math.ceil(filteredTableData.length / rowsPerPage);

  // Shared input class
  const inputCls =
    "w-full h-10 px-3 rounded-xl border border-[#E0E0DE] dark:border-white/[0.10] bg-white dark:bg-white/[0.04] text-sm text-[#1A1A1A] dark:text-white/80 outline-none focus:border-[#86BC25] focus:ring-2 focus:ring-[#86BC25]/10 transition-all";
  const thCls = `px-4 py-3 text-left text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b border-[#EBEBEA] dark:border-white/[0.06] ${isDark ? "bg-[#161616] text-white/30" : "bg-[#FAFAF9] text-[#777]"}`;
  const tdCls =
    "px-4 py-3.5 text-[14px] border-b border-[#F4F4F3] dark:border-white/[0.04]";

  // Progress ring pct: how many sectors are represented vs total asset types
  const uploadedTypeCount = Object.values(assets).filter(
    (a) => a.data && a.data.length > 0,
  ).length;
  const totalTypeCount = Math.max(Object.keys(assets).length, 1);
  const segPct =
    allAssetsFlat.length > 0
      ? Math.round((uploadedTypeCount / totalTypeCount) * 100)
      : 0;

  return (
    <CRALayout>
      <div ref={contentRef} className="flex-1 flex flex-col">
        {/* ── Animations ── */}
        <style>{`
          @keyframes segFadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes segHeroGlow {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50%       { opacity: 0.25; transform: scale(1.06); }
          }
          .seg-fu { animation: segFadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
        `}</style>

        {/* ── HERO HEADER ── */}
        <div className="relative overflow-hidden bg-[#1A3C21] dark:bg-[#0F1F13] flex-shrink-0">
          {/* diagonal grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
            }}
          />
          {/* green glow orb */}
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, #86BC25 0%, transparent 70%)",
              opacity: 0.18,
              animation: "segHeroGlow 6s ease-in-out infinite",
            }}
          />
          <div className="relative px-6 md:px-10 py-7 md:py-9">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                {/* Left: badge + title + subtitle */}
                <div className="seg-fu" style={{ animationDelay: "0ms" }}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-[#86BC25] flex items-center justify-center shrink-0">
                      <PieChartIcon size={13} className="text-white" />
                    </div>
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Climate Risk Assessment — Portfolio Analysis
                    </span>
                  </div>
                  <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-2">
                    {industryConfig.craLabels.portfolioLabel} Segmentation
                  </h1>
                  <p className="text-[13px] text-white/60 leading-relaxed max-w-[520px]">
                    Visualise and segment your portfolio exposure across{" "}
                    {industryConfig.segmentation.segmentDescription} and
                    geographic regions.
                  </p>
                </div>

                {/* Right: stats + progress ring */}
                <div
                  className="seg-fu flex items-center gap-6 shrink-0"
                  style={{ animationDelay: "80ms" }}
                >
                  <div className="flex gap-7 text-center">
                    <div>
                      <div className="text-[24px] font-bold text-white leading-none">
                        {allAssetsFlat.length.toLocaleString()}
                      </div>
                      <div
                        className="text-[10px] text-white/35 uppercase tracking-widest mt-1"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Assets
                      </div>
                    </div>
                    <div>
                      <div className="text-[24px] font-bold text-[#86BC25] leading-none">
                        {sectorData.length}
                      </div>
                      <div
                        className="text-[10px] text-white/35 uppercase tracking-widest mt-1"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Sectors
                      </div>
                    </div>
                    <div>
                      <div className="text-[24px] font-bold text-amber-400 leading-none">
                        {regionData.length}
                      </div>
                      <div
                        className="text-[10px] text-white/35 uppercase tracking-widest mt-1"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Regions
                      </div>
                    </div>
                  </div>
                  {/* SVG progress ring */}
                  <div className="relative w-[56px] h-[56px]">
                    <svg
                      viewBox="0 0 44 44"
                      className="w-14 h-14 -rotate-90"
                      style={{
                        filter: "drop-shadow(0 0 6px rgba(134,188,37,0.3))",
                      }}
                    >
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="22"
                        cy="22"
                        r="18"
                        fill="none"
                        stroke="#86BC25"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 18}`}
                        strokeDashoffset={`${2 * Math.PI * 18 * (1 - segPct / 100)}`}
                        style={{
                          transition:
                            "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[12px] font-bold text-white">
                        {segPct}
                        <span className="text-[8px] text-white/40">%</span>
                      </span>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-bold bg-[#86BC25] text-white hover:bg-[#78AB1F] transition-all whitespace-nowrap"
                    >
                      <Download size={13} /> Export CSV
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold bg-white/10 text-white/80 hover:bg-white/20 border border-white/15 transition-all whitespace-nowrap"
                    >
                      <Printer size={13} /> PDF Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#F2F4F7] dark:bg-[#0C0C0C]">
          <div className="px-6 md:px-10 py-7 space-y-6 max-w-[1400px] mx-auto w-full">
            {/* ── Empty State ── */}
            {allAssetsFlat.length === 0 && (
              <div className="flex flex-col items-center justify-center py-28 rounded-2xl border-2 border-dashed border-[#D5D5D3] dark:border-white/[0.08] bg-white dark:bg-[#111111]">
                <div className="w-20 h-20 rounded-3xl bg-[#86BC25]/10 flex items-center justify-center mb-5">
                  <Database
                    size={40}
                    className="text-[#86BC25]"
                    strokeWidth={1.5}
                  />
                </div>
                <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white/90 mb-2">
                  No Portfolio Data Available
                </h2>
                <p className="text-sm text-[#777] dark:text-white/40 max-w-md text-center leading-relaxed mb-7">
                  Upload portfolio data files through the Data Upload page to
                  start analyzing and segmenting your assets.
                </p>
                <button
                  onClick={() => navigate("/cra/data")}
                  className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#86BC25] text-white text-sm font-bold shadow-[0_2px_16px_rgba(134,188,37,0.35)] hover:bg-[#78AB1F] transition-all"
                >
                  <FileSpreadsheet size={16} /> Go to Data Upload
                </button>
              </div>
            )}

            {/* ── Data quality alert ── */}
            {dataQualityCalc && dataQualityCalc.issues.length > 0 && (
              <div
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
                  dataQualityCalc.completeness >= 90
                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400"
                    : dataQualityCalc.completeness >= 70
                      ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400"
                      : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
                }`}
              >
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>
                  <strong>Data Quality:</strong>{" "}
                  {dataQualityCalc.issues.join(" · ")}
                </span>
              </div>
            )}

            {allAssetsFlat.length > 0 && (
              <>
                {/* ── Dataset Health Banner ── */}
                {dataQualityCalc && (
                  <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-[#86BC25]/30 bg-[#86BC25]/[0.04] dark:bg-[#86BC25]/[0.05]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#86BC25] flex items-center justify-center shrink-0">
                        <AlertTriangle size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-[#1A1A1A] dark:text-white/90">
                            Dataset Health
                          </span>
                          <span
                            className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${dataQualityCalc.completeness >= 90 ? "bg-[#10B981] text-white" : dataQualityCalc.completeness >= 70 ? "bg-amber-500 text-white" : "bg-red-500 text-white"}`}
                          >
                            {dataQualityCalc.completeness}% Complete
                          </span>
                        </div>
                        <p className="text-xs text-[#888] dark:text-white/35 mt-0.5">
                          {dataQualityCalc.issues.length === 0
                            ? "All critical data points are present."
                            : `${dataQualityCalc.issues.length} issue(s) in ${dataQualityCalc.totalRecords.toLocaleString()} records`}
                        </p>
                      </div>
                    </div>
                    {dataQualityCalc.issues.length > 0 && (
                      <div className="hidden md:flex items-center gap-8">
                        {[
                          {
                            label: "Missing Sector",
                            val: dataQualityCalc.missingSector,
                          },
                          {
                            label: "Missing Region",
                            val: dataQualityCalc.missingRegion,
                          },
                          {
                            label: "Missing Exposure",
                            val: dataQualityCalc.missingExposure,
                          },
                        ].map((item, i, arr) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-8"
                          >
                            <div className="text-center">
                              <p className="text-xs text-[#AAA] dark:text-white/30">
                                {item.label}
                              </p>
                              <p
                                className={`text-lg font-bold ${item.val > 0 ? "text-red-500" : "text-[#1A1A1A] dark:text-white/80"}`}
                              >
                                {item.val}
                              </p>
                            </div>
                            {i < arr.length - 1 && (
                              <div className="w-px h-7 bg-[#E0E0DE] dark:bg-white/[0.08]" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Filters Panel ── */}
                <div
                  className={`rounded-2xl border border-[#E0E0DE] dark:border-white/[0.07] p-5 ${isDark ? "bg-[#111111]" : "bg-white"}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <Filter size={15} className="text-[#86BC25]" />
                      <span className="text-sm font-bold text-[#333] dark:text-white/70">
                        Filters
                      </span>
                      {activeFiltersCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#86BC25] text-white text-xs font-bold flex items-center justify-center">
                          {activeFiltersCount}
                        </span>
                      )}
                    </div>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={handleClearAllFilters}
                        className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                      >
                        <X size={13} /> Clear All
                      </button>
                    )}
                  </div>

                  <div
                    className={`grid gap-4 ${hasLocationData ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3"}`}
                  >
                    {/* Portfolio Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-widest text-[#999] dark:text-white/25">
                        Portfolio Type
                      </label>
                      <select
                        value={portfolioFilter}
                        onChange={(e) => setPortfolioFilter(e.target.value)}
                        className={inputCls}
                      >
                        <option value="All">All Portfolio Types</option>
                        {assetTypesOptions.map((t) => (
                          <option key={t} value={t}>
                            {formatAssetType(t)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Region */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-widest text-[#999] dark:text-white/25">
                        Region
                        {filters.region.length > 0 && (
                          <span className="ml-1 text-[#86BC25]">
                            ({filters.region.length})
                          </span>
                        )}
                      </label>
                      <FilterDropdown
                        label="Region"
                        options={availableRegions}
                        selected={filters.region || []}
                        onToggle={(v) => toggleFilter("region", v)}
                        onClear={() => setFilters({ region: [] })}
                        isDark={isDark}
                      />
                    </div>

                    {/* State/Location */}
                    {hasLocationData && (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#999] dark:text-white/25">
                          State
                          {(filters.location?.length ?? 0) > 0 && (
                            <span className="ml-1 text-[#86BC25]">
                              ({filters.location.length})
                            </span>
                          )}
                        </label>
                        <FilterDropdown
                          label="State"
                          options={availableLocations}
                          selected={filters.location || []}
                          onToggle={(v) => toggleFilter("location", v)}
                          onClear={() => setFilters({ location: [] })}
                          isDark={isDark}
                        />
                      </div>
                    )}

                    {/* Sector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-widest text-[#999] dark:text-white/25">
                        Sector
                        {filters.sector.length > 0 && (
                          <span className="ml-1 text-[#86BC25]">
                            ({filters.sector.length})
                          </span>
                        )}
                      </label>
                      <FilterDropdown
                        label="Sector"
                        options={availableSectors}
                        selected={filters.sector || []}
                        onToggle={(v) => toggleFilter("sector", v)}
                        onClear={() => setFilters({ sector: [] })}
                        isDark={isDark}
                      />
                    </div>
                  </div>

                  {/* Active filter chips */}
                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 mt-2 border-t border-dashed border-[#EBEBEA] dark:border-white/[0.06]">
                      {filters.sector.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#86BC25]/10 border border-[#86BC25]/25 text-[#4D7A0D] dark:text-[#A0D040]"
                        >
                          {s}
                          <button onClick={() => toggleFilter("sector", s)}>
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                      {filters.region.map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"
                        >
                          {r}
                          <button onClick={() => toggleFilter("region", r)}>
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                      {(filters.location || []).map((l) => (
                        <span
                          key={l}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400"
                        >
                          {l}
                          <button onClick={() => toggleFilter("location", l)}>
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                      {portfolioFilter !== "All" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
                          {formatAssetType(portfolioFilter)}
                          <button onClick={() => setPortfolioFilter("All")}>
                            <X size={11} />
                          </button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      icon: Layers,
                      label: `Total ${industryConfig.craLabels.exposureLabel}`,
                      value: formatShortCurrency(totalExposure),
                      color: "#86BC25",
                      bg: "bg-[#86BC25]/10",
                    },
                    {
                      icon: Database,
                      label: "Total Records",
                      value: totalAssetCount.toLocaleString(),
                      color: "#3B82F6",
                      bg: "bg-blue-500/10",
                    },
                    {
                      icon: PieChartIcon,
                      label: `Active ${industryConfig.segmentation.segmentLabel}s`,
                      value: String(sectorData.length),
                      color: "#10B981",
                      bg: "bg-emerald-500/10",
                    },
                    {
                      icon: MapIcon,
                      label: "Geographic Regions",
                      value: String(regionData.length),
                      color: "#F59E0B",
                      bg: "bg-amber-500/10",
                    },
                  ].map((card) => (
                    <div
                      key={card.label}
                      className={`rounded-2xl border border-[#E0E0DE] dark:border-white/[0.07] p-5 flex flex-col gap-4 ${isDark ? "bg-[#111111]" : "bg-white"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}
                        >
                          <card.icon size={20} style={{ color: card.color }} />
                        </div>
                        <TrendingUp
                          size={15}
                          className="text-[#DDD] dark:text-white/20"
                        />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#1A1A1A] dark:text-white/90 leading-none">
                          {card.value}
                        </p>
                        <p className="text-xs text-[#888] dark:text-white/35 mt-1.5 font-medium">
                          {card.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Sector Pie */}
                  <div
                    className={`rounded-2xl border border-[#E0E0DE] dark:border-white/[0.07] p-5 ${isDark ? "bg-[#111111]" : "bg-white"}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-bold text-[#1A1A1A] dark:text-white/90">
                          Exposure by Sector
                        </p>
                        <p className="text-xs text-[#AAA] dark:text-white/30 mt-0.5">
                          Top{" "}
                          {industryConfig.segmentation.segmentLabel.toLowerCase()}
                          s
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#F2F4F7] dark:bg-white/[0.05] flex items-center justify-center">
                        <PieChartIcon
                          size={16}
                          className="text-[#888] dark:text-white/40"
                        />
                      </div>
                    </div>
                    <div className="h-[200px]">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={sectorData.slice(0, 8)}
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={76}
                            paddingAngle={2}
                            dataKey="exposure"
                            onClick={(d) => d.name && handleSectorClick(d.name)}
                          >
                            {sectorData.slice(0, 8).map((_, i) => (
                              <Cell
                                key={i}
                                fill={COLORS[i % COLORS.length]}
                                strokeWidth={0}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: isDark ? "#1E1E1E" : "#FFF",
                              borderColor: isDark ? "#333" : "#E2E8F0",
                              borderRadius: 10,
                              fontSize: 13,
                            }}
                            formatter={(v) => [
                              formatShortCurrency(Number(v)),
                              "Exposure",
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-3">
                      {sectorData.slice(0, 4).map((s, i) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between py-1.5 border-b border-dashed border-[#EBEBEA] dark:border-white/[0.05] last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: COLORS[i % COLORS.length],
                              }}
                            />
                            <span className="text-xs text-[#555] dark:text-white/50 truncate max-w-[120px]">
                              {s.name}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#333] dark:text-white/70 ml-2">
                            {formatShortCurrency(s.exposure)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Region Bar */}
                  <div
                    className={`rounded-2xl border border-[#E0E0DE] dark:border-white/[0.07] p-5 ${isDark ? "bg-[#111111]" : "bg-white"}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-bold text-[#1A1A1A] dark:text-white/90">
                          Regional Distribution
                        </p>
                        <p className="text-xs text-[#AAA] dark:text-white/30 mt-0.5">
                          Geographic concentration
                        </p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-[#F2F4F7] dark:bg-white/[0.05] flex items-center justify-center">
                        <MapPin
                          size={16}
                          className="text-[#888] dark:text-white/40"
                        />
                      </div>
                    </div>
                    <div className="h-[290px]">
                      <ResponsiveContainer>
                        <BarChart
                          data={regionData.slice(0, 8)}
                          layout="vertical"
                          margin={{ left: 8, bottom: 18, right: 16 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke={
                              isDark ? "rgba(255,255,255,0.05)" : "#F0F0EE"
                            }
                          />
                          <XAxis
                            type="number"
                            tick={{
                              fontSize: 11,
                              fill: isDark ? "#666" : "#999",
                            }}
                          >
                            <Label
                              value="Exposure"
                              offset={-8}
                              position="insideBottom"
                              fill={isDark ? "#666" : "#999"}
                              style={{ fontSize: 12 }}
                            />
                          </XAxis>
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={85}
                            tick={{
                              fontSize: 11,
                              fill: isDark ? "#666" : "#999",
                            }}
                            tickFormatter={(v) =>
                              v.length > 11 ? v.substring(0, 11) + "…" : v
                            }
                          />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: isDark ? "#1E1E1E" : "#FFF",
                              borderColor: isDark ? "#333" : "#E2E8F0",
                              borderRadius: 10,
                              fontSize: 13,
                            }}
                            formatter={(v) => [
                              formatShortCurrency(Number(v)),
                              "Exposure",
                            ]}
                          />
                          <Bar
                            dataKey="exposure"
                            fill="#86BC25"
                            radius={[0, 5, 5, 0]}
                            barSize={18}
                            onClick={(d) => d.name && handleRegionClick(d.name)}
                          >
                            {regionData.slice(0, 8).map((_, i) => (
                              <Cell
                                key={i}
                                fill={i === 0 ? "#1A3C21" : "#86BC25"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Trend Line */}
                  <div
                    className={`rounded-2xl border border-[#E0E0DE] dark:border-white/[0.07] p-5 ${isDark ? "bg-[#111111]" : "bg-white"}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-bold text-[#1A1A1A] dark:text-white/90">
                          Portfolio Trends
                        </p>
                        <p className="text-xs text-[#AAA] dark:text-white/30 mt-0.5">
                          Exposure over time
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {["3M", "6M", "1Y"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setTimeRange(t)}
                            className={`h-7 px-2.5 rounded-lg text-xs font-bold border transition-all ${timeRange === t ? "bg-[#86BC25] border-[#86BC25] text-white" : "border-[#E0E0DE] dark:border-white/[0.10] text-[#666] dark:text-white/30 hover:border-[#86BC25]/50"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="h-[290px]">
                      <ResponsiveContainer>
                        <LineChart
                          data={timeSeriesData}
                          margin={{ left: 16, right: 8, bottom: 18 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={
                              isDark ? "rgba(255,255,255,0.05)" : "#F0F0EE"
                            }
                          />
                          <XAxis
                            dataKey="month"
                            tick={{
                              fontSize: 11,
                              fill: isDark ? "#666" : "#999",
                            }}
                            axisLine={false}
                            tickLine={false}
                            dy={8}
                          >
                            <Label
                              value="Period"
                              offset={-10}
                              position="insideBottom"
                              fill={isDark ? "#666" : "#999"}
                              style={{ fontSize: 12 }}
                            />
                          </XAxis>
                          <YAxis
                            tick={{
                              fontSize: 11,
                              fill: isDark ? "#666" : "#999",
                            }}
                            tickFormatter={(v) => formatShortCurrency(v)}
                          >
                            <Label
                              value="Exposure"
                              angle={-90}
                              position="insideLeft"
                              fill={isDark ? "#666" : "#999"}
                              style={{ textAnchor: "middle", fontSize: 12 }}
                            />
                          </YAxis>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: isDark ? "#1E1E1E" : "#FFF",
                              borderColor: isDark ? "#333" : "#E2E8F0",
                              borderRadius: 10,
                              fontSize: 13,
                            }}
                            formatter={(v) => [
                              formatShortCurrency(Number(v)),
                              "Exposure",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="exposure"
                            stroke="#86BC25"
                            strokeWidth={2.5}
                            dot={{
                              r: 3.5,
                              fill: "#86BC25",
                              strokeWidth: 2,
                              stroke: "#fff",
                            }}
                            activeDot={{ r: 5.5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* ── Top Exposures ── */}
                <div
                  className={`rounded-2xl border border-[#E0E0DE] dark:border-white/[0.07] p-5 ${isDark ? "bg-[#111111]" : "bg-white"}`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-base font-bold text-[#1A1A1A] dark:text-white/90">
                        Top {industryConfig.craLabels.exposureLabel}s
                      </p>
                      <p className="text-xs text-[#AAA] dark:text-white/30 mt-0.5">
                        Highest{" "}
                        {industryConfig.id === "telecommunications"
                          ? "valued infrastructure assets"
                          : "active credit exposures"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {topExposures.map((exp, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-default ${isDark ? "bg-[#161616] border-white/[0.07]" : "bg-[#F8FAFC] border-[#E5E5E3]"}`}
                        style={{
                          borderLeft: `3px solid ${COLORS[i % COLORS.length]}`,
                        }}
                      >
                        <p className="text-xs text-[#AAA] dark:text-white/30 truncate">
                          {exp.sector}
                        </p>
                        <p className="text-sm font-semibold text-[#1A1A1A] dark:text-white/80 mt-1.5 leading-snug line-clamp-2 min-h-[2.5em]">
                          {exp.name}
                        </p>
                        <p
                          className="text-lg font-bold mt-2.5"
                          style={{ color: COLORS[i % COLORS.length] }}
                        >
                          {formatShortCurrency(exp.exposure)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Asset Table ── */}
                <div
                  className={`rounded-2xl border border-[#E0E0DE] dark:border-white/[0.07] overflow-hidden relative ${isDark ? "bg-[#111111]" : "bg-white"}`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#86BC25] via-[#6B9B1E] to-[#86BC25]" />

                  {/* Toolbar */}
                  <div
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-3 px-5 py-4 border-b border-[#EBEBEA] dark:border-white/[0.06] mt-[3px] ${isDark ? "bg-[#151515]" : "bg-[#FAFAFA]"}`}
                  >
                    <div>
                      <p className="text-base font-bold text-[#1A1A1A] dark:text-white/90">
                        Detailed Asset Data
                      </p>
                      <p className="text-xs text-[#AAA] dark:text-white/30 mt-0.5">
                        Showing {filteredTableData.length} of {tableData.length}{" "}
                        assets
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={groupingMode}
                        onChange={(e) =>
                          setGroupingMode(
                            e.target.value as
                              | "none"
                              | "location"
                              | "borrower"
                              | "sector",
                          )
                        }
                        className={`${inputCls} w-auto min-w-[150px]`}
                      >
                        <option value="none">No Grouping</option>
                        <option value="location">Group by Region</option>
                        <option value="sector">Group by Sector</option>
                        <option value="borrower">
                          {industryConfig.id === "telecommunications"
                            ? "Group by Asset Type"
                            : "Group by Borrower"}
                        </option>
                      </select>
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAA] pointer-events-none"
                        />
                        <input
                          className={`${inputCls} pl-9 w-[200px]`}
                          placeholder="Search assets…"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold border border-[#E0E0DE] dark:border-white/[0.10] text-[#555] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25] transition-all bg-white dark:bg-white/[0.03]"
                      >
                        <Save size={14} /> Save
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold border border-[#E0E0DE] dark:border-white/[0.10] text-[#555] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25] transition-all bg-white dark:bg-white/[0.03]"
                      >
                        <Printer size={14} /> PDF
                      </button>
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-bold bg-[#1A3C21] dark:bg-[#86BC25]/20 text-white dark:text-[#86BC25] hover:bg-[#86BC25] hover:text-white transition-all"
                      >
                        <Download size={14} /> Export
                      </button>
                    </div>
                  </div>

                  {/* Grouped Table */}
                  {groupingMode !== "none" && groupedTableData && (
                    <div className="overflow-auto max-h-[400px]">
                      <table className="w-full border-collapse">
                        <thead className="sticky top-0 z-10">
                          <tr>
                            <th className={thCls}>Group</th>
                            <th className={`${thCls} text-right`}>
                              Asset Count
                            </th>
                            <th className={`${thCls} text-right`}>
                              Total Exposure
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedTableData.map((row) => (
                            <tr
                              key={row.group}
                              className="hover:bg-[#FAFAF9] dark:hover:bg-white/[0.02] transition-colors"
                            >
                              <td
                                className={`${tdCls} font-semibold text-[#1A1A1A] dark:text-white/80`}
                              >
                                {row.group}
                              </td>
                              <td
                                className={`${tdCls} text-right text-[#555] dark:text-white/50`}
                              >
                                {row.count.toLocaleString()}
                              </td>
                              <td
                                className={`${tdCls} text-right font-bold text-[#86BC25]`}
                              >
                                {formatCurrency(row.exposure)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Flat Table */}
                  {groupingMode === "none" && (
                    <div className="overflow-auto max-h-[580px]">
                      <table className="w-full border-collapse min-w-[700px]">
                        <thead className="sticky top-0 z-10">
                          <tr>
                            <th className={thCls}>Asset Name</th>
                            <th className={thCls}>Sector</th>
                            <th className={thCls}>Region</th>
                            <th className={`${thCls} text-right`}>Exposure</th>
                            <th className={`${thCls} text-center`}>Status</th>
                            <th className={`${thCls} text-center`}>View</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTableData
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage,
                            )
                            .map((row) => {
                              const sectorIdx = availableSectors.indexOf(
                                row.sector,
                              );
                              const sectorColor =
                                COLORS[
                                  (sectorIdx >= 0 ? sectorIdx : 0) %
                                    COLORS.length
                                ];
                              const isActive =
                                (row.status || "Active") === "Active";
                              return (
                                <tr
                                  key={row.id}
                                  className="hover:bg-[#F8FAF5] dark:hover:bg-white/[0.015] transition-colors"
                                >
                                  <td
                                    className={`${tdCls} font-semibold text-[#1A1A1A] dark:text-white/80 max-w-[220px] truncate`}
                                  >
                                    {row.name}
                                  </td>
                                  <td className={tdCls}>
                                    <span
                                      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border"
                                      style={{
                                        backgroundColor: `${sectorColor}18`,
                                        color: sectorColor,
                                        borderColor: `${sectorColor}33`,
                                      }}
                                    >
                                      {row.sector}
                                    </span>
                                  </td>
                                  <td
                                    className={`${tdCls} text-[#555] dark:text-white/50`}
                                  >
                                    {row.region}
                                  </td>
                                  <td
                                    className={`${tdCls} text-right font-bold text-[#86BC25]`}
                                  >
                                    {formatShortCurrency(row.exposure)}
                                  </td>
                                  <td className={`${tdCls} text-center`}>
                                    <span
                                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${isActive ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20" : "bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20"}`}
                                    >
                                      {row.status || "Active"}
                                    </span>
                                  </td>
                                  <td className={`${tdCls} text-center`}>
                                    <button
                                      onClick={() =>
                                        handleDrilldown({
                                          type: "asset",
                                          value: row,
                                        })
                                      }
                                      className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto text-[#BBB] dark:text-white/25 hover:text-[#86BC25] hover:bg-[#86BC25]/10 transition-all"
                                      title="View Details"
                                    >
                                      <Eye size={15} />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          {filteredTableData.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                  <FileSpreadsheet
                                    size={32}
                                    className="text-[#D0D0CE] dark:text-white/20"
                                  />
                                  <p className="text-sm text-[#AAA] dark:text-white/30">
                                    No assets match your search criteria.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {groupingMode === "none" && filteredTableData.length > 0 && (
                    <div
                      className={`flex items-center justify-between px-5 py-3.5 border-t border-[#EBEBEA] dark:border-white/[0.06] ${isDark ? "bg-[#151515]" : "bg-[#FAFAFA]"}`}
                    >
                      <span className="text-xs text-[#AAA] dark:text-white/30">
                        {page * rowsPerPage + 1}–
                        {Math.min(
                          (page + 1) * rowsPerPage,
                          filteredTableData.length,
                        )}{" "}
                        of {filteredTableData.length} assets
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={rowsPerPage}
                          onChange={(e) => {
                            setRowsPerPage(+e.target.value);
                            setPage(0);
                          }}
                          className="h-8 px-2 rounded-lg border border-[#E0E0DE] dark:border-white/[0.10] bg-white dark:bg-white/[0.04] text-xs text-[#555] dark:text-white/50 outline-none mr-1"
                        >
                          {[10, 25, 50, 100].map((n) => (
                            <option key={n} value={n}>
                              {n} / page
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          disabled={page === 0}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E0E0DE] dark:border-white/[0.10] text-[#666] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pg =
                              Math.max(0, Math.min(page - 2, totalPages - 5)) +
                              i;
                            return (
                              <button
                                key={pg}
                                onClick={() => setPage(pg)}
                                className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-all ${pg === page ? "bg-[#86BC25] border-[#86BC25] text-white" : "border-[#E0E0DE] dark:border-white/[0.10] text-[#666] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25]"}`}
                              >
                                {pg + 1}
                              </button>
                            );
                          },
                        )}
                        <button
                          onClick={() =>
                            setPage((p) => Math.min(totalPages - 1, p + 1))
                          }
                          disabled={page >= totalPages - 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E0E0DE] dark:border-white/[0.10] text-[#666] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sticky nav */}
          <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-[#0C0C0C]/95 backdrop-blur-xl border-t border-[#EAEAE8] dark:border-white/[0.06] px-6 md:px-10 py-3">
            <CRANavigation
              compact
              prevPath="/cra/data"
              prevLabel="Back: Data Upload"
              nextPath="/cra/physical-risk"
              nextLabel="Next: Physical Risk"
            />
          </div>
        </div>
        {/* end flex-1 min-h-0 overflow-y-auto */}

        {/* ── Asset Drilldown Modal ── */}
        {showDrilldown && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowDrilldown(false)}
            />
            <div
              className={`relative z-10 w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden ${isDark ? "bg-[#141414] border-white/[0.08]" : "bg-white border-[#E0E0DE]"}`}
            >
              <div
                className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/[0.06] bg-[#1A1A1A]" : "border-[#F0F0EE] bg-[#FAFAFA]"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#86BC25]/10 flex items-center justify-center">
                    <Eye size={16} className="text-[#86BC25]" />
                  </div>
                  <p className="text-base font-bold text-[#1A1A1A] dark:text-white/90">
                    {selectedSegment?.type === "asset" &&
                      `Asset: ${(selectedSegment.value as AssetDetail)?.name || "Details"}`}
                    {selectedSegment?.type === "sector" &&
                      `Sector: ${String(selectedSegment.value)}`}
                    {selectedSegment?.type === "region" &&
                      `Region: ${String(selectedSegment.value)}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowDrilldown(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#999] dark:text-white/40 hover:bg-[#F2F4F7] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                {selectedSegment?.type === "asset" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#888] dark:text-white/30 mb-4">
                        Asset Information
                      </p>
                      <div className="space-y-3">
                        {[
                          {
                            label: "Asset ID",
                            value:
                              (selectedSegment.value as AssetDetail)?.id ||
                              "N/A",
                          },
                          {
                            label: "Exposure",
                            value: formatCurrency(
                              (selectedSegment.value as AssetDetail)
                                ?.exposure || 0,
                            ),
                            green: true,
                          },
                          {
                            label: "Location",
                            value:
                              (selectedSegment.value as AssetDetail)?.region ||
                              "N/A",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex justify-between items-center pb-3 border-b border-dashed border-[#EBEBEA] dark:border-white/[0.06]"
                          >
                            <span className="text-sm text-[#888] dark:text-white/40">
                              {item.label}
                            </span>
                            <span
                              className={`text-sm font-semibold ${item.green ? "text-[#86BC25]" : "text-[#1A1A1A] dark:text-white/80"}`}
                            >
                              {item.value}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#888] dark:text-white/40">
                            Sector
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#86BC25]/10 text-[#4D7A0D] dark:text-[#A0D040] border border-[#86BC25]/25">
                            {(selectedSegment.value as AssetDetail)?.sector ||
                              "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#888] dark:text-white/30 mb-4">
                        Status
                      </p>
                      <div
                        className={`p-4 rounded-xl ${isDark ? "bg-white/[0.04]" : "bg-[#F2F4F7]"} flex justify-between items-center`}
                      >
                        <span className="text-sm text-[#888] dark:text-white/40">
                          Current Status
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20">
                          {(selectedSegment.value as AssetDetail)?.status ||
                            "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#777] dark:text-white/40">
                    {selectedSegment?.type}:{" "}
                    <strong>
                      {typeof selectedSegment?.value === "string"
                        ? selectedSegment.value
                        : "–"}
                    </strong>
                  </p>
                )}
              </div>
              <div
                className={`flex items-center justify-end gap-2 px-6 py-4 border-t ${isDark ? "border-white/[0.06] bg-[#1A1A1A]" : "border-[#F0F0EE] bg-[#FAFAFA]"}`}
              >
                <button
                  onClick={() => setShowDrilldown(false)}
                  className="h-10 px-5 rounded-xl text-sm font-semibold border border-[#E0E0DE] dark:border-white/[0.10] text-[#555] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25] transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleExport();
                    setShowDrilldown(false);
                  }}
                  className="h-10 px-5 rounded-xl text-sm font-bold bg-[#86BC25] text-white hover:bg-[#78AB1F] transition-all"
                >
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Save Segment Modal ── */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setShowSaveDialog(false)}
            />
            <div
              className={`relative z-10 w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${isDark ? "bg-[#141414] border-white/[0.08]" : "bg-white border-[#E0E0DE]"}`}
            >
              <div
                className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/[0.06] bg-[#1A1A1A]" : "border-[#F0F0EE] bg-[#FAFAFA]"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#86BC25]/10 flex items-center justify-center">
                    <Save size={15} className="text-[#86BC25]" />
                  </div>
                  <p className="text-base font-bold text-[#1A1A1A] dark:text-white/90">
                    Save Segment
                  </p>
                </div>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#999] dark:text-white/40 hover:bg-[#F2F4F7] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-sm text-blue-700 dark:text-blue-400">
                  <Database size={15} className="shrink-0 mt-0.5" />
                  <span>
                    Saving <strong>{filteredAssets.length} assets</strong> ·
                    total {industryConfig.craLabels.exposureLabel.toLowerCase()}
                    :{" "}
                    <strong>
                      {formatCurrency(
                        filteredAssets.reduce(
                          (s, a) => s + getAssetExposure(a),
                          0,
                        ),
                      )}
                    </strong>
                  </span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#888] dark:text-white/40">
                    Segment Name *
                  </label>
                  <input
                    className={inputCls}
                    placeholder="e.g., Manufacturing – South West"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#888] dark:text-white/40">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    className={`${inputCls} py-2.5 h-auto resize-none`}
                    placeholder="Brief description of this segment…"
                    value={segmentDescription}
                    onChange={(e) => setSegmentDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#888] dark:text-white/30">
                    Active Filters
                  </p>
                  <div
                    className={`p-3.5 rounded-xl ${isDark ? "bg-white/[0.03]" : "bg-[#F2F4F7]"} flex flex-wrap gap-2 min-h-[44px] items-center`}
                  >
                    {filters.sector.length > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#86BC25]/10 border border-[#86BC25]/25 text-[#4D7A0D] dark:text-[#A0D040]">
                        Sector: {filters.sector.join(", ")}
                      </span>
                    )}
                    {filters.region.length > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        Region: {filters.region.join(", ")}
                      </span>
                    )}
                    {portfolioFilter !== "All" && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400">
                        Portfolio: {portfolioFilter}
                      </span>
                    )}
                    {filters.sector.length === 0 &&
                      filters.region.length === 0 &&
                      portfolioFilter === "All" && (
                        <span className="text-sm text-[#AAA] dark:text-white/25">
                          No filters applied — saving full portfolio
                        </span>
                      )}
                  </div>
                </div>
              </div>
              <div
                className={`flex items-center justify-end gap-2 px-6 py-4 border-t ${isDark ? "border-white/[0.06] bg-[#1A1A1A]" : "border-[#F0F0EE] bg-[#FAFAFA]"}`}
              >
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="h-10 px-5 rounded-xl text-sm font-semibold border border-[#E0E0DE] dark:border-white/[0.10] text-[#555] dark:text-white/40 hover:border-[#86BC25]/60 hover:text-[#86BC25] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSegment}
                  disabled={!segmentName.trim()}
                  className="h-10 px-5 rounded-xl text-sm font-bold bg-[#86BC25] text-white hover:bg-[#78AB1F] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Save Segment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* end flex-1 flex flex-col */}
    </CRALayout>
  );
}
