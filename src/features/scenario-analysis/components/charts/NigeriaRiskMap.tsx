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
    path: "M 180,300 L 220,290 L 230,310 L 210,330 L 180,320 Z",
    totalEAD: 4720000000,
    loanCount: 42,
    deltaECL: 185000000,
    dominantSector: "Financial Services",
    physicalRisks: ["Coastal Flooding", "Sea Level Rise", "Storm Surge"],
    centroid: { x: 205, y: 310 },
  },
  {
    name: "Rivers",
    path: "M 340,320 L 400,310 L 410,340 L 380,360 L 340,350 Z",
    totalEAD: 1900000000,
    loanCount: 16,
    deltaECL: 92000000,
    dominantSector: "Oil & Gas",
    physicalRisks: ["Oil Spill Risk", "Coastal Erosion", "Flooding"],
    centroid: { x: 375, y: 335 },
  },
  {
    name: "Abuja FCT",
    path: "M 300,200 L 340,190 L 350,220 L 330,240 L 300,230 Z",
    totalEAD: 1580000000,
    loanCount: 12,
    deltaECL: 68000000,
    dominantSector: "Real Estate",
    physicalRisks: ["Flooding", "Water Stress", "Heat Waves"],
    centroid: { x: 325, y: 215 },
  },
  {
    name: "Kano",
    path: "M 320,80 L 380,70 L 390,110 L 360,130 L 320,120 Z",
    totalEAD: 980000000,
    loanCount: 9,
    deltaECL: 42000000,
    dominantSector: "Agriculture",
    physicalRisks: ["Drought", "Desertification", "Heat Waves"],
    centroid: { x: 355, y: 100 },
  },
  {
    name: "Delta",
    path: "M 280,300 L 340,290 L 350,320 L 320,340 L 280,330 Z",
    totalEAD: 850000000,
    loanCount: 8,
    deltaECL: 38000000,
    dominantSector: "Oil & Gas",
    physicalRisks: ["Oil Spill Risk", "Flooding", "Erosion"],
    centroid: { x: 315, y: 315 },
  },
  {
    name: "Kaduna",
    path: "M 260,100 L 320,90 L 340,130 L 310,150 L 260,140 Z",
    totalEAD: 720000000,
    loanCount: 7,
    deltaECL: 34000000,
    dominantSector: "Manufacturing",
    physicalRisks: ["Drought", "Communal Conflict", "Water Stress"],
    centroid: { x: 300, y: 120 },
  },
  {
    name: "Oyo",
    path: "M 200,250 L 260,240 L 270,270 L 240,290 L 200,280 Z",
    totalEAD: 650000000,
    loanCount: 6,
    deltaECL: 28000000,
    dominantSector: "Agriculture",
    physicalRisks: ["Irregular Rainfall", "Erosion", "Heat Stress"],
    centroid: { x: 235, y: 265 },
  },
  {
    name: "Ogun",
    path: "M 190,270 L 230,260 L 240,290 L 220,310 L 190,300 Z",
    totalEAD: 550000000,
    loanCount: 5,
    deltaECL: 24000000,
    dominantSector: "Manufacturing",
    physicalRisks: ["Flooding", "Erosion", "Industrial Waste"],
    centroid: { x: 215, y: 285 },
  },
  {
    name: "Enugu",
    path: "M 370,230 L 420,220 L 430,260 L 400,275 L 370,265 Z",
    totalEAD: 380000000,
    loanCount: 3,
    deltaECL: 18000000,
    dominantSector: "Mining",
    physicalRisks: ["Erosion", "Landslides", "Water Stress"],
    centroid: { x: 400, y: 248 },
  },
  {
    name: "Borno",
    path: "M 420,50 L 480,40 L 490,80 L 460,100 L 420,90 Z",
    totalEAD: 470000000,
    loanCount: 4,
    deltaECL: 21000000,
    dominantSector: "Agriculture",
    physicalRisks: ["Severe Drought", "Desertification", "Lake Chad Recession"],
    centroid: { x: 455, y: 70 },
  },
];
export const NigeriaRiskMap: React.FC<NigeriaRiskMapProps> = () => {
  const theme = useTheme();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const getRegionColor = (deltaECL: number): string => {
    if (deltaECL < 30000000) return DELOITTE_COLORS.success;
    if (deltaECL < 60000000) return DELOITTE_COLORS.warning;
    if (deltaECL < 100000000) return "#fb923c";
    return DELOITTE_COLORS.error;
  };
  const getRegionOpacity = (regionName: string): number => {
    if (hoveredRegion === regionName || selectedRegion === regionName) return 1;
    if (hoveredRegion || selectedRegion) return 0.4;
    return 0.8;
  };
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
              viewBox="0 0 600 400"
              style={{ width: "100%", height: "100%" }}
            >
              <text
                x="300"
                y="25"
                textAnchor="middle"
                fill={theme.palette.text.primary}
                style={{ fontSize: 14, fontWeight: "bold" }}
              >
                Federal Republic of Nigeria - Climate Risk Exposure
              </text>
              {NIGERIA_REGIONS.map((region) => (
                <g key={region.name}>
                  <path
                    d={region.path}
                    fill={getRegionColor(region.deltaECL)}
                    stroke={theme.palette.text.secondary}
                    strokeWidth="1.5"
                    opacity={getRegionOpacity(region.name)}
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={() => setHoveredRegion(region.name)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() =>
                      setSelectedRegion(
                        selectedRegion === region.name ? null : region.name,
                      )
                    }
                  />
                  <text
                    x={region.centroid.x}
                    y={region.centroid.y}
                    textAnchor="middle"
                    pointerEvents="none"
                    fill={theme.palette.common.black}
                    style={{ fontSize: 10, fontWeight: 600 }}
                  >
                    {region.name}
                  </text>
                  <circle
                    cx={region.centroid.x}
                    cy={region.centroid.y + 15}
                    r={Math.sqrt(region.totalEAD / 200000000)}
                    fill={DELOITTE_COLORS.green.DEFAULT}
                    opacity="0.5"
                    pointerEvents="none"
                  />
                </g>
              ))}
              <g transform="translate(20, 340)">
                <text
                  x="0"
                  y="0"
                  fill={theme.palette.text.secondary}
                  display="block"
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  Risk Level (ΔECL):
                </text>
                {[
                  { x: 0, color: DELOITTE_COLORS.success, label: "<30M" },
                  { x: 90, color: DELOITTE_COLORS.warning, label: "30-60M" },
                  { x: 180, color: "#fb923c", label: "60-100M" },
                  { x: 270, color: DELOITTE_COLORS.error, label: ">100M" },
                ].map((item, idx) => (
                  <g key={idx}>
                    <rect
                      x={item.x}
                      y="5"
                      width="30"
                      height="15"
                      fill={item.color}
                      stroke={theme.palette.text.secondary}
                    />
                    <text
                      x={item.x + 35}
                      y="17"
                      fill={theme.palette.text.secondary}
                      style={{ fontSize: 10 }}
                    >
                      {item.label}
                    </text>
                  </g>
                ))}
              </g>
              <g transform="translate(420, 340)">
                <text
                  x="0"
                  y="0"
                  fill={theme.palette.text.secondary}
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  Exposure (EAD):
                </text>
                <circle
                  cx="15"
                  cy="15"
                  r="8"
                  fill={DELOITTE_COLORS.green.DEFAULT}
                  opacity="0.3"
                  stroke={theme.palette.text.secondary}
                />
                <text
                  x="30"
                  y="18"
                  fill={theme.palette.text.secondary}
                  style={{ fontSize: 10 }}
                >
                  Circle size ∝ √EAD
                </text>
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
