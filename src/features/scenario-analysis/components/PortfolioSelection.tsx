import { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Chip,
  Alert,
  alpha,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  ArrowRight,
  Database,
  MapPin,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { useCRADataStore } from "@/store/craStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useIndustry } from "@/hooks/useIndustry";

interface PortfolioSelectionProps {
  onNext: () => void;
}

const BAR_COLORS = [
  DELOITTE_COLORS.green.DEFAULT,
  "#000000",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
];

export default function PortfolioSelection({
  onNext,
}: PortfolioSelectionProps) {
  const theme = useTheme();
  const { assets } = useCRADataStore();
  const { config: industryConfig } = useIndustry();

  const assetTypeLabels = useMemo(() => {
    const map: Record<string, string> = {};
    industryConfig.assetTypes.forEach((a) => {
      map[a.id] = a.name;
    });
    return map;
  }, [industryConfig.assetTypes]);

  const getExposure = (a: Record<string, unknown>) =>
    Number(a.outstandingBalance) ||
    Number(a["Net Book Value"]) ||
    Number(a["Book Value"]) ||
    0;

  const uploadedAssetTypes = useMemo(() => {
    return Object.entries(assets)
      .filter(([, v]) => v.data && v.data.length > 0)
      .map(([key, v]) => ({
        key,
        label: assetTypeLabels[key] || v.type || key,
        count: v.data.length,
        exposure: v.data.reduce((sum, a) => sum + getExposure(a), 0),
        uploadedAt: v.uploadedAt,
      }));
  }, [assets]);

  const hasData = uploadedAssetTypes.length > 0;

  const portfolioStats = useMemo(() => {
    let totalExposure = 0;
    const sectorMap: Record<string, number> = {};
    const regionMap: Record<string, number> = {};
    let assetCount = 0;

    Object.values(assets).forEach((assetType) => {
      if (!assetType.data) return;
      assetType.data.forEach((a) => {
        const exp = getExposure(a);
        totalExposure += exp;
        assetCount++;
        const sector = a.sector || "Unclassified";
        sectorMap[sector] = (sectorMap[sector] || 0) + exp;
        const region = a.region || "Unknown";
        regionMap[region] = (regionMap[region] || 0) + exp;
      });
    });

    const sectorData = Object.entries(sectorMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { totalExposure, assetCount, sectorData, regionMap };
  }, [assets]);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Portfolio Scope
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review the uploaded asset classes, exposure breakdown, and geographic
          coverage for this stress test.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{ p: 0, overflow: "hidden", borderRadius: 3 }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(DELOITTE_COLORS.primary.DEFAULT, 0.06),
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Database size={18} color={DELOITTE_COLORS.primary.DEFAULT} />
              <Typography variant="subtitle2" fontWeight={700}>
                Available Asset Classes ({uploadedAssetTypes.length})
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {!hasData ? (
                <Alert
                  severity="warning"
                  icon={<AlertCircle size={20} />}
                  sx={{ borderRadius: 2 }}
                >
                  No asset data found. Please upload data in the CRA Data Upload
                  module first.
                </Alert>
              ) : (
                <Stack spacing={1.5}>
                  {uploadedAssetTypes.map((at) => (
                    <Box
                      key={at.key}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.3),
                        bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.04),
                        transition: "all 0.2s",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.12),
                          mr: 1.5,
                        }}
                      >
                        <FileSpreadsheet
                          size={18}
                          color={DELOITTE_COLORS.primary.DEFAULT}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {at.label}
                          </Typography>
                          <CheckCircle2 size={14} color="#10B981" />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {at.count} records • ₦{(at.exposure / 1e6).toFixed(2)}
                          M
                        </Typography>
                      </Box>
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          bgcolor: alpha("#10B981", 0.1),
                          color: "#10B981",
                          fontWeight: 600,
                          fontSize: 11,
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>

          <Paper
            variant="outlined"
            sx={{ mt: 3, p: 0, overflow: "hidden", borderRadius: 3 }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: alpha("#10B981", 0.05),
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <MapPin size={18} color="#10B981" />
              <Typography variant="subtitle2" fontWeight={700}>
                Geopolitical Zone Coverage
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {hasData ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {Object.entries(portfolioStats.regionMap).map(
                    ([region, exposure]) => (
                      <Chip
                        key={region}
                        label={`${region} (₦${(exposure / 1e6).toFixed(1)}M)`}
                        size="small"
                        sx={{
                          mb: 0.5,
                          bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.08),
                          fontWeight: 500,
                          border: `1px solid ${alpha(DELOITTE_COLORS.green.DEFAULT, 0.2)}`,
                        }}
                      />
                    ),
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No geopolitical zone data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            variant="outlined"
            sx={{ p: 3, height: "100%", borderRadius: 3 }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" fontWeight={700}>
                {industryConfig.id === "telecommunications"
                  ? "Value Summary"
                  : "Exposure Summary"}
              </Typography>
              <Chip
                label={`${portfolioStats.assetCount} Assets`}
                size="small"
                sx={{ bgcolor: DELOITTE_COLORS.slate.lit, color: "#fff" }}
              />
            </Stack>

            <Grid container spacing={2} mb={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.08),
                    textAlign: "center",
                    border: `1px solid ${alpha(DELOITTE_COLORS.green.DEFAULT, 0.15)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    {industryConfig.id === "telecommunications"
                      ? "TOTAL NET BOOK VALUE"
                      : "TOTAL EXPOSURE (EAD)"}
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    ₦
                    {portfolioStats.totalExposure >= 1e9
                      ? `${(portfolioStats.totalExposure / 1e9).toFixed(2)}B`
                      : `${(portfolioStats.totalExposure / 1e6).toFixed(1)}M`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Across all asset classes
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha("#10B981", 0.08),
                    textAlign: "center",
                    border: `1px solid ${alpha("#10B981", 0.15)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    GEOPOLITICAL ZONES COVERED
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {Object.keys(portfolioStats.regionMap).length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Geopolitical Zones in Nigeria
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha("#3B82F6", 0.08),
                    textAlign: "center",
                    border: `1px solid ${alpha("#3B82F6", 0.15)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    ASSET CLASSES
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {uploadedAssetTypes.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded Types
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {hasData && (
              <Box mb={3}>
                <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                  {industryConfig.id === "telecommunications"
                    ? "Value by Infrastructure & Operations"
                    : "Exposure by Asset Class"}
                </Typography>
                <Box
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    display="grid"
                    gridTemplateColumns="1fr 0.7fr 0.7fr 0.7fr"
                    sx={{
                      p: 1.5,
                      bgcolor: alpha("#000", 0.03),
                      fontWeight: 700,
                      fontSize: 12,
                      color: "text.secondary",
                    }}
                  >
                    <Box>
                      {industryConfig.id === "telecommunications"
                        ? "Infrastructure & Operations"
                        : "Asset Type"}
                    </Box>
                    <Box>Records</Box>
                    <Box>
                      {industryConfig.id === "telecommunications"
                        ? "Net Book Value (₦)"
                        : "Exposure (₦)"}
                    </Box>
                    <Box>% of Total</Box>
                  </Box>
                  {uploadedAssetTypes.map((at) => (
                    <Box
                      key={at.key}
                      display="grid"
                      gridTemplateColumns="1fr 0.7fr 0.7fr 0.7fr"
                      sx={{
                        p: 1.5,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        fontSize: 13,
                        "&:hover": {
                          bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.03),
                        },
                      }}
                    >
                      <Box fontWeight={600}>{at.label}</Box>
                      <Box>{at.count.toLocaleString()}</Box>
                      <Box fontWeight={600}>
                        ₦{(at.exposure / 1e6).toFixed(2)}M
                      </Box>
                      <Box>
                        <Chip
                          label={`${portfolioStats.totalExposure > 0 ? ((at.exposure / portfolioStats.totalExposure) * 100).toFixed(1) : 0}%`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.12),
                            fontSize: 11,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {hasData && portfolioStats.sectorData.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Top 5 Sectors by Volume
                </Typography>
                <Box sx={{ height: 260, width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={portfolioStats.sectorData}
                      margin={{ top: 10, right: 20, left: 10, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        angle={-20}
                        textAnchor="end"
                        fontSize={11}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: number) =>
                          `${(v / 1e6).toFixed(0)}M`
                        }
                        fontSize={11}
                      />
                      <RechartsTooltip
                        formatter={(value: number | string | undefined) =>
                          `₦${(Number(value ?? 0) / 1e6).toFixed(2)}M`
                        }
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                        {portfolioStats.sectorData.map((_e, i) => (
                          <Cell
                            key={i}
                            fill={BAR_COLORS[i % BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowRight />}
          onClick={onNext}
          disabled={!hasData}
          sx={{
            bgcolor: DELOITTE_COLORS.green.DEFAULT,
            color: "#000",
            fontWeight: 700,
            "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
          }}
        >
          Confirm Scope & Next
        </Button>
      </Box>
    </Box>
  );
}
