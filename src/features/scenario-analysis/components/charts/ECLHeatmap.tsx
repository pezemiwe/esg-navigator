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
import { formatScenarioCurrency } from "../../utils";
interface ECLHeatmapProps {
  className?: string;
}
export const ECLHeatmap: React.FC<ECLHeatmapProps> = () => {
  const { results } = useScenarioStore();
  const theme = useTheme();
  const horizons = ["short", "medium", "long"] as const;
  const scenarioTypes = ["orderly", "disorderly", "hothouse"] as const;
  const getECLDelta = (
    scenarioType: string,
    horizon: string,
  ): number | null => {
    const result = results.find(
      (r) => r.scenario === scenarioType && r.horizon === horizon,
    );
    return result?.eclResults.deltaECL ?? null;
  };
  const getCellStyles = (deltaECL: number | null) => {
    if (deltaECL === null)
      return {
        bgcolor: alpha(theme.palette.action.disabled, 0.1),
        color: theme.palette.text.disabled,
        fontWeight: 400,
      };
    if (deltaECL < 50000000)
      return {
        bgcolor: alpha(DELOITTE_COLORS.success, 0.15),
        color: DELOITTE_COLORS.success,
        fontWeight: 600,
        border: `1px solid ${alpha(DELOITTE_COLORS.success, 0.3)}`,
      };
    if (deltaECL < 150000000)
      return {
        bgcolor: alpha(DELOITTE_COLORS.warning, 0.15),
        color: DELOITTE_COLORS.warning,
        fontWeight: 700,
        border: `1px solid ${alpha(DELOITTE_COLORS.warning, 0.3)}`,
      };
    if (deltaECL < 300000000)
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
          ECL Impact Heatmap
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Expected Credit Loss increase (ΔECL) by scenario and time horizon
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
                  const val = getECLDelta(scenarioType, horizon);
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
                          {val !== null ? formatScenarioCurrency(val) : "N/A"}
                        </Typography>
                        {val !== null && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="inherit"
                            sx={{ opacity: 0.8 }}
                          >
                            +{(((val / 1000000) * 100) / 11800).toFixed(2)}% of
                            portfolio
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
        {[
          { color: DELOITTE_COLORS.success, label: "Low (<S 50M)" },
          { color: DELOITTE_COLORS.warning, label: "Moderate (S 50-150M)" },
          { color: "#E65100", label: "Hi (S 150-300M)" },
          { color: DELOITTE_COLORS.error, label: "Critical (>S 300M)" },
        ].map((item, idx) => (
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
          Key Insits:
        </Typography>
        <Typography
          component="ul"
          variant="body2"
          color="text.secondary"
          sx={{ pl: 2, m: 0 }}
        >
          <li>
            Longer time horizons typically show hier ECL impacts due to
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
            Results inform ICAAP capital buffer calibration per Central Bank of
            Nigeria guidelines
          </li>
        </Typography>
      </Paper>
    </Paper>
  );
};
