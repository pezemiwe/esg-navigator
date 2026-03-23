import React from "react";
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
} from "@mui/material";
import {
  useScenarioStore,
  NGFS_SCENARIOS,
  type ScenarioType,
} from "@/store/scenarioStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { formatScenarioCurrency, formatDollarM } from "../../utils";
import { useIndustry } from "@/hooks/useIndustry";
import { getNPVSummary } from "@/features/scenario-analysis/data/telecomScenarioData";

interface ECLHeatmapProps {
  className?: string;
}
export const ECLHeatmap: React.FC<ECLHeatmapProps> = () => {
  const { results } = useScenarioStore();
  const theme = useTheme();
  const { isNonFinancial } = useIndustry();
  const horizons = ["short", "medium", "long"] as const;
  const scenarioTypes = ["orderly", "disorderly", "hothouse"] as const;

  /* ─── Banking: ECL delta ─── */
  const getECLDelta = (
    scenarioType: string,
    horizon: string,
  ): number | null => {
    const result = results.find(
      (r) => r.scenario === scenarioType && r.horizon === horizon,
    );
    return result?.eclResults.deltaECL ?? null;
  };

  /* ─── Telecom: NPV Impact ─── */
  const getNPVImpact = (
    scenarioType: string,
    horizon: string,
  ): number | null => {
    const npvSummary = getNPVSummary(
      scenarioType as "orderly" | "disorderly" | "hothouse",
    );
    if (!npvSummary) return null;
    const horizonMultiplier =
      horizon === "short" ? 0.3 : horizon === "medium" ? 0.65 : 1.0;
    return (
      Math.abs(npvSummary.npvBaseline - npvSummary.npvStressed) *
      horizonMultiplier
    );
  };

  const getValue = (scenarioType: string, horizon: string): number | null => {
    if (isNonFinancial) return getNPVImpact(scenarioType, horizon);
    return getECLDelta(scenarioType, horizon);
  };

  const getCellStyles = (val: number | null) => {
    if (val === null)
      return {
        bgcolor: alpha(theme.palette.action.disabled, 0.1),
        color: theme.palette.text.disabled,
        fontWeight: 400,
      };
    // Thresholds adapted for telecom ($M) or banking (absolute)
    const low = isNonFinancial ? 500 : 50000000;
    const med = isNonFinancial ? 2000 : 150000000;
    const high = isNonFinancial ? 4000 : 300000000;

    if (val < low)
      return {
        bgcolor: alpha(DELOITTE_COLORS.success, 0.15),
        color: DELOITTE_COLORS.success,
        fontWeight: 600,
        border: `1px solid ${alpha(DELOITTE_COLORS.success, 0.3)}`,
      };
    if (val < med)
      return {
        bgcolor: alpha(DELOITTE_COLORS.warning, 0.15),
        color: DELOITTE_COLORS.warning,
        fontWeight: 700,
        border: `1px solid ${alpha(DELOITTE_COLORS.warning, 0.3)}`,
      };
    if (val < high)
      return {
        bgcolor: alpha("#FF9800", 0.15),
        color: "#E65100",
        fontWeight: 700,
        border: `1px solid ${alpha("#FF9800", 0.3)}`,
      };
    return {
      bgcolor: alpha(DELOITTE_COLORS.error, 0.15),
      color: DELOITTE_COLORS.error,
      fontWeight: 800,
      border: `1px solid ${alpha(DELOITTE_COLORS.error, 0.3)}`,
    };
  };

  const formatValue = (val: number | null): string => {
    if (val === null) return "N/A";
    if (isNonFinancial) return formatDollarM(val);
    return formatScenarioCurrency(val);
  };

  const getSubLabel = (val: number | null): string => {
    if (val === null) return "";
    if (isNonFinancial) {
      const npvBaseline = 12600;
      return `${((val / npvBaseline) * 100).toFixed(1)}% of NPV`;
    }
    const totalPortfolio = 11800000000; // ₦11.8B
    return `+${((val / totalPortfolio) * 100).toFixed(2)}% of portfolio`;
  };
  const getScenarioLabel = (type: string): string => {
    return NGFS_SCENARIOS[type as ScenarioType]?.name || type;
  };
  const getHorizonLabel = (horizon: string): string => {
    const labels: Record<string, string> = {
      short: "Short-term (1-3y)",
      medium: "Medium-term (3-10y)",
      long: "Long-term (10-30y)",
    };
    return labels[horizon] || horizon;
  };
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          <span style={{ marginRight: 8, fontSize: "1.2rem" }}>🔥</span>
          {isNonFinancial ? "Climate Impact Heatmap" : "ECL Impact Heatmap"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isNonFinancial
            ? "NPV erosion ($M) by climate scenario and time horizon"
            : "Expected Credit Loss increase (ΔECL) by scenario and time horizon"}
        </Typography>
      </Box>
      <TableContainer>
        <Table
          sx={{
            "& th, & td": {
              border: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  bgcolor: theme.palette.background.default,
                  fontWeight: 700,
                }}
              >
                Scenario / Horizon
              </TableCell>
              {horizons.map((horizon) => (
                <TableCell
                  key={horizon}
                  align="center"
                  sx={{
                    bgcolor: theme.palette.background.default,
                    fontWeight: 700,
                    width: "25%",
                  }}
                >
                  {getHorizonLabel(horizon)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {scenarioTypes.map((scenarioType) => (
              <TableRow key={scenarioType}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    bgcolor: theme.palette.background.default,
                    fontWeight: 600,
                  }}
                >
                  {getScenarioLabel(scenarioType)}
                </TableCell>
                {horizons.map((horizon) => {
                  const val = getValue(scenarioType, horizon);
                  const styles = getCellStyles(val);
                  return (
                    <TableCell
                      key={`${scenarioType}-${horizon}`}
                      align="center"
                      sx={{
                        ...styles,
                        transition: "all 0.2s",
                        "&:hover": { filter: "brightness(0.95)" },
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="inherit"
                          color="inherit"
                        >
                          {formatValue(val)}
                        </Typography>
                        {val !== null && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="inherit"
                            sx={{ opacity: 0.8 }}
                          >
                            {getSubLabel(val)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          mt: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          Impact Level:
        </Typography>
        {(isNonFinancial
          ? [
              { color: DELOITTE_COLORS.success, label: "Low (<$500M)" },
              { color: DELOITTE_COLORS.warning, label: "Moderate ($500M–$2B)" },
              { color: "#E65100", label: "High ($2B–$4B)" },
              { color: DELOITTE_COLORS.error, label: "Critical (>$4B)" },
            ]
          : [
              { color: DELOITTE_COLORS.success, label: "Low (<₦50M)" },
              { color: DELOITTE_COLORS.warning, label: "Moderate (₦50–150M)" },
              { color: "#E65100", label: "High (₦150–300M)" },
              { color: DELOITTE_COLORS.error, label: "Critical (>₦300M)" },
            ]
        ).map((item, idx) => (
          <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                bgcolor: alpha(item.color, 0.2),
                border: `1px solid ${alpha(item.color, 0.5)}`,
              }}
            />
            <Typography variant="caption" color="text.primary">
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Paper
        elevation={0}
        sx={{
          mt: 3,
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
          Key Insights:
        </Typography>
        <Typography
          component="ul"
          variant="body2"
          color="text.secondary"
          sx={{ pl: 2, m: 0 }}
        >
          {isNonFinancial ? (
            <>
              <li>
                Longer horizons amplify NPV erosion as cumulative climate costs
                compound through the discount rate
              </li>
              <li>
                Hot-house scenarios show the greatest infrastructure asset
                impairment from unmitigated physical risks
              </li>
              <li>
                Disorderly transitions impose sharp near-term capex shocks from
                abrupt regulatory and technology shifts
              </li>
              <li>
                Results inform climate-resilient infrastructure investment
                planning and capital allocation
              </li>
            </>
          ) : (
            <>
              <li>
                Longer time horizons typically show higher ECL impacts due to
                cumulative effects
              </li>
              <li>
                Hothouse scenarios (3.2°C warming) represent worst-case physical
                risk materialization
              </li>
              <li>
                Disorderly transitions show sharp near-term impacts from abrupt
                policy changes
              </li>
              <li>
                Results inform ICAAP capital buffer calibration per Central Bank
                of Nigeria guidelines
              </li>
            </>
          )}
        </Typography>
      </Paper>
    </Paper>
  );
};
