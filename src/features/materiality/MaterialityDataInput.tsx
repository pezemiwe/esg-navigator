import React, { useState } from "react";
import MaterialityLayout from "./layout/MaterialityLayout";
import { useMaterialityStore } from "@/store/materialityStore";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  TablePagination,
} from "@mui/material";
import {
  Save as SaveIcon,
  FileDownload as FileDownIcon,
  ErrorOutline as AlertCircleIcon,
  ArrowForward as ArrowRightIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { SFI_DATA } from "./data/sfiData";

import { MenuItem, Select, FormControl } from "@mui/material";

export default function MaterialityDataInput() {
  const { topics, inputs, updateInput, currentUser, setUser } =
    useMaterialityStore();
  const navigate = useNavigate();

  // Filter topics based on role
  const selectedTopics = topics.filter((t) => {
    if (!t.selected) return false;
    // Head sees everything
    if (currentUser.role === "Head_Sustainability") return true;
    // Others see only assigned
    return t.assignedUserId === currentUser.id;
  });

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentTopic = selectedTopics[activeTab];

  if (selectedTopics.length === 0) {
    return (
      <MaterialityLayout>
        <Box p={4} textAlign="center">
          <Typography variant="h5" color="error" gutterBottom>
            {currentUser.role === "Head_Sustainability"
              ? "No topics selected in scope for this assessment."
              : "You have not been assigned any material topics yet."}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Please contact the Head of Sustainability or check the Profiling
            page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/materiality/profiling")}
            sx={{ borderRadius: 1.5, bgcolor: "#000" }}
          >
            Back to Profiling
          </Button>
        </Box>
      </MaterialityLayout>
    );
  }

  const handleInputChange = (metric: string, field: string, value: string) => {
    const id = `${currentTopic.id}-${metric}`;
    const existing = inputs.find((i) => i.id === id) || {
      id,
      topicId: currentTopic.id,
      metric,
      value: "",
      unit: "",
      period: "FY 2025",
      notes: "",
    };

    updateInput({ ...existing, [field]: value });
  };

  const getValue = (metric: string, field: string) => {
    const id = `${currentTopic.id}-${metric}`;
    const input = inputs.find((i) => i.id === id);
    // @ts-expect-error - TypeScript doesn't know the dynamic field access, but we do
    return input ? input[field] : field === "period" ? "FY 2025" : "";
  };

  const isSfi = currentTopic?.id === "sustainable_finance";

  return (
    <MaterialityLayout>
      {/* Role Switcher for Demo */}
      <Box sx={{ position: "fixed", bottom: 20, left: 20, zIndex: 9999 }}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography
            variant="caption"
            display="block"
            mb={1}
            fontWeight="bold"
          >
            DEMO: Switch User Role
          </Typography>
          <FormControl size="small" fullWidth>
            <Select
              value={currentUser.id}
              onChange={(e) => setUser(e.target.value)}
            >
              <MenuItem value="u1">Head (Dr. A)</MenuItem>
              <MenuItem value="u2">Manager (John - IT)</MenuItem>
              <MenuItem value="u3">Manager (Sarah - Facilities)</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </Box>

      <Box p={4} maxWidth="1400px" mx="auto" width="100%">
        <Box
          sx={{
            mb: 4,
            bgcolor: "#000",
            borderRadius: "16px",
            p: 4,
            borderLeft: "6px solid #86BC25",
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
              alignItems: "center",
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
                    bgcolor: "#86BC25",
                    color: "#000",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "6px",
                    fontWeight: 800,
                    fontSize: "0.7rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  STEP 2 OF 3
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
                ESG Data Input Sheet
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.6)", mt: 1 }}
              >
                Collect quantitative evidence for each selected material topic.
              </Typography>
            </Box>
            <Box display="flex" gap={2}>
              <Button
                startIcon={<FileDownIcon sx={{ fontSize: 18 }} />}
                variant="outlined"
                sx={{
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.7)",
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { borderColor: "#86BC25", color: "#86BC25" },
                }}
              >
                Import Template
              </Button>
              <Button
                startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
                variant="contained"
                sx={{
                  bgcolor: "#86BC25",
                  color: "#000",
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#e0a20f" },
                }}
              >
                Save Draft
              </Button>
            </Box>
          </Box>
        </Box>

        <Paper variant="outlined" sx={{ mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider", px: 2, pt: 2 }}
          >
            {selectedTopics.map((topic) => (
              <Tab
                key={topic.id}
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    {topic.name}
                    {topic.status === "data-driven" && (
                      <Box
                        width={6}
                        height={6}
                        borderRadius="50%"
                        bgcolor="success.main"
                      />
                    )}
                    {topic.status === "partial" && (
                      <Box
                        width={6}
                        height={6}
                        borderRadius="50%"
                        bgcolor="warning.main"
                      />
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>

          <Box p={3}>
            {isSfi ? (
              <Box>
                <Box
                  mb={3}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  bgcolor="success.50"
                  p={2}
                  borderRadius={1}
                  color="success.900"
                  border="1px solid"
                  borderColor="success.200"
                >
                  <CheckCircleIcon color="success" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Data Uploaded Successfully
                    </Typography>
                    <Typography variant="caption">
                      Verified transaction data for Sustainable Finance
                      portfolio (FY 2025).
                    </Typography>
                  </Box>
                </Box>

                <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
                  <Table stickyHeader size="small" sx={{ minWidth: 2000 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          Deal ID
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          Client
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          Country
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          Sector
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          Financing Type
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }} align="right">
                          Amount (USD)
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          Maturity
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          ESG Category
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          Use of Proceeds
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }} align="right">
                          Outstanding
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }} align="right">
                          tCO2e Avoided
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }} align="right">
                          Jobs Created
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }} align="right">
                          SMEs
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          Monitoring
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          Risk
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(rowsPerPage > 0
                        ? SFI_DATA.slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage,
                          )
                        : SFI_DATA
                      ).map((row, index) => (
                        <TableRow key={`${row.Deal_ID}-${index}`} hover>
                          <TableCell
                            sx={{
                              fontFamily: "monospace",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.Deal_ID}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {row.Client_Name}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {row.Country}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {row.Sector}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {row.Financing_Type}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            })
                              .format(row.Deal_Amount_USD)
                              .replace("$", "")}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {row.Maturity}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <Chip
                              label={row.ESG_Category}
                              size="small"
                              color={
                                row.ESG_Category.includes("Green")
                                  ? "success"
                                  : "primary"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {row.Use_of_Proceeds}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              maximumFractionDigits: 0,
                            })
                              .format(row.Outstanding_Amount)
                              .replace("$", "")}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {row.tCO2e_Avoided?.toLocaleString()}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {row.Jobs_Created?.toLocaleString()}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {row.SMEs_Supported?.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            {row.Monitoring_Status}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>
                            <Chip
                              label={row.Risk}
                              size="small"
                              sx={{
                                bgcolor: row.Risk.includes("Low")
                                  ? "#e6f4ea"
                                  : row.Risk.includes("Moderate")
                                    ? "#fce8b2"
                                    : "#fce8e6",
                                color: row.Risk.includes("Low")
                                  ? "#137333"
                                  : row.Risk.includes("Moderate")
                                    ? "#b06000"
                                    : "#c5221f",
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={SFI_DATA.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            ) : (
              <Box>
                <Box
                  mb={3}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  bgcolor="blue.50"
                  p={2}
                  borderRadius={1}
                  color="blue.900"
                >
                  <AlertCircleIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2" fontWeight="medium">
                    Please provide data for FY 2025 where available. Use "Notes"
                    for any estimations or data gaps.
                  </Typography>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width="30%">Metric / Indicator</TableCell>
                        <TableCell width="20%">Value</TableCell>
                        <TableCell width="15%">Unit</TableCell>
                        <TableCell width="15%">Period</TableCell>
                        <TableCell width="20%">Notes & Source</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentTopic.dataNeeds.map((metric) => (
                        <TableRow key={metric}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {metric}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Enter value..."
                              value={getValue(metric, "value")}
                              onChange={(e) =>
                                handleInputChange(
                                  metric,
                                  "value",
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="e.g. S, tCO2e"
                              value={getValue(metric, "unit")}
                              onChange={(e) =>
                                handleInputChange(
                                  metric,
                                  "unit",
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={getValue(metric, "period")}
                              onChange={(e) =>
                                handleInputChange(
                                  metric,
                                  "period",
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              rows={1}
                              placeholder="Add notes..."
                              value={getValue(metric, "notes")}
                              onChange={(e) =>
                                handleInputChange(
                                  metric,
                                  "notes",
                                  e.target.value,
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </Paper>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/materiality/profiling")}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 1.5,
              fontSize: "0.95rem",
              fontWeight: 600,
              borderColor: "#cbd5e1",
              color: "#64748b",
              textTransform: "none",
              "&:hover": { borderColor: "#86BC25", color: "#86BC25" },
            }}
          >
            Back to Profiling
          </Button>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowRightIcon />}
            onClick={() => navigate("/materiality")}
            sx={{
              px: 5,
              py: 1.5,
              borderRadius: 1.5,
              fontSize: "0.95rem",
              fontWeight: 700,
              bgcolor: "#86BC25",
              color: "black",
              textTransform: "none",
              boxShadow: "0 4px 14px -3px rgba(253,185,19,0.5)",
              "&:hover": {
                bgcolor: "#e0a20f",
                transform: "translateY(-1px)",
                boxShadow: "0 8px 20px -3px rgba(253,185,19,0.5)",
              },
            }}
          >
            Generate Topic Dashboards
          </Button>
        </Box>
      </Box>
    </MaterialityLayout>
  );
}
