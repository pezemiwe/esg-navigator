import MaterialityLayout from "./layout/MaterialityLayout";
import { useMaterialityStore } from "@/store/materialityStore";
import { useState } from "react";
import type { SvgIconComponent } from "@mui/icons-material";
import {
  Box,
  Typography,
  Button,
  alpha,
  LinearProgress,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import {
  ArrowForward,
  CheckCircle,
  Warning as AlertIcon,
  HelpOutline,
  TrendingUp,
  AccountBalance,
  NaturePeople,
  Security,
  People,
  Gavel,
  VerifiedUser,
  Public,
  WaterDrop,
  Code,
  Paid,
  ExpandMore,
  Storage,
  InfoOutlined,
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DELOITTE_COLORS } from "@/config/colors.config";

const TOPIC_ICONS: Record<string, SvgIconComponent> = {
  sustainable_finance: Paid,
  climate_change: Public,
  esdd: Security,
  financial_inclusion: AccountBalance,
  corp_governance: Gavel,
  data_security: Code,
  energy_efficiency: TrendingUp,
  employee_welfare: People,
  community_engagement: NaturePeople,
  waste_management: WaterDrop,
  product_responsibility: VerifiedUser,
  supply_chain: TrendingUp,
};

export default function MaterialityProfiling() {
  const { topics, toggleTopic, addTopic, removeTopic } = useMaterialityStore();
  const navigate = useNavigate();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [newTopicMetrics, setNewTopicMetrics] = useState("");

  const handleAddTopic = () => {
    if (!newTopicName.trim()) return;
    const id = newTopicName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const metrics = newTopicMetrics
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    addTopic({
      id,
      name: newTopicName.trim(),
      description:
        newTopicDesc.trim() || `Custom topic: ${newTopicName.trim()}`,
      dataNeeds:
        metrics.length > 0
          ? metrics
          : ["Primary Metric", "Secondary Metric", "Target Value"],
      status: "required",
      selected: true,
      isCustom: true,
    });
    setNewTopicName("");
    setNewTopicDesc("");
    setNewTopicMetrics("");
    setAddDialogOpen(false);
  };

  const selectedCount = topics.filter((t) => t.selected).length;
  const progress = (selectedCount / topics.length) * 100;

  return (
    <MaterialityLayout>
      <Box sx={{ p: 5, maxWidth: "1200px", mx: "auto" }}>
        <Box
          sx={{
            mb: 4,
            bgcolor: "#000",
            borderRadius: "16px",
            p: 4,
            borderLeft: `6px solid ${DELOITTE_COLORS.primary.DEFAULT}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              rit: 0,
              bottom: 0,
              left: 0,
              opacity: 0.04,
              backgroundImage:
                "radial-gradient(circle at 90% 20%, #86BC25 0%, transparent 50%)",
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <Box
                  sx={{
                    bgcolor: DELOITTE_COLORS.primary.DEFAULT,
                    color: "#000",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "6px",
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  STEP 1 OF 3
                </Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: DELOITTE_COLORS.primary.DEFAULT,
                    letterSpacing: "0.2em",
                    fontWeight: 700,
                  }}
                >
                  Scope Definition
                </Typography>
              </Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  mb: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                Materiality Selection
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.6)", maxWidth: 600 }}
              >
                Enable the ESG topics that are strategically relevant to Deloitte
                Bank for the 2026 reporting cycle.
              </Typography>
            </Box>
            <Box sx={{ width: 260, textAlign: "right" }}>
              <Typography
                variant="h2"
                sx={{
                  color: DELOITTE_COLORS.primary.DEFAULT,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {selectedCount}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Topics Selected
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  mt: 2,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.1)",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: DELOITTE_COLORS.primary.DEFAULT,
                    borderRadius: 4,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.4)",
                  mt: 0.5,
                  display: "block",
                }}
              >
                {selectedCount} / {topics.length} topics
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              bgcolor: "#000",
              color: DELOITTE_COLORS.primary.DEFAULT,
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              "&:hover": { bgcolor: "#2D2D2D" },
            }}
          >
            Add Custom Topic
          </Button>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {topics.map((topic) => {
            const Icon = TOPIC_ICONS[topic.id] || HelpOutline;
            const isSelected = topic.selected;

            return (
              <Accordion
                key={topic.id}
                disableGutters
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: isSelected
                    ? alpha(DELOITTE_COLORS.primary.DEFAULT, 0.4)
                    : "rgba(0,0,0,0.08)",
                  borderRadius: "12px !important",
                  bgcolor: isSelected ? "white" : "#f8fafc",
                  transition: "all 0.3s ease",
                  "&:before": { display: "none" },
                  boxShadow: isSelected
                    ? `0 4px 12px ${alpha(DELOITTE_COLORS.primary.DEFAULT, 0.08)}`
                    : "none",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMore
                      sx={{
                        color: isSelected ? "text.secondary" : "text.disabled",
                      }}
                    />
                  }
                  sx={{
                    py: 1,
                    px: 3,
                    "& .MuiAccordionSummary-content": {
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "100%",
                    },
                  }}
                >
                  <Switch
                    checked={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTopic(topic.id);
                    }}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: DELOITTE_COLORS.primary.DEFAULT,
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: DELOITTE_COLORS.primary.DEFAULT,
                        },
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "8px",
                      bgcolor: isSelected
                        ? alpha(DELOITTE_COLORS.primary.DEFAULT, 0.1)
                        : "rgba(0,0,0,0.04)",
                      color: isSelected
                        ? DELOITTE_COLORS.primary.DEFAULT
                        : "#94a3b8",
                    }}
                  >
                    <Icon sx={{ fontSize: 24 }} />
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: isSelected ? "#2D2D2D" : "#64748b",
                        }}
                      >
                        {topic.name}
                      </Typography>
                      {topic.status === "data-driven" && (
                        <Tooltip title="Data Available">
                          <Chip
                            size="small"
                            icon={<CheckCircle style={{ fontSize: 14 }} />}
                            label="Data Ready"
                            sx={{
                              height: 20,
                              bgcolor: alpha(DELOITTE_COLORS.success, 0.1),
                              color: DELOITTE_COLORS.success,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                            }}
                          />
                        </Tooltip>
                      )}
                      {topic.status === "partial" && (
                        <Tooltip title="Partial Data">
                          <Chip
                            size="small"
                            icon={<AlertIcon style={{ fontSize: 14 }} />}
                            label="Partial Data"
                            sx={{
                              height: 20,
                              bgcolor: alpha(DELOITTE_COLORS.warning, 0.1),
                              color: "#d97706",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                            }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      alignItems: "center",
                      gap: 1,
                      color: "text.secondary",
                      mr: 2,
                    }}
                  >
                    <Storage sx={{ fontSize: 16, opacity: 0.6 }} />
                    <Typography variant="caption" fontWeight={600}>
                      {topic.dataNeeds.length} Metrics
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Divider sx={{ mb: 2, opacity: 0.5 }} />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { md: "1fr 1fr" },
                      gap: 4,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "#94a3b8",
                          letterSpacing: "0.05em",
                          mb: 1,
                          display: "block",
                        }}
                      >
                        DESCRIPTION
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#475569", lineHeight: 1.6 }}
                      >
                        {topic.description}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "#94a3b8",
                          letterSpacing: "0.05em",
                          mb: 1,
                          display: "block",
                        }}
                      >
                        DATA REQUIREMENTS
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {topic.dataNeeds.map((need, i) => (
                          <Chip
                            key={i}
                            label={need}
                            size="small"
                            sx={{
                              bgcolor: "white",
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {topic.isCustom && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => removeTopic(topic.id)}
                        sx={{ textTransform: "none" }}
                      >
                        Remove Topic
                      </Button>
                    )}
                    <Box sx={{ flex: 1 }} />
                    <Button
                      size="small"
                      startIcon={<InfoOutlined />}
                      sx={{ color: "#64748b", textTransform: "none" }}
                    >
                      View Framework Guidelines
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>

        <Box
          sx={{
            mt: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/modules")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 600,
              borderColor: "#cbd5e1",
              color: "#64748b",
              textTransform: "none",
              "&:hover": {
                borderColor: DELOITTE_COLORS.primary.DEFAULT,
                color: DELOITTE_COLORS.primary.DEFAULT,
              },
            }}
          >
            Back to Modules
          </Button>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            onClick={() => navigate("/materiality/data-input")}
            disabled={selectedCount === 0}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 700,
              bgcolor: DELOITTE_COLORS.primary.DEFAULT,
              color: "#000",
              textTransform: "none",
              boxShadow: `0 4px 14px -3px ${alpha(DELOITTE_COLORS.primary.DEFAULT, 0.5)}`,
              "&:hover": {
                bgcolor: "#e0a20f",
                transform: "translateY(-1px)",
                boxShadow: `0 8px 20px -3px ${alpha(DELOITTE_COLORS.primary.DEFAULT, 0.5)}`,
              },
              "&:disabled": { bgcolor: "#e0e0e0", color: "#9e9e9e" },
            }}
          >
            Proceed to Data Input
          </Button>
        </Box>

        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 700,
            }}
          >
            Add Custom ESG Topic
            <IconButton onClick={() => setAddDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
            >
              <TextField
                label="Topic Name"
                placeholder="e.g. Water Stewardship"
                fullWidth
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                required
              />
              <TextField
                label="Description"
                placeholder="Describe the topic's relevance to Deloitte..."
                fullWidth
                multiline
                rows={3}
                value={newTopicDesc}
                onChange={(e) => setNewTopicDesc(e.target.value)}
              />
              <TextField
                label="Metrics / Data Needs (comma-separated)"
                placeholder="e.g. Water Usage, Recycling Rate, Waste Volume"
                fullWidth
                value={newTopicMetrics}
                onChange={(e) => setNewTopicMetrics(e.target.value)}
                helperText="Enter the metric names separated by commas. These will become the data input fields."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setAddDialogOpen(false)}
              sx={{ textTransform: "none", color: "#64748b" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddTopic}
              disabled={!newTopicName.trim()}
              sx={{
                bgcolor: DELOITTE_COLORS.primary.DEFAULT,
                color: "#000",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#e0a20f" },
              }}
            >
              Add Topic
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </MaterialityLayout>
  );
}
