import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
  Grid,
} from "@mui/material";
import { Info } from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { formatScenarioCurrency } from "../../utils";
interface RegionData {
  name: string;
  totalEAD: number;
  loanCount: number;
  deltaECL: number;
  dominantSector: string;
  physicalRisks: string[];
  coordinates: { x: number; y: number };
}
interface NigeriaRiskMapProps {
  results?: {
    regionBreakdown: RegionData[];
  };
  className?: string;
}
const NIGERIA_REGIONS = [
  {
    name: "Lagos",
    // Accurate simplified outline — SW coastal state
    path: "M 175,318 L 192,310 L 210,308 L 224,312 L 230,322 L 226,334 L 214,340 L 200,338 L 184,332 Z",
    totalEAD: 4720000000,
    loanCount: 42,
    deltaECL: 185000000,
    dominantSector: "Financial Services",
    physicalRisks: ["Coastal Flooding", "Sea Level Rise", "Storm Surge"],
    centroid: { x: 205, y: 324 },
  },
  {
    name: "Rivers",
    path: "M 330,328 L 352,318 L 375,316 L 395,320 L 408,332 L 404,346 L 388,354 L 362,356 L 340,348 Z",
    totalEAD: 1900000000,
    loanCount: 16,
    deltaECL: 92000000,
    dominantSector: "Oil & Gas",
    physicalRisks: ["Oil Spill Risk", "Coastal Erosion", "Flooding"],
    centroid: { x: 372, y: 337 },
  },
  {
    name: "Abuja FCT",
    path: "M 294,196 L 316,190 L 336,194 L 344,210 L 340,228 L 322,234 L 302,230 L 292,214 Z",
    totalEAD: 1580000000,
    loanCount: 12,
    deltaECL: 68000000,
    dominantSector: "Real Estate",
    physicalRisks: ["Flooding", "Water Stress", "Heat Waves"],
    centroid: { x: 318, y: 212 },
  },
  {
    name: "Kano",
    path: "M 308,72 L 336,66 L 368,68 L 384,80 L 386,102 L 372,118 L 348,124 L 322,118 L 306,102 Z",
    totalEAD: 980000000,
    loanCount: 9,
    deltaECL: 42000000,
    dominantSector: "Agriculture",
    physicalRisks: ["Drought", "Desertification", "Heat Waves"],
    centroid: { x: 346, y: 96 },
  },
  {
    name: "Delta",
    path: "M 268,300 L 290,292 L 322,290 L 340,302 L 338,318 L 322,328 L 296,330 L 272,318 Z",
    totalEAD: 850000000,
    loanCount: 8,
    deltaECL: 38000000,
    dominantSector: "Oil & Gas",
    physicalRisks: ["Oil Spill Risk", "Flooding", "Erosion"],
    centroid: { x: 305, y: 311 },
  },
  {
    name: "Kaduna",
    path: "M 254,106 L 278,96 L 308,94 L 322,104 L 326,128 L 312,148 L 286,152 L 260,140 L 250,122 Z",
    totalEAD: 720000000,
    loanCount: 7,
    deltaECL: 34000000,
    dominantSector: "Manufacturing",
    physicalRisks: ["Drought", "Communal Conflict", "Water Stress"],
    centroid: { x: 288, y: 124 },
  },
  {
    name: "Oyo",
    path: "M 196,244 L 226,236 L 256,238 L 268,252 L 264,272 L 246,282 L 218,284 L 196,270 Z",
    totalEAD: 650000000,
    loanCount: 6,
    deltaECL: 28000000,
    dominantSector: "Agriculture",
    physicalRisks: ["Irregular Rainfall", "Erosion", "Heat Stress"],
    centroid: { x: 232, y: 261 },
  },
  {
    name: "Ogun",
    path: "M 180,276 L 202,268 L 228,270 L 240,282 L 238,300 L 220,308 L 196,306 L 178,294 Z",
    totalEAD: 550000000,
    loanCount: 5,
    deltaECL: 24000000,
    dominantSector: "Manufacturing",
    physicalRisks: ["Flooding", "Erosion", "Industrial Waste"],
    centroid: { x: 210, y: 289 },
  },
  {
    name: "Enugu",
    path: "M 362,228 L 388,220 L 414,224 L 428,238 L 424,258 L 406,268 L 380,266 L 360,252 Z",
    totalEAD: 380000000,
    loanCount: 3,
    deltaECL: 18000000,
    dominantSector: "Mining",
    physicalRisks: ["Erosion", "Landslides", "Water Stress"],
    centroid: { x: 394, y: 245 },
  },
  {
    name: "Borno",
    path: "M 416,44 L 456,36 L 490,44 L 502,70 L 496,100 L 472,116 L 444,112 L 418,96 L 408,68 Z",
    totalEAD: 470000000,
    loanCount: 4,
    deltaECL: 21000000,
    dominantSector: "Agriculture",
    physicalRisks: ["Severe Drought", "Desertification", "Lake Chad Recession"],
    centroid: { x: 455, y: 78 },
  },
  {
    name: "Katsina",
    path: "M 270,48 L 308,40 L 334,46 L 340,66 L 322,82 L 294,88 L 264,80 L 256,62 Z",
    totalEAD: 310000000,
    loanCount: 3,
    deltaECL: 14000000,
    dominantSector: "Agriculture",
    physicalRisks: ["Drought", "Desertification"],
    centroid: { x: 298, y: 64 },
  },
  {
    name: "Niger",
    path: "M 200,140 L 240,132 L 270,136 L 284,158 L 280,188 L 258,202 L 228,206 L 200,192 L 186,164 Z",
    totalEAD: 280000000,
    loanCount: 2,
    deltaECL: 12000000,
    dominantSector: "Agriculture",
    physicalRisks: ["Drought", "Flooding"],
    centroid: { x: 236, y: 170 },
  },
  {
    name: "Anambra",
    path: "M 326,270 L 348,264 L 366,270 L 368,288 L 352,298 L 330,295 L 318,282 Z",
    totalEAD: 240000000,
    loanCount: 2,
    deltaECL: 11000000,
    dominantSector: "Trade",
    physicalRisks: ["Erosion", "Flooding"],
    centroid: { x: 344, y: 282 },
  },
  {
    name: "Imo",
    path: "M 310,280 L 330,272 L 348,278 L 350,296 L 334,308 L 312,306 L 300,292 Z",
    totalEAD: 210000000,
    loanCount: 2,
    deltaECL: 10000000,
    dominantSector: "Trade",
    physicalRisks: ["Erosion", "Flooding"],
    centroid: { x: 326, y: 292 },
  },
];
export const NigeriaRiskMap: React.FC<NigeriaRiskMapProps> = () => {
  const theme = useTheme();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const activeRegion = selectedRegion || hoveredRegion;
  const regionData = NIGERIA_REGIONS.find((r) => r.name === activeRegion);
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          <span style={{ marginRight: 8, fontSize: "1.2rem" }}>🗺️</span>
          Nigeria Climate Risk Map
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Geographic distribution of climate-related credit risk - ΔECL by state
        </Typography>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box
            sx={{
              width: "100%",
              maxHeight: 500,
              bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05),
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            }}
          >
            <svg
              viewBox="0 0 580 390"
              style={{ width: "100%", height: "100%" }}
            >
              <defs>
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter
                  id="shadow"
                  x="-10%"
                  y="-10%"
                  width="130%"
                  height="130%"
                >
                  <feDropShadow
                    dx="1"
                    dy="2"
                    stdDeviation="2"
                    floodOpacity="0.18"
                  />
                </filter>
                {/* Risk level gradients */}
                <radialGradient id="grad-high" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.8" />
                </radialGradient>
                <radialGradient id="grad-med-high" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#c2410c" stopOpacity="0.8" />
                </radialGradient>
                <radialGradient id="grad-med" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.8" />
                </radialGradient>
                <radialGradient id="grad-low" cx="40%" cy="35%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#15803d" stopOpacity="0.75" />
                </radialGradient>
                {/* Nigeria border background */}
                <clipPath id="nigeria-clip">
                  <path d="M 160,96 L 200,78 L 246,66 L 292,58 L 346,62 L 400,72 L 448,80 L 488,96 L 504,126 L 506,158 L 500,190 L 490,220 L 478,250 L 462,276 L 444,300 L 422,322 L 396,342 L 368,358 L 336,364 L 300,362 L 262,352 L 228,336 L 196,314 L 170,290 L 152,262 L 140,232 L 136,200 L 138,168 L 144,138 Z" />
                </clipPath>
              </defs>

              {/* Map background */}
              <rect
                x="0"
                y="0"
                width="580"
                height="390"
                fill={theme.palette.mode === "dark" ? "#0f1a0f" : "#f0f7f0"}
              />

              {/* Nigeria silhouette background */}
              <path
                d="M 160,96 L 200,78 L 246,66 L 292,58 L 346,62 L 400,72 L 448,80 L 488,96 L 504,126 L 506,158 L 500,190 L 490,220 L 478,250 L 462,276 L 444,300 L 422,322 L 396,342 L 368,358 L 336,364 L 300,362 L 262,352 L 228,336 L 196,314 L 170,290 L 152,262 L 140,232 L 136,200 L 138,168 L 144,138 Z"
                fill={
                  theme.palette.mode === "dark"
                    ? "rgba(20,50,20,0.5)"
                    : "rgba(210,235,210,0.6)"
                }
                stroke={
                  theme.palette.mode === "dark"
                    ? "rgba(34,197,94,0.3)"
                    : "rgba(34,197,94,0.4)"
                }
                strokeWidth="1.5"
              />

              {/* Grid lines (subtle geographic reference) */}
              {[100, 150, 200, 250, 300, 350].map((y) => (
                <line
                  key={`gy${y}`}
                  x1="120"
                  y1={y}
                  x2="520"
                  y2={y}
                  stroke={
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.05)"
                  }
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
              ))}
              {[180, 240, 300, 360, 420, 480].map((x) => (
                <line
                  key={`gx${x}`}
                  x1={x}
                  y1="50"
                  x2={x}
                  y2="370"
                  stroke={
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.05)"
                  }
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
              ))}

              {/* State regions */}
              {NIGERIA_REGIONS.map((region) => {
                const isActive =
                  hoveredRegion === region.name ||
                  selectedRegion === region.name;
                const isDimmed = (hoveredRegion || selectedRegion) && !isActive;
                const ecl = region.deltaECL;
                let gradId: string;
                if (ecl >= 100000000) gradId = "url(#grad-high)";
                else if (ecl >= 60000000) gradId = "url(#grad-med-high)";
                else if (ecl >= 30000000) gradId = "url(#grad-med)";
                else gradId = "url(#grad-low)";
                return (
                  <g
                    key={region.name}
                    filter={isActive ? "url(#shadow)" : undefined}
                  >
                    {/* State fill */}
                    <path
                      d={region.path}
                      fill={gradId}
                      stroke={
                        isActive
                          ? theme.palette.mode === "dark"
                            ? "#86efac"
                            : "#15803d"
                          : theme.palette.mode === "dark"
                            ? "rgba(134,239,172,0.25)"
                            : "rgba(21,128,61,0.3)"
                      }
                      strokeWidth={isActive ? 2 : 1}
                      opacity={isDimmed ? 0.35 : 1}
                      style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                      onMouseEnter={() => setHoveredRegion(region.name)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() =>
                        setSelectedRegion(
                          selectedRegion === region.name ? null : region.name,
                        )
                      }
                    />
                    {/* Active glow ring */}
                    {isActive && (
                      <path
                        d={region.path}
                        fill="none"
                        stroke={
                          theme.palette.mode === "dark"
                            ? "rgba(134,239,172,0.4)"
                            : "rgba(21,128,61,0.4)"
                        }
                        strokeWidth="4"
                        filter="url(#glow)"
                        pointerEvents="none"
                      />
                    )}
                    {/* EAD bubble */}
                    <circle
                      cx={region.centroid.x}
                      cy={region.centroid.y + 14}
                      r={Math.max(3, Math.sqrt(region.totalEAD / 180000000))}
                      fill={
                        theme.palette.mode === "dark"
                          ? "rgba(134,239,172,0.22)"
                          : "rgba(21,128,61,0.18)"
                      }
                      stroke={
                        theme.palette.mode === "dark"
                          ? "rgba(134,239,172,0.5)"
                          : "rgba(21,128,61,0.5)"
                      }
                      strokeWidth="0.8"
                      pointerEvents="none"
                      opacity={isDimmed ? 0.2 : 1}
                    />
                    {/* State label */}
                    <text
                      x={region.centroid.x}
                      y={region.centroid.y}
                      textAnchor="middle"
                      pointerEvents="none"
                      fill={
                        theme.palette.mode === "dark"
                          ? isActive
                            ? "#ffffff"
                            : "rgba(220,252,231,0.85)"
                          : isActive
                            ? "#052e16"
                            : "rgba(5,46,22,0.8)"
                      }
                      style={{
                        fontSize: isActive ? 9 : 8,
                        fontWeight: isActive ? 700 : 600,
                        transition: "all 0.2s",
                      }}
                      opacity={isDimmed ? 0.3 : 1}
                    >
                      {region.name}
                    </text>
                  </g>
                );
              })}

              {/* Nigeria border overlay */}
              <path
                d="M 160,96 L 200,78 L 246,66 L 292,58 L 346,62 L 400,72 L 448,80 L 488,96 L 504,126 L 506,158 L 500,190 L 490,220 L 478,250 L 462,276 L 444,300 L 422,322 L 396,342 L 368,358 L 336,364 L 300,362 L 262,352 L 228,336 L 196,314 L 170,290 L 152,262 L 140,232 L 136,200 L 138,168 L 144,138 Z"
                fill="none"
                stroke={
                  theme.palette.mode === "dark"
                    ? "rgba(134,239,172,0.55)"
                    : "rgba(21,128,61,0.55)"
                }
                strokeWidth="2"
              />

              {/* Title */}
              <text
                x="290"
                y="22"
                textAnchor="middle"
                fill={theme.palette.text.primary}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
              >
                NIGERIA — Climate Risk Exposure by State
              </text>
              <text
                x="290"
                y="36"
                textAnchor="middle"
                fill={theme.palette.text.secondary}
                style={{ fontSize: 9 }}
              >
                Bubble size ∝ √EAD · Colour = Climate Risk (ΔECL)
              </text>

              {/* Legend */}
              <g transform="translate(14, 340)">
                {[
                  { color: "url(#grad-low)", label: "< ₦30M" },
                  { color: "url(#grad-med)", label: "₦30–60M" },
                  { color: "url(#grad-med-high)", label: "₦60–100M" },
                  { color: "url(#grad-high)", label: "> ₦100M" },
                ].map((item, idx) => (
                  <g key={idx} transform={`translate(${idx * 112}, 0)`}>
                    <rect
                      x="0"
                      y="0"
                      width="22"
                      height="13"
                      fill={item.color}
                      rx="2"
                      stroke={
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(0,0,0,0.15)"
                      }
                    />
                    <text
                      x="27"
                      y="10"
                      fill={theme.palette.text.secondary}
                      style={{ fontSize: 9 }}
                    >
                      {item.label}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          {regionData ? (
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: "100%",
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {regionData.name}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Exposure (EAD)
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatScenarioCurrency(regionData.totalEAD)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Number of Loans
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {regionData.loanCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Climate Risk Impact (ΔECL)
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={DELOITTE_COLORS.error}
                  >
                    +{formatScenarioCurrency(regionData.deltaECL)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(
                      (regionData.deltaECL / regionData.totalEAD) *
                      100
                    ).toFixed(2)}
                    % of state EAD
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Dominant Sector
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {regionData.dominantSector}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Physical Risk Factors
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {regionData.physicalRisks.map((risk) => (
                      <Box
                        key={risk}
                        sx={{
                          bgcolor: alpha(DELOITTE_COLORS.warning, 0.1),
                          color: DELOITTE_COLORS.warning,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          border: `1px solid ${alpha(DELOITTE_COLORS.warning, 0.2)}`,
                        }}
                      >
                        ⚠️ {risk}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.action.disabled, 0.05),
                p: 4,
                textAlign: "center",
              }}
            >
              <Box>
                <Info
                  size={32}
                  color={theme.palette.text.disabled}
                  style={{ marginBottom: 8 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Click on a state to view details
                </Typography>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          State Risk Ranking
        </Typography>
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.action.disabled, 0.05) }}
              >
                <TableCell>Rank</TableCell>
                <TableCell>State</TableCell>
                <TableCell align="right">EAD</TableCell>
                <TableCell align="right">Loans</TableCell>
                <TableCell align="right">ΔECL</TableCell>
                <TableCell align="right">Risk %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...NIGERIA_REGIONS]
                .sort((a, b) => b.deltaECL - a.deltaECL)
                .map((region, index) => (
                  <TableRow
                    key={region.name}
                    hover
                    onClick={() => setSelectedRegion(region.name)}
                    sx={{ cursor: "pointer" }}
                    selected={selectedRegion === region.name}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                    <TableCell>{region.name}</TableCell>
                    <TableCell align="right">
                      {formatScenarioCurrency(region.totalEAD)}
                    </TableCell>
                    <TableCell align="right">{region.loanCount}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: DELOITTE_COLORS.error, fontWeight: 600 }}
                    >
                      +{formatScenarioCurrency(region.deltaECL)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary" }}>
                      {((region.deltaECL / region.totalEAD) * 100).toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 2,
          bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.1),
          borderLeft: `4px solid ${DELOITTE_COLORS.slate.DEFAULT}`,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: DELOITTE_COLORS.slate.DEFAULT }}
          gutterBottom
        >
          🌍 Geographic Insights:
        </Typography>
        <Typography
          component="ul"
          variant="body2"
          color="text.secondary"
          sx={{ pl: 2, m: 0 }}
        >
          <li>
            <Typography component="span" fontWeight={600}>
              Lagos:{" "}
            </Typography>
            Largest exposure (40% of portfolio) with coastal flood risk from sea
            level rise — financial services and commercial hub concentration
          </li>
          <li>
            <Typography component="span" fontWeight={600}>
              Niger Delta (Rivers, Delta):{" "}
            </Typography>
            Oil & Gas hub facing transition risk from energy decarbonization +
            oil spill and coastal erosion physical risk
          </li>
          <li>
            <Typography component="span" fontWeight={600}>
              Northern States (Kano, Kaduna, Borno):{" "}
            </Typography>
            Agriculture-heavy with severe drought and desertification risk —
            climate-smart agriculture financing recommended
          </li>
          <li>
            <Typography component="span" fontWeight={600}>
              South-West (Oyo, Ogun):{" "}
            </Typography>
            Manufacturing corridor with flooding risk and industrial transition
            exposure from emission regulations
          </li>
        </Typography>
      </Paper>
    </Paper>
  );
};
