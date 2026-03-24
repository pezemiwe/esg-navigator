import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Grid,
  Alert,
  Checkbox,
  FormControlLabel,
  alpha,
  useTheme,
  Collapse,
} from "@mui/material";
import { useState } from "react";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { ALL_21_RISKS } from "../../domain/physicalRisk/constants";
import { suggestRisksForAsset } from "../../domain/physicalRisk/engine";
import type { RiskCategory } from "../../domain/physicalRisk/types";

const RISK_CAT_COLORS: Record<string, string> = {
  Meteorological: "#F59E0B",
  Hydrological: "#3B82F6",
  Climatological: "#10B981",
  Geophysical: "#8B5CF6",
};

const CATEGORIES: RiskCategory[] = [
  "Meteorological",
  "Hydrological",
  "Climatological",
  "Geophysical",
];

export default function StepRiskIdentification() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { mappedAssets, identifiedRisks, setIdentifiedRisks } =
    usePhysicalRiskStore();
  const [expandedCat, setExpandedCat] = useState<string | null>(
    "Meteorological",
  );

  const cardBg = isDark ? alpha("#0F1623", 0.85) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08);

  const toggleRisk = (riskName: string) => {
    setIdentifiedRisks(
      identifiedRisks.includes(riskName)
        ? identifiedRisks.filter((r) => r !== riskName)
        : [...identifiedRisks, riskName],
    );
  };

  const handleAutoSuggest = () => {
    if (mappedAssets.length === 0) return;
    const avgLat =
      mappedAssets.reduce((s, a) => s + a.latitude, 0) / mappedAssets.length;
    const avgLon =
      mappedAssets.reduce((s, a) => s + a.longitude, 0) / mappedAssets.length;
    const suggested = suggestRisksForAsset(avgLat, avgLon);
    setIdentifiedRisks(suggested);
  };

  const handleSelectAll = () =>
    setIdentifiedRisks(ALL_21_RISKS.map((r) => r.risk));
  const handleClearAll = () => setIdentifiedRisks([]);

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #1B3A5C 0%, #0F1623 100%)",
          color: "#fff",
          border: `1px solid ${alpha("#fff", 0.1)}`,
          borderRadius: 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha("#fff", 0.1),
              display: "flex",
            }}
          >
            <Zap size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Risk Identification
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Select the physical climate risks relevant to your portfolio. Use
              auto-suggest to identify risks based on asset locations.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Action buttons */}
      <Paper
        sx={{
          p: 2,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            startIcon={<Zap size={14} />}
            onClick={handleAutoSuggest}
            disabled={mappedAssets.length === 0}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
            }}
          >
            Auto-Suggest from Locations
          </Button>
          <Button variant="outlined" onClick={handleSelectAll}>
            Select All 21
          </Button>
          <Button variant="outlined" color="error" onClick={handleClearAll}>
            Clear All
          </Button>
          <Box sx={{ flex: 1 }} />
          <Chip
            label={`${identifiedRisks.length} / 21 risks selected`}
            color={identifiedRisks.length > 0 ? "success" : "default"}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      {mappedAssets.length === 0 && (
        <Alert severity="warning">
          Upload assets first to enable auto-suggestion based on geographic
          location.
        </Alert>
      )}

      {/* Risk categories */}
      {CATEGORIES.map((cat) => {
        const catRisks = ALL_21_RISKS.filter((r) => r.category === cat);
        const selectedCount = catRisks.filter((r) =>
          identifiedRisks.includes(r.risk),
        ).length;
        const catColor = RISK_CAT_COLORS[cat];
        const isExpanded = expandedCat === cat;

        return (
          <Paper
            key={cat}
            sx={{
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              onClick={() => setExpandedCat(isExpanded ? null : cat)}
              sx={{
                p: 2,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderLeft: `4px solid ${catColor}`,
                "&:hover": { bgcolor: alpha(catColor, 0.04) },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>
                  {cat}
                </Typography>
                <Chip
                  label={`${selectedCount}/${catRisks.length}`}
                  size="small"
                  sx={{
                    bgcolor: alpha(catColor, 0.12),
                    color: catColor,
                    fontWeight: 600,
                  }}
                />
              </Stack>
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </Box>
            <Collapse in={isExpanded}>
              <Box sx={{ px: 2, pb: 2 }}>
                <Grid container spacing={1.5}>
                  {catRisks.map((risk) => {
                    const isSelected = identifiedRisks.includes(risk.risk);
                    return (
                      <Grid size={{ xs: 12, md: 6 }} key={risk.id}>
                        <Paper
                          sx={{
                            p: 1.5,
                            border: `1px solid ${isSelected ? catColor : borderColor}`,
                            bgcolor: isSelected
                              ? alpha(catColor, 0.06)
                              : "transparent",
                            borderRadius: 1.5,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            "&:hover": {
                              borderColor: catColor,
                              bgcolor: alpha(catColor, 0.04),
                            },
                          }}
                          onClick={() => toggleRisk(risk.risk)}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isSelected}
                                  size="small"
                                  sx={{
                                    color: catColor,
                                    "&.Mui-checked": { color: catColor },
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={() => toggleRisk(risk.risk)}
                                />
                              }
                              label=""
                              sx={{ m: 0, mr: -1 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {risk.risk}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ lineHeight: 1.3 }}
                              >
                                {risk.definition}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
}
