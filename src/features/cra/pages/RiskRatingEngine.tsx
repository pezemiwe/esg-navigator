import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  alpha,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  TablePagination,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useCRADataStore } from "@/store/craStore";
import { useIndustry } from "@/hooks/useIndustry";
import { ShieldCheck, Info } from "lucide-react";
import type { Asset } from "@/types/craTypes";
import { formatExposureM } from "../utils/craUtils";
import CRANavigation from "../components/CRANavigation";
import CRALayout from "../layout/CRALayout";

/* ─── Risk Rating Thresholds ─── */

interface RiskRating {
  score: number; // 1-5
  label: string;
  color: string;
  bg: string;
  description: string;
}

const RISK_LEVELS: RiskRating[] = [
  {
    score: 1,
    label: "Low",
    color: "#22C55E",
    bg: "#DCFCE7",
    description: "Minimal climate risk exposure",
  },
  {
    score: 2,
    label: "Low-Medium",
    color: "#84CC16",
    bg: "#ECFCCB",
    description: "Below-average climate vulnerability",
  },
  {
    score: 3,
    label: "Medium",
    color: "#EAB308",
    bg: "#FEF9C3",
    description: "Moderate climate exposure",
  },
  {
    score: 4,
    label: "High",
    color: "#F97316",
    bg: "#FFEDD5",
    description: "Significant climate risk",
  },
  {
    score: 5,
    label: "Critical",
    color: "#EF4444",
    bg: "#FEE2E2",
    description: "Severe climate vulnerability",
  },
];

function getRatingByScore(score: number): RiskRating {
  if (score >= 4.5) return RISK_LEVELS[4];
  if (score >= 3.5) return RISK_LEVELS[3];
  if (score >= 2.5) return RISK_LEVELS[2];
  if (score >= 1.5) return RISK_LEVELS[1];
  return RISK_LEVELS[0];
}

/* ─── Sector Climate Risk Scores (banking + telecom) ─── */
const SECTOR_RISK_SCORES: Record<
  string,
  { transition: number; physical: number }
> = {
  // Banking sectors
  "Oil & Gas": { transition: 5.0, physical: 3.5 },
  "Coal Mining": { transition: 5.0, physical: 3.0 },
  Agriculture: { transition: 2.5, physical: 4.5 },
  "Real Estate": { transition: 2.0, physical: 4.0 },
  Manufacturing: { transition: 3.5, physical: 3.0 },
  "Financial Services": { transition: 2.0, physical: 2.0 },
  Technology: { transition: 1.5, physical: 2.0 },
  Healthcare: { transition: 1.5, physical: 2.5 },
  "Mining & Metals": { transition: 4.0, physical: 3.5 },
  "Construction & Infrastructure": { transition: 3.0, physical: 3.5 },
  Transportation: { transition: 4.0, physical: 3.0 },
  Retail: { transition: 2.0, physical: 2.5 },
  Utilities: { transition: 4.0, physical: 3.5 },
  "Hospitality & Tourism": { transition: 2.0, physical: 3.5 },
  "Fast-Moving Consumer Goods": { transition: 2.5, physical: 2.5 },
  Education: { transition: 1.0, physical: 2.0 },
  // Telecom-specific
  Telecommunications: { transition: 2.5, physical: 3.5 },
  "Tower Infrastructure": { transition: 2.0, physical: 4.5 },
  "Fiber Network": { transition: 1.5, physical: 3.0 },
  "Data Center": { transition: 3.0, physical: 3.0 },
  "Power Systems": { transition: 3.5, physical: 4.0 },
  "Radio Equipment": { transition: 2.0, physical: 3.5 },
  "Transmission Equipment": { transition: 2.0, physical: 3.0 },
  "Customer Equipment": { transition: 1.5, physical: 2.0 },
  "Mobile Network": { transition: 2.0, physical: 3.5 },
  "Fixed Line": { transition: 1.5, physical: 3.0 },
};

const REGION_PHYSICAL_MULTIPLIER: Record<string, number> = {
  "North Central": 1.1,
  "North East": 1.3,
  "North West": 1.2,
  "South East": 1.0,
  "South South": 1.4,
  "South West": 0.9,
  Lagos: 1.3,
  Coastal: 1.5,
  Inland: 1.0,
  Urban: 0.9,
  Rural: 1.2,
};

/* ─── Rating Engine ─── */

interface AssetRating {
  id: string;
  name: string;
  sector: string;
  region: string;
  exposure: number;
  sourceType: string;
  transitionScore: number;
  physicalScore: number;
  compositeScore: number;
  rating: RiskRating;
  factors: string[];
}

function rateAsset(
  asset: Asset & { _sourceType?: string },
  isNonFinancial: boolean,
): AssetRating {
  const sector =
    (asset.sector as string) ||
    ((asset as Record<string, unknown>)["Asset Category"] as string) ||
    "Unknown";
  const region = (asset.region as string) || "Unknown";
  const exposure =
    Number(asset.outstandingBalance) ||
    Number((asset as Record<string, unknown>)["Net Book Value"]) ||
    Number((asset as Record<string, unknown>)["Book Value"]) ||
    Number((asset as Record<string, unknown>).bookValue) ||
    0;
  const name =
    (asset.borrowerName as string) ||
    ((asset as Record<string, unknown>)["Tower ID"] as string) ||
    ((asset as Record<string, unknown>)["Segment ID"] as string) ||
    ((asset as Record<string, unknown>)["Site Name"] as string) ||
    asset.id;

  const sectorKey =
    Object.keys(SECTOR_RISK_SCORES).find(
      (k) => k.toLowerCase() === sector.toLowerCase(),
    ) || "";
  const sectorScores = SECTOR_RISK_SCORES[sectorKey] || {
    transition: 2.5,
    physical: 2.5,
  };

  const regionKey =
    Object.keys(REGION_PHYSICAL_MULTIPLIER).find(
      (k) => k.toLowerCase() === region.toLowerCase(),
    ) || "";
  const regionMult = REGION_PHYSICAL_MULTIPLIER[regionKey] || 1.0;

  let transitionScore = sectorScores.transition;
  let physicalScore = sectorScores.physical * regionMult;

  // Exposure-based adjustment (larger exposures carry slightly more weight)
  if (exposure > 10_000_000_000) {
    transitionScore += 0.3;
    physicalScore += 0.2;
  } else if (exposure > 5_000_000_000) {
    transitionScore += 0.15;
    physicalScore += 0.1;
  }

  // Status-based adjustment
  const status = ((asset.status as string) || "").toLowerCase();
  if (status.includes("watchlist") || status.includes("substandard")) {
    transitionScore += 0.5;
    physicalScore += 0.3;
  } else if (status.includes("non-performing") || status.includes("npl")) {
    transitionScore += 0.8;
    physicalScore += 0.5;
  }

  // Maturity-based adjustment (longer maturity = more exposed to climate)
  const maturity = asset.maturityDate
    ? new Date(asset.maturityDate as string)
    : null;
  if (maturity) {
    const yearsToMaturity =
      (maturity.getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000);
    if (yearsToMaturity > 10) {
      transitionScore += 0.3;
      physicalScore += 0.4;
    } else if (yearsToMaturity > 5) {
      transitionScore += 0.15;
      physicalScore += 0.2;
    }
  }

  // Cap at 5
  transitionScore = Math.min(transitionScore, 5);
  physicalScore = Math.min(physicalScore, 5);

  // Composite: 40% transition + 60% physical for telecom, 50/50 for banking
  const compositeScore = isNonFinancial
    ? transitionScore * 0.4 + physicalScore * 0.6
    : transitionScore * 0.5 + physicalScore * 0.5;

  const rating = getRatingByScore(compositeScore);

  // Generate human-readable factors
  const factors: string[] = [];
  if (sectorScores.transition >= 4)
    factors.push(`High-carbon sector (${sector})`);
  if (regionMult >= 1.3) factors.push(`Climate-vulnerable region (${region})`);
  if (exposure > 10_000_000_000) factors.push("Large exposure concentration");
  if (status.includes("npl") || status.includes("non-performing"))
    factors.push("Non-performing status");
  if (maturity) {
    const yrs =
      (maturity.getTime() - Date.now()) / (365.25 * 24 * 60 * 60 * 1000);
    if (yrs > 10) factors.push("Long-dated maturity (>10 years)");
  }
  if (factors.length === 0) factors.push("Standard climate exposure");

  return {
    id: asset.id,
    name,
    sector,
    region,
    exposure,
    sourceType:
      ((asset as Record<string, unknown>)._sourceType as string) ?? "unknown",
    transitionScore: Math.round(transitionScore * 10) / 10,
    physicalScore: Math.round(physicalScore * 10) / 10,
    compositeScore: Math.round(compositeScore * 10) / 10,
    rating,
    factors,
  };
}

/* ─── Component ─── */

export default function RiskRatingEngine() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { assets } = useCRADataStore();
  const { isNonFinancial } = useIndustry();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterLevel, setFilterLevel] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"compositeScore" | "exposure">(
    "compositeScore",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  /* ─── Rate all assets ─── */
  const allRatings = useMemo(() => {
    const flat = Object.values(assets).flatMap((assetType) =>
      (assetType.data || []).map((a) => ({
        ...a,
        _sourceType: assetType.type,
      })),
    );
    return flat.map((a) => rateAsset(a, isNonFinancial));
  }, [assets, isNonFinancial]);

  /* ─── Filtered + Sorted ─── */
  const filteredRatings = useMemo(() => {
    let list = allRatings;
    if (filterLevel !== "All") {
      list = list.filter((r) => r.rating.label === filterLevel);
    }
    list.sort((a, b) =>
      sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy],
    );
    return list;
  }, [allRatings, filterLevel, sortBy, sortDir]);

  /* ─── Aggregates ─── */
  const summary = useMemo(() => {
    const byLevel: Record<string, { count: number; exposure: number }> = {};
    RISK_LEVELS.forEach((l) => {
      byLevel[l.label] = { count: 0, exposure: 0 };
    });
    allRatings.forEach((r) => {
      byLevel[r.rating.label].count++;
      byLevel[r.rating.label].exposure += r.exposure;
    });

    const totalExposure = allRatings.reduce((s, r) => s + r.exposure, 0);
    const avgComposite =
      allRatings.length > 0
        ? allRatings.reduce((s, r) => s + r.compositeScore, 0) /
          allRatings.length
        : 0;

    const bySector: Record<
      string,
      { count: number; avgScore: number; exposure: number }
    > = {};
    allRatings.forEach((r) => {
      if (!bySector[r.sector])
        bySector[r.sector] = { count: 0, avgScore: 0, exposure: 0 };
      bySector[r.sector].count++;
      bySector[r.sector].avgScore += r.compositeScore;
      bySector[r.sector].exposure += r.exposure;
    });
    Object.values(bySector).forEach((s) => {
      s.avgScore = s.count > 0 ? s.avgScore / s.count : 0;
    });

    return {
      byLevel,
      totalExposure,
      avgComposite,
      bySector,
      totalAssets: allRatings.length,
    };
  }, [allRatings]);

  const overallRating = getRatingByScore(summary.avgComposite);

  const PIE_DATA = RISK_LEVELS.map((l) => ({
    name: l.label,
    value: summary.byLevel[l.label].count,
    color: l.color,
  })).filter((d) => d.value > 0);

  const SECTOR_DATA = Object.entries(summary.bySector)
    .map(([sector, data]) => ({
      sector: sector.length > 18 ? sector.substring(0, 18) + "…" : sector,
      avgScore: Math.round(data.avgScore * 10) / 10,
      count: data.count,
      fill: getRatingByScore(data.avgScore).color,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 12);

  if (allRatings.length === 0) {
    return (
      <CRALayout>
        <CRANavigation />
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Paper sx={{ p: 6, maxWidth: 600, mx: "auto" }}>
            <ShieldCheck
              size={48}
              style={{ color: DELOITTE_COLORS.slate.DEFAULT, marginBottom: 16 }}
            />
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Automated Risk Rating Engine
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Upload portfolio data first to auto-generate climate risk ratings
              for every asset. The engine scores each asset based on sector,
              region, exposure size, maturity, and status.
            </Typography>
            <Alert severity="info" sx={{ textAlign: "left" }}>
              Go to <strong>Data Upload</strong> and load at least one asset
              type to enable the rating engine.
            </Alert>
          </Paper>
        </Box>
      </CRALayout>
    );
  }

  return (
    <CRALayout>
      <CRANavigation />
      <Box sx={{ px: 2, pb: 8 }}>
        {/* ─── Header ─── */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mb: 0.5 }}
        >
          <ShieldCheck size={22} />
          <Typography variant="h5" fontWeight={700}>
            Automated Risk Rating Engine
          </Typography>
          <Chip
            label="AI-Powered"
            size="small"
            color="success"
            variant="outlined"
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Every asset is automatically scored across transition risk and
          physical risk dimensions. Composite CRA Score drives rating from Low
          to Critical.
          {isNonFinancial
            ? " Telecom weighting: 40% transition + 60% physical."
            : " Banking weighting: 50% transition + 50% physical."}
        </Typography>

        {/* ─── Portfolio-Level Summary ─── */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                borderLeft: `4px solid ${overallRating.color}`,
                bgcolor: isDark
                  ? alpha(overallRating.color, 0.08)
                  : overallRating.bg,
                height: "100%",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                PORTFOLIO CRA SCORE
              </Typography>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{ color: overallRating.color, my: 1 }}
              >
                {summary.avgComposite.toFixed(1)}
              </Typography>
              <Chip
                label={overallRating.label}
                size="small"
                sx={{
                  bgcolor: overallRating.color,
                  color: "#fff",
                  fontWeight: 700,
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {overallRating.description}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                TOTAL ASSETS RATED
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ my: 1 }}>
                {summary.totalAssets.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across {Object.keys(summary.bySector).length} sectors
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                TOTAL EXPOSURE
              </Typography>
              <Typography variant="h3" fontWeight={800} sx={{ my: 1 }}>
                {formatExposureM(summary.totalExposure)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isNonFinancial ? "Net book value" : "Outstanding balance"}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                HIGH / CRITICAL ASSETS
              </Typography>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{ color: "#EF4444", my: 1 }}
              >
                {(summary.byLevel["High"]?.count ?? 0) +
                  (summary.byLevel["Critical"]?.count ?? 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requiring immediate attention
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ─── Risk Distribution Charts ─── */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 3, height: "100%" }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Rating Distribution
              </Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={{
                        stroke: theme.palette.text.secondary,
                        strokeWidth: 1,
                      }}
                    >
                      {PIE_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(
                        v: number | undefined,
                        name: string | number | undefined,
                      ) => [
                        v !== undefined
                          ? `${v} assets (${((v / summary.totalAssets) * 100).toFixed(1)}%)`
                          : "N/A",
                        String(name || ""),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 3, height: "100%" }}
            >
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Sector Risk Heatmap
              </Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={SECTOR_DATA}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke={alpha(theme.palette.text.secondary, 0.1)}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 5]}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="sector"
                      fontSize={11}
                      width={140}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      formatter={(v: number | undefined) => [
                        v !== undefined ? `${v.toFixed(1)} / 5.0` : "N/A",
                        "CRA Score",
                      ]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                      }}
                    />
                    <Bar dataKey="avgScore" barSize={16} radius={[0, 6, 6, 0]}>
                      {SECTOR_DATA.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* ─── Exposure-at-Risk by Rating ─── */}
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Exposure Concentration by Risk Level
          </Typography>
          <Grid container spacing={1}>
            {RISK_LEVELS.map((level) => {
              const data = summary.byLevel[level.label];
              const pct =
                summary.totalExposure > 0
                  ? (data.exposure / summary.totalExposure) * 100
                  : 0;
              return (
                <Grid size={{ xs: 12 }} key={level.label}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip
                      label={level.label}
                      size="small"
                      sx={{
                        bgcolor: level.color,
                        color: "#fff",
                        fontWeight: 700,
                        width: 100,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          height: 20,
                          borderRadius: 4,
                          bgcolor: alpha(level.color, 0.1),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: level.color,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ width: 100, textAlign: "right" }}
                    >
                      {formatExposureM(data.exposure)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ width: 60, textAlign: "right" }}
                    >
                      {pct.toFixed(1)}%
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ width: 80, textAlign: "right" }}
                    >
                      {data.count} assets
                    </Typography>
                  </Stack>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* ─── Filter & Asset Table ─── */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Asset-Level Ratings
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label="All"
                size="small"
                variant={filterLevel === "All" ? "filled" : "outlined"}
                onClick={() => {
                  setFilterLevel("All");
                  setPage(0);
                }}
              />
              {RISK_LEVELS.map((l) => (
                <Chip
                  key={l.label}
                  label={`${l.label} (${summary.byLevel[l.label].count})`}
                  size="small"
                  variant={filterLevel === l.label ? "filled" : "outlined"}
                  sx={{
                    ...(filterLevel === l.label && {
                      bgcolor: l.color,
                      color: "#fff",
                    }),
                  }}
                  onClick={() => {
                    setFilterLevel(l.label);
                    setPage(0);
                  }}
                />
              ))}
            </Stack>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                    Asset
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                    Sector
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                    Region
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: 12 }}
                    align="right"
                  >
                    Exposure
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: 12, cursor: "pointer" }}
                    align="center"
                    onClick={() => {
                      if (sortBy === "compositeScore")
                        setSortDir((d) => (d === "desc" ? "asc" : "desc"));
                      else {
                        setSortBy("compositeScore");
                        setSortDir("desc");
                      }
                    }}
                  >
                    CRA Score{" "}
                    {sortBy === "compositeScore"
                      ? sortDir === "desc"
                        ? "↓"
                        : "↑"
                      : ""}
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: 12 }}
                    align="center"
                  >
                    Trans.
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, fontSize: 12 }}
                    align="center"
                  >
                    Phys.
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                    Rating
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                    Key Factors
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRatings
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell
                        sx={{
                          fontSize: 12,
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{r.sector}</TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{r.region}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 12 }}>
                        {formatExposureM(r.exposure)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={r.compositeScore.toFixed(1)}
                          size="small"
                          sx={{
                            bgcolor: r.rating.color,
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: 12 }}>
                        {r.transitionScore.toFixed(1)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: 12 }}>
                        {r.physicalScore.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.rating.label}
                          size="small"
                          sx={{
                            bgcolor: isDark
                              ? alpha(r.rating.color, 0.2)
                              : r.rating.bg,
                            color: r.rating.color,
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: 11,
                          color: "text.secondary",
                          maxWidth: 220,
                        }}
                      >
                        {r.factors.join("; ")}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredRatings.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </Paper>

        {/* ─── Methodology Note ─── */}
        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2.5,
            bgcolor: alpha(DELOITTE_COLORS.primary.lit, 0.06),
            borderRadius: 2,
            border: `1px solid ${alpha(DELOITTE_COLORS.primary.lit, 0.2)}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Info
              size={16}
              style={{
                marginTop: 2,
                flexShrink: 0,
                color: DELOITTE_COLORS.primary.lit,
              }}
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Rating Methodology
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Each asset is scored on a 1-5 scale across two dimensions:{" "}
                <strong>Transition Risk</strong> (exposure to carbon pricing,
                regulation, technology shifts) and{" "}
                <strong>Physical Risk</strong> (vulnerability to acute and
                chronic climate hazards). Scores are weighted
                {isNonFinancial
                  ? " 40:60 (transition:physical) for telecom"
                  : " 50:50 for banking"}
                , then adjusted for exposure concentration, asset status,
                maturity horizon, and regional climate vulnerability. The
                composite CRA Score maps to ratings: Low (1.0-1.4), Low-Medium
                (1.5-2.4), Medium (2.5-3.4), High (3.5-4.4), Critical (4.5-5.0).
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </CRALayout>
  );
}
