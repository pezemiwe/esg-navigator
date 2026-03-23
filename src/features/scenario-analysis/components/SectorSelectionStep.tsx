import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Button,
  Chip,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
  Collapse,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  SECTORS,
  type SectorConfig,
} from "@/features/scenario-analysis/data/sectorConfig";

interface SectorSelectionProps {
  onNext: () => void;
  onBack: () => void;
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "#10B981",
  moderate: "#F59E0B",
  high: "#EF4444",
  critical: "#7C2D12",
};

function getSectorRiskLevel(sector: SectorConfig): {
  label: string;
  color: string;
} {
  const s = sector.sensitivities;
  const score =
    Math.abs(s.revenueToCarbonPrice) * 10000 +
    Math.abs(s.revenueToPhysical) * 10 +
    s.costOfEquitySensitivity / 20;
  if (score > 8) return { label: "Critical", color: SEVERITY_COLORS.critical };
  if (score > 4) return { label: "High", color: SEVERITY_COLORS.high };
  if (score > 2) return { label: "Moderate", color: SEVERITY_COLORS.moderate };
  return { label: "Low", color: SEVERITY_COLORS.low };
}

export default function SectorSelection({
  onNext,
  onBack,
  selectedSectorId,
  onSelectSector,
}: SectorSelectionProps) {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSector, setExpandedSector] = useState<string | null>(null);

  const filteredSectors = SECTORS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subSectors.some((sub) =>
        sub.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const selectedSector = SECTORS.find((s) => s.id === selectedSectorId);

  return (
    <Box maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Select Industry Sector
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Choose the primary sector for this climate scenario analysis. Sector
          selection determines sector-specific sensitivity coefficients,
          financial profile baselines, and the transmission channels through
          which climate shocks propagate.
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Info size={14} color={theme.palette.text.secondary} />
          <Typography variant="caption" color="text.secondary">
            Each sector has calibrated betas based on NGFS Phase IV pathways and
            TCFD disclosure frameworks.
          </Typography>
        </Stack>
      </Box>

      <TextField
        fullWidth
        placeholder="Search sectors by name, description, or sub-sector..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        size="small"
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color={theme.palette.text.secondary} />
            </InputAdornment>
          ),
        }}
      />

      {selectedSector && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: "12px",
            border: `2px solid ${DELOITTE_COLORS.green.DEFAULT}`,
            bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.04),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "10px",
                bgcolor: alpha(selectedSector.color, 0.12),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={22} color={selectedSector.color} />
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                Selected: {selectedSector.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedSector.subSectors.join(" · ")}
              </Typography>
            </Box>
            <CheckCircle2 size={24} color={DELOITTE_COLORS.green.DEFAULT} />
          </Stack>
        </Paper>
      )}

      <Grid container spacing={2}>
        {filteredSectors.map((sector) => {
          const isSelected = sector.id === selectedSectorId;
          const isExpanded = expandedSector === sector.id;
          const risk = getSectorRiskLevel(sector);

          return (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={sector.id}>
              <Paper
                elevation={0}
                onClick={() => onSelectSector(sector.id)}
                sx={{
                  p: 2.5,
                  height: "100%",
                  borderRadius: "12px",
                  border: isSelected
                    ? `2px solid ${DELOITTE_COLORS.green.DEFAULT}`
                    : `1px solid ${theme.palette.divider}`,
                  bgcolor: isSelected
                    ? alpha(DELOITTE_COLORS.green.DEFAULT, 0.03)
                    : theme.palette.background.paper,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: isSelected
                      ? DELOITTE_COLORS.green.DEFAULT
                      : sector.color,
                    boxShadow: `0 4px 16px ${alpha(sector.color, 0.12)}`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "10px",
                          bgcolor: alpha(sector.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Building2 size={20} color={sector.color} />
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{ lineHeight: 1.3 }}
                        >
                          {sector.name}
                        </Typography>
                      </Box>
                    </Stack>
                    {isSelected && (
                      <CheckCircle2
                        size={20}
                        color={DELOITTE_COLORS.green.DEFAULT}
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      lineHeight: 1.5,
                    }}
                  >
                    {sector.description}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Tooltip title="Climate Risk Exposure Level">
                      <Chip
                        label={`Risk: ${risk.label}`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          bgcolor: alpha(risk.color, 0.1),
                          color: risk.color,
                          border: `1px solid ${alpha(risk.color, 0.3)}`,
                        }}
                      />
                    </Tooltip>
                    <Chip
                      label={`${sector.subSectors.length} sub-sectors`}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        bgcolor: alpha(theme.palette.text.secondary, 0.08),
                        color: theme.palette.text.secondary,
                      }}
                    />
                  </Stack>

                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedSector(isExpanded ? null : sector.id);
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      cursor: "pointer",
                      color: theme.palette.text.secondary,
                      "&:hover": { color: sector.color },
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      {isExpanded ? "Hide" : "View"} Sub-sectors
                    </Typography>
                    {isExpanded ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </Box>

                  <Collapse in={isExpanded}>
                    <Divider sx={{ mb: 1 }} />
                    <Stack spacing={0.5}>
                      {sector.subSectors.map((sub) => (
                        <Typography
                          key={sub}
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            pl: 1,
                            borderLeft: `2px solid ${alpha(sector.color, 0.3)}`,
                          }}
                        >
                          {sub}
                        </Typography>
                      ))}
                    </Stack>
                    <Divider sx={{ mt: 1.5, mb: 1 }} />
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Key Sensitivities
                    </Typography>
                    <Grid container spacing={0.5}>
                      {[
                        {
                          label: "Carbon β",
                          value: `${(sector.sensitivities.revenueToCarbonPrice * 10000).toFixed(1)} bps`,
                        },
                        {
                          label: "GDP β",
                          value: `${sector.sensitivities.revenueToGDP.toFixed(2)}x`,
                        },
                        {
                          label: "CoE Δ",
                          value: `${sector.sensitivities.costOfEquitySensitivity} bps`,
                        },
                        {
                          label: "PPE Vuln",
                          value: `${(sector.sensitivities.ppePhysicalVulnerability * 100).toFixed(0)}%`,
                        },
                      ].map((item) => (
                        <Grid size={{ xs: 6 }} key={item.label}>
                          <Box
                            sx={{
                              p: 0.5,
                              borderRadius: 0.5,
                              bgcolor: alpha(sector.color, 0.04),
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.6rem" }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              display="block"
                              sx={{ fontSize: "0.7rem" }}
                            >
                              {item.value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Collapse>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {filteredSectors.length === 0 && (
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Typography color="text.secondary">
            No sectors match "{searchQuery}". Try a different search term.
          </Typography>
        </Paper>
      )}

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: 4, mb: 2 }}
      >
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={onBack}
          sx={{ color: theme.palette.text.secondary }}
        >
          Back to Portfolio
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          endIcon={<ArrowRight size={18} />}
          disabled={!selectedSectorId}
          sx={{
            bgcolor: DELOITTE_COLORS.green.DEFAULT,
            color: "#000",
            fontWeight: 700,
            px: 4,
            "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
            "&.Mui-disabled": {
              bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.3),
            },
          }}
        >
          Continue to Scenario Definition
        </Button>
      </Box>
    </Box>
  );
}
