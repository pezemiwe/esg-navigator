import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
  Button,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useMaterialityStore } from "@/store/materialityStore"; // Import
import { useShallow } from "zustand/react/shallow";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { getRiskColor } from "../../data/constants";

// Import local helper
import { getTemplateForRisk } from "@/config/fmn_templates";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

const getHeatMapScore = (impact: number, likelihood: number) =>
  impact * likelihood;

const getStableJitter = (id: string, salt: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (Math.imul(31, hash) + id.charCodeAt(i)) | 0;
  }
  const random = Math.abs(Math.sin(hash + salt)) * 10000;
  return (random - Math.floor(random) - 0.5) * 0.4;
};

const MaterialityScoringPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const { risks, addRisk } = useSustainabilityStore(
    useShallow((state) => ({
      risks: state.risks,
      addRisk: state.addRisk,
    })),
  );

  const setTopics = useMaterialityStore((state) => state.setTopics);

  const [topNSelection, setTopNSelection] = useState<number | "all">(5);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newRisk, setNewRisk] = useState({
    name: "",
    category: "Environmental",
    impact: 3,
    likelihood: 3,
  });

  const handleAddCustomRisk = () => {
    if (!newRisk.name) return;
    addRisk({
      id: `custom-${Date.now()}`,
      name: newRisk.name,
      category: newRisk.category,
      subcategory: "Custom Risk",
      impact: newRisk.impact,
      likelihood: newRisk.likelihood,
      financialEffect: "Unknown",
      timeHorizon: "Medium",
      source: "internal",
    });
    setOpenAddDialog(false);
    setNewRisk({
      name: "",
      category: "Environmental",
      impact: 3,
      likelihood: 3,
    });
  };

  const sortedRisksData = useMemo(() => {
    return [...risks]
      .map((r) => {
        return {
          ...r,
          heatScore: getHeatMapScore(r.impact, r.likelihood),
          jitteredImpact: r.impact + getStableJitter(r.id, 1),
          jitteredLikelihood: r.likelihood + getStableJitter(r.id, 2),
        };
      })
      .sort((a, b) => b.heatScore - a.heatScore);
  }, [risks]);

  const displayedChartData = useMemo(() => {
    if (topNSelection === "all") return sortedRisksData;
    return sortedRisksData.slice(0, topNSelection);
  }, [sortedRisksData, topNSelection]);

  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);

  // Calculate dynamic height based on number of items to prevent overlap
  // Base height + (height per item * number of items)
  const chartHeight = Math.max(500, displayedChartData.length * 60);

  const handleProceed = () => {
    // Convert current risks to MaterialTopics
    const mappedTopics = displayedChartData.map((risk) => {
      // Use the FMN Template configuration
      const metrics = getTemplateForRisk(risk.name);

      return {
        id: risk.id,
        name: risk.name,
        description: `${risk.category} - ${risk.subcategory}`,
        dataNeeds: metrics as unknown as string[], // Cast to satisfy type checker for now, will be used as objects
        status: "partial" as const,
        selected: true,
        impact: risk.impact,
        stakeholderInterest: risk.likelihood,
      };
    });

    setTopics(mappedTopics);
    navigate("/sustainability/materiality");
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        p: 4,
        width: "100%",
        bgcolor: theme.palette.background.default,
      }}
    >
      <Box mb={4}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate("/sustainability/risks")}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          Back to Risk Register
        </Button>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Materiality Scoring & Prioritization
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review your identified risks sorted by calculated severity (Heat
              Score)
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={() => setOpenAddDialog(true)}
              startIcon={<Plus size={16} />}
              sx={{ fontWeight: 600, textTransform: "none" }}
            >
              Add Custom Risk
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowRight size={16} />}
              onClick={handleProceed}
              sx={{
                bgcolor: BRAND,
                "&:hover": { bgcolor: alpha(BRAND, 0.9) },
                fontWeight: 600,
                textTransform: "none",
                px: 3,
              }}
            >
              Proceed to Data Collection
            </Button>
          </Box>
        </Stack>
      </Box>

      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Custom Risk</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Risk Name"
              fullWidth
              value={newRisk.name}
              onChange={(e) => setNewRisk({ ...newRisk, name: e.target.value })}
              placeholder="e.g. Supply Chain Disruption"
            />
            <TextField
              select
              label="Category"
              fullWidth
              value={newRisk.category}
              onChange={(e) =>
                setNewRisk({ ...newRisk, category: e.target.value })
              }
            >
              {[
                "Environmental",
                "Social",
                "Governance",
                "Technology",
                "Operational",
              ].map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Impact (1-5)"
                fullWidth
                value={newRisk.impact}
                onChange={(e) =>
                  setNewRisk({ ...newRisk, impact: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Likelihood (1-5)"
                fullWidth
                value={newRisk.likelihood}
                onChange={(e) =>
                  setNewRisk({ ...newRisk, likelihood: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <MenuItem key={i} value={i}>
                    {i}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddCustomRisk}
            disabled={!newRisk.name}
          >
            Add Risk
          </Button>
        </DialogActions>
      </Dialog>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: `1px solid ${borderColor}`,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          pb={3}
          borderBottom={`1px solid ${borderColor}`}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Filter Top Material Risks
            </Typography>
            <Stack direction="row" spacing={1}>
              {[5, 10, 15, 20, "all"].map((num) => (
                <Chip
                  key={num}
                  label={num === "all" ? "View All" : `Top ${num}`}
                  onClick={() =>
                    setTopNSelection(num === "all" ? "all" : (num as number))
                  }
                  sx={{
                    fontWeight: 600,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    bgcolor:
                      topNSelection === num
                        ? BRAND
                        : isDark
                          ? alpha("#fff", 0.05)
                          : alpha("#000", 0.05),
                    color: topNSelection === num ? "#000" : "text.primary",
                    border: "none",
                    "&:hover": {
                      bgcolor:
                        topNSelection === num
                          ? BRAND
                          : isDark
                            ? alpha("#fff", 0.1)
                            : alpha("#000", 0.1),
                    },
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box textAlign="right">
            <Typography
              variant="h3"
              fontWeight={800}
              color={BRAND}
              lineHeight={1}
            >
              {displayedChartData.length}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
              textTransform="uppercase"
            >
              Material Topics In View
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box sx={{ height: chartHeight, minWidth: 800 }}>
            {displayedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={displayedChartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  barSize={30}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={borderColor}
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    stroke="text.secondary"
                    fontSize={12}
                    domain={[0, 25]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="text.secondary"
                    fontSize={12}
                    width={250}
                    tickFormatter={(val) =>
                      val.length > 35 ? val.substring(0, 35) + "..." : val
                    }
                    tick={{ fill: theme.palette.text.secondary, fontSize: 13 }}
                  />
                  <RechartsTooltip
                    cursor={{
                      fill: isDark ? alpha("#fff", 0.05) : alpha("#000", 0.03),
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <Box
                            sx={{
                              bgcolor: "background.paper",
                              p: 1.5,
                              border: `1px solid ${borderColor}`,
                              borderRadius: 1.5,
                              boxShadow: 3,
                            }}
                          >
                            <Typography variant="subtitle2" fontWeight={700}>
                              {data.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {data.category} • {data.subcategory}
                            </Typography>
                            <Box
                              mt={1}
                              pt={1}
                              borderTop={`1px dashed ${borderColor}`}
                            >
                              <Box
                                display="flex"
                                justifyContent="space-between"
                              >
                                <Typography variant="caption">
                                  Heat Score:
                                </Typography>
                                <Typography variant="caption" fontWeight={700}>
                                  {data.heatScore} / 25
                                </Typography>
                              </Box>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                              >
                                <Typography variant="caption">
                                  Likelihood:
                                </Typography>
                                <Typography variant="caption" fontWeight={700}>
                                  {data.likelihood}
                                </Typography>
                              </Box>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                              >
                                <Typography variant="caption">
                                  Impact:
                                </Typography>
                                <Typography variant="caption" fontWeight={700}>
                                  {data.impact}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="heatScore" radius={[0, 4, 4, 0]}>
                    {displayedChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getRiskColor(entry.heatScore)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <Typography color="text.secondary">
                  No risk data available to visualize. Add risks to the register
                  first.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default MaterialityScoringPage;
