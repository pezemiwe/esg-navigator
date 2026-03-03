import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
  Slider,
  Chip,
  Stack,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Target, CheckCircle2, Grid3x3 } from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { getRiskColor, getRiskLevel } from "../data/constants";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

const CustomTooltipContent = ({
  active,
  payload,
  isDark,
  borderColor,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      score: number;
      name: string;
      selected: boolean;
      category: string;
    };
  }>;
  isDark: boolean;
  borderColor: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: isDark ? "#1e293b" : "#fff",
        border: `1px solid ${borderColor}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 700, display: "block", mb: 0.5 }}
      >
        {d.name}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", display: "block" }}
      >
        Category: {d.category}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", display: "block" }}
      >
        Score: {d.score} ({getRiskLevel(d.score)})
      </Typography>
      <Chip
        label={d.selected ? "Selected" : "Not Selected"}
        size="small"
        sx={{
          mt: 0.5,
          fontWeight: 600,
          fontSize: "0.6rem",
          bgcolor: d.selected ? alpha("#10b981", 0.1) : alpha("#000", 0.05),
          color: d.selected ? "#10b981" : "text.secondary",
        }}
      />
    </Paper>
  );
};

export default function MaterialityAssessment() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    risks,
    selectedMaterialTopicIds,
    topSelectionCount,
    selectTopMaterialTopics,
    setSelectedTopicIds,
  } = useSustainabilityStore();

  const [manualMode, setManualMode] = useState(false);

  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);

  const rankedRisks = useMemo(() => {
    return [...risks].sort(
      (a, b) => b.impact * b.likelihood - a.impact * a.likelihood,
    );
  }, [risks]);

  const barChartData = useMemo(() => {
    return rankedRisks.slice(0, Math.max(15, topSelectionCount)).map((r) => ({
      score: r.impact * r.likelihood,
      name: r.name,
      id: r.id,
      category: r.category,
      selected: selectedMaterialTopicIds.includes(r.id),
    }));
  }, [rankedRisks, selectedMaterialTopicIds, topSelectionCount]);

  const handleSliderChange = (_: unknown, value: number | number[]) => {
    selectTopMaterialTopics(value as number);
  };

  const handleToggleManualSelect = (riskId: string) => {
    if (!manualMode) return;
    const current = new Set(selectedMaterialTopicIds);
    if (current.has(riskId)) {
      current.delete(riskId);
    } else {
      current.add(riskId);
    }
    setSelectedTopicIds(Array.from(current));
  };

  const selectedRisks = useMemo(() => {
    return risks.filter((r) => selectedMaterialTopicIds.includes(r.id));
  }, [risks, selectedMaterialTopicIds]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    selectedRisks.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [selectedRisks]);

  const avgScore = useMemo(() => {
    if (selectedRisks.length === 0) return 0;
    return (
      Math.round(
        (selectedRisks.reduce((a, r) => a + r.impact * r.likelihood, 0) /
          selectedRisks.length) *
          10,
      ) / 10
    );
  }, [selectedRisks]);

  const mockTrackingData = useMemo(
    () => [
      {
        month: "Jan",
        value: 25,
      },
      {
        month: "Feb",
        value: 32,
      },
      {
        month: "Mar",
        value: 28,
      },
      {
        month: "Apr",
        value: 38,
      },
      {
        month: "May",
        value: 35,
      },
      {
        month: "Jun",
        value: 42,
      },
    ],
    [],
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{
            color: BRAND,
            fontWeight: 700,
            letterSpacing: "0.15em",
            fontSize: "0.7rem",
          }}
        >
          MATERIALITY ASSESSMENT
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
          Double Materiality Assessment
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 0.5, maxWidth: 700 }}
        >
          Prioritize sustainability topics using impact-likelihood scoring —
          select your material topics for IFRS S1/S2 disclosure
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          {
            label: "Total Risks Assessed",
            value: risks.length,
            color: "#f59e0b",
          },
          {
            label: "Material Topics Selected",
            value: selectedMaterialTopicIds.length,
            color: BRAND,
          },
          { label: "Average Risk Score", value: avgScore, color: "#3b82f6" },
          {
            label: "Categories Covered",
            value: categoryBreakdown.length,
            color: "#8b5cf6",
          },
        ].map((stat) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  bgcolor: stat.color,
                },
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: "0.65rem",
                }}
              >
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Grid3x3 size={18} color={BRAND} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Top Risks Score Distribution
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                {[
                  { label: "Critical >=20", color: "#dc2626" },
                  { label: "High 12-19", color: "#f97316" },
                  { label: "Medium 6-11", color: "#eab308" },
                  { label: "Low <6", color: "#22c55e" },
                ].map((l) => (
                  <Box
                    key={l.label}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: l.color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontSize: "0.6rem", fontWeight: 600 }}
                    >
                      {l.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha("#000", 0.06)}
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    stroke="text.secondary"
                    fontSize={11}
                    domain={[0, 25]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="text.secondary"
                    fontSize={10}
                    tickFormatter={(val) =>
                      val.length > 20 ? val.substring(0, 20) + "..." : val
                    }
                  />
                  <Tooltip
                    content={
                      <CustomTooltipContent
                        isDark={isDark}
                        borderColor={borderColor}
                      />
                    }
                    cursor={{
                      fill: isDark ? alpha("#fff", 0.05) : alpha("#000", 0.03),
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={30}>
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getRiskColor(entry.score)}
                        opacity={entry.selected ? 1 : 0.4}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Material Topic Selection
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={manualMode}
                    onChange={(e) => setManualMode(e.target.checked)}
                    sx={{
                      "& .Mui-checked": { color: BRAND },
                      "& .Mui-checked + .MuiSwitch-track": { bgcolor: BRAND },
                    }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Manual Override
                  </Typography>
                }
              />
            </Box>

            {!manualMode && risks.length >= 3 && (
              <Box sx={{ px: 2, mb: 3 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, mb: 1, display: "block" }}
                >
                  Select Top {topSelectionCount} Material Topics
                </Typography>
                <Slider
                  value={Math.min(topSelectionCount, risks.length)}
                  onChange={handleSliderChange}
                  min={3}
                  max={Math.min(risks.length, 20)}
                  step={1}
                  marks
                  valueLabelDisplay="on"
                  sx={{
                    color: BRAND,
                    "& .MuiSlider-valueLabel": { bgcolor: BRAND },
                  }}
                />
              </Box>
            )}

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "text.secondary",
                        bgcolor: cardBg,
                      },
                    }}
                  >
                    <TableCell sx={{ width: 40 }}>Rank</TableCell>
                    {manualMode && <TableCell sx={{ width: 40 }} />}
                    <TableCell>Topic Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="center">Impact</TableCell>
                    <TableCell align="center">Likelihood</TableCell>
                    <TableCell align="center">Score</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankedRisks.map((risk, i) => {
                    const score = risk.impact * risk.likelihood;
                    const isSelected = selectedMaterialTopicIds.includes(
                      risk.id,
                    );
                    return (
                      <TableRow
                        key={risk.id}
                        onClick={() => handleToggleManualSelect(risk.id)}
                        sx={{
                          cursor: manualMode ? "pointer" : "default",
                          bgcolor: isSelected
                            ? alpha(BRAND, 0.04)
                            : "transparent",
                          "&:hover": { bgcolor: alpha(BRAND, 0.06) },
                        }}
                      >
                        <TableCell
                          sx={{ fontWeight: 800, color: "text.secondary" }}
                        >
                          {i + 1}
                        </TableCell>
                        {manualMode && (
                          <TableCell>
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              sx={{ p: 0, "&.Mui-checked": { color: BRAND } }}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                          {risk.name}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={risk.category}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.6rem",
                              bgcolor: alpha(BRAND, 0.06),
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          {risk.impact}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          {risk.likelihood}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={score}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: "0.7rem",
                              minWidth: 40,
                              bgcolor: alpha(getRiskColor(score), 0.12),
                              color: getRiskColor(score),
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: getRiskColor(score) }}
                          >
                            {getRiskLevel(score)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {isSelected ? (
                            <CheckCircle2 size={16} color="#10b981" />
                          ) : (
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                border: `2px solid ${alpha("#000", 0.15)}`,
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(BRAND, isDark ? 0.06 : 0.03),
              border: `1px solid ${alpha(BRAND, 0.12)}`,
              mb: 3,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Target size={18} color={BRAND} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Selected Material Topics ({selectedMaterialTopicIds.length})
              </Typography>
            </Box>
            {selectedRisks.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", textAlign: "center", py: 3 }}
              >
                Use the slider or manual mode to select material topics
              </Typography>
            ) : (
              <Stack spacing={1}>
                {selectedRisks.map((r, i) => {
                  const score = r.impact * r.likelihood;
                  return (
                    <Box
                      key={r.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: cardBg,
                        border: `1px solid ${borderColor}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 800, color: BRAND, minWidth: 20 }}
                      >
                        {i + 1}
                      </Typography>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: "0.78rem" }}
                          noWrap
                        >
                          {r.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", fontSize: "0.65rem" }}
                        >
                          {r.category} • {r.financialEffect}
                        </Typography>
                      </Box>
                      <Chip
                        label={score}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          bgcolor: alpha(getRiskColor(score), 0.12),
                          color: getRiskColor(score),
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Category Distribution
            </Typography>
            <Stack spacing={1.5}>
              {categoryBreakdown.map(([cat, count]) => (
                <Box key={cat}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {cat}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: BRAND }}
                    >
                      {count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha("#000", 0.06),
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${(count / selectedRisks.length) * 100}%`,
                        bgcolor: BRAND,
                        borderRadius: 3,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: alpha("#3b82f6", isDark ? 0.06 : 0.03),
              border: `1px solid ${alpha("#3b82f6", 0.1)}`,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, mb: 1.5, color: "#3b82f6" }}
            >
              IFRS S2 Alignment Note
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                lineHeight: 1.6,
                display: "block",
              }}
            >
              IFRS S2 requires disclosure of all climate-related risks and
              opportunities that could reasonably be expected to affect the
              entity's cash flows, access to finance, or cost of capital over
              the short, medium, or long term. Ensure your material topic
              selection covers transition risks, physical risks, and
              climate-related opportunities across your value chain.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Selected Material Topics Dashboards */}
      {selectedRisks.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Material Topics Tracking Dashboards
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Dedicated management and tracking interfaces for your prioritized
            material risks. Review monthly tracking and mitigation progress
            here.
          </Typography>

          <Stack spacing={4}>
            {selectedRisks.map((risk) => (
              <Paper
                key={risk.id}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: cardBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {risk.name}
                      </Typography>
                      <Chip
                        label={risk.category}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.65rem",
                          bgcolor: alpha(BRAND, 0.1),
                          color: BRAND,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Financial Effect: {risk.financialEffect} | Time Horizon:{" "}
                      {risk.timeHorizon}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Score: ${risk.impact * risk.likelihood}`}
                    sx={{
                      fontWeight: 800,
                      bgcolor: alpha(
                        getRiskColor(risk.impact * risk.likelihood),
                        0.1,
                      ),
                      color: getRiskColor(risk.impact * risk.likelihood),
                    }}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 2 }}
                    >
                      Monthly Forward Tracking (Mock Data)
                    </Typography>
                    <Box sx={{ height: 250, width: "100%" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockTrackingData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={borderColor}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            stroke="text.secondary"
                            fontSize={11}
                          />
                          <YAxis stroke="text.secondary" fontSize={11} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: isDark ? "#1e293b" : "#fff",
                              borderRadius: 8,
                              border: `1px solid ${borderColor}`,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={BRAND}
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 2 }}
                    >
                      Mitigation & Controls
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isDark
                            ? alpha("#fff", 0.02)
                            : alpha("#000", 0.02),
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: "block" }}
                        >
                          Primary Control Action
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Implement rigorous {risk.category.toLowerCase()}{" "}
                          monitoring metrics in ops.
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isDark
                            ? alpha("#fff", 0.02)
                            : alpha("#000", 0.02),
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: "block" }}
                        >
                          Accountable Department
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {risk.category === "Environment"
                            ? "EHS Team"
                            : risk.category === "Social"
                              ? "HR Department"
                              : "Risk & Compliance"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isDark
                            ? alpha("#fff", 0.02)
                            : alpha("#000", 0.02),
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: "block" }}
                        >
                          Status
                        </Typography>
                        <Chip
                          size="small"
                          label="Active Tracking"
                          sx={{
                            mt: 0.5,
                            height: 20,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            bgcolor: alpha(BRAND, 0.1),
                            color: BRAND,
                          }}
                        />
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
