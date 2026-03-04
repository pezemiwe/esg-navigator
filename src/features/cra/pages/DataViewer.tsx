import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  alpha,
  useTheme,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import {
  ArrowLeft,
  Download,
  Search,
  FileSpreadsheet,
  TrendingUp,
} from "lucide-react";
import CRALayout from "../layout/CRALayout";
import { useCRADataStore } from "@/store/craStore";
import { formatColumnHeader } from "../utils/craUtils";
import { useIndustry } from "@/hooks/useIndustry";

interface DataRow {
  [key: string]: string | number;
}

const assetTypeNames: Record<string, string> = {
  loans_advances: "Loans & Advances",
  equities: "Equity Securities",
  bonds_fixed_income: "Fixed Income Securities",
  derivatives: "Derivative Instruments",
  guarantees_obs: "Off-Balance Sheet Exposures",
  other_asset_1: "Other Asset 1",
  other_asset_2: "Other Asset 2",
  other_asset_3: "Other Asset 3",
  other_asset_4: "Other Asset 4",
  other_asset_5: "Other Asset 5",
  other_asset_6: "Other Asset 6",
  other_asset_7: "Other Asset 7",
  other_asset_8: "Other Asset 8",
  other_asset_9: "Other Asset 9",
  other_asset_10: "Other Asset 10",
};

const DataViewer: React.FC = () => {
  const { assetTypeId } = useParams<{ assetTypeId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { getAssetData } = useCRADataStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");

  const assetData = useMemo(() => {
    if (!assetTypeId) return null;
    return getAssetData(assetTypeId);
  }, [assetTypeId, getAssetData]);

  const tableData = useMemo<DataRow[]>(() => {
    if (assetData && assetData.data.length > 0) {
      return assetData.data as DataRow[];
    }
    return [];
  }, [assetData]);

  const assetName = assetTypeNames[assetTypeId || ""] || "Asset Data";

  const filteredData = tableData.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];
  const { config: industryConfig } = useIndustry();
  const isTelecom = industryConfig.id === "telecommunications";
  const hiddenKeys = isTelecom
    ? ["outstandingBalance", "borrowerName", "currency", "facilityId", "maturityDate"]
    : [];
  const visibleColumns = columns.filter((c) => !hiddenKeys.includes(c));

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleBack = () => {
    navigate("/cra/data");
  };

  const handleUseCRAOverview = () => {
    navigate("/dashboard");
  };

  const handleDownloadData = () => {
    console.log("Downloading data...");
  };

  return (
    <CRALayout>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: isDark ? "#0A0E1A" : "#F8FAFC",
          py: { xs: 3, md: 4 },
          px: { xs: 2, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: "1600px", mx: "auto" }}>
          <Stack spacing={4}>
            <Box>
              <Breadcrumbs
                sx={{
                  mb: 2,
                  "& .MuiBreadcrumbs-separator": {
                    color: isDark ? alpha("#FFFFFF", 0.5) : "#64748B",
                  },
                }}
              >
                <MuiLink
                  onClick={() => navigate("/cra/dashboard")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                    cursor: "pointer",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: "#86BC25",
                    },
                  }}
                >
                  CRA
                </MuiLink>
                <MuiLink
                  onClick={() => navigate("/cra/data")}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                    cursor: "pointer",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    "&:hover": {
                      color: "#86BC25",
                    },
                  }}
                >
                  Data Upload
                </MuiLink>
                <Typography
                  sx={{
                    color: "#86BC25",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {assetName}
                </Typography>
              </Breadcrumbs>

              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mb={1}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      p: 1.5,
                      backgroundColor: alpha("#86BC25", 0.12),
                      borderRadius: 2,
                      display: "flex",
                    }}
                  >
                    <FileSpreadsheet
                      size={28}
                      color="#86BC25"
                      strokeWidth={2.5}
                    />
                  </Box>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: isDark ? "#FFFFFF" : "#1D1D1D",
                        fontSize: { xs: "1.75rem", md: "2.25rem" },
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {assetName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.875rem", md: "1rem" },
                        color: isDark ? alpha("#FFFFFF", 0.65) : "#64748B",
                        mt: 0.5,
                      }}
                    >
                      {filteredData.length.toLocaleString()} records · Last
                      updated:{" "}
                      {assetData?.uploadedAt
                        ? new Date(assetData.uploadedAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowLeft size={18} />}
                    onClick={handleBack}
                    sx={{
                      borderColor: isDark ? alpha("#334155", 0.7) : "#CBD5E1",
                      color: isDark ? "#94A3B8" : "#475569",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 1.5,
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#86BC25",
                        color: "#86BC25",
                        backgroundColor: alpha("#86BC25", 0.08),
                      },
                    }}
                  >
                    Back to Upload
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<TrendingUp size={18} />}
                    onClick={handleUseCRAOverview}
                    sx={{
                      backgroundColor: "#86BC25",
                      color: "#1D1D1D",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      px: 2,
                      py: 1,
                      borderRadius: 1.5,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#F59E0B",
                      },
                    }}
                  >
                    Use in CRA
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Paper
              elevation={0}
              sx={{
                backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                border: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
                borderRadius: 2.5,
                p: 3,
              }}
            >
              <Stack spacing={3}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ flexShrink: 0 }}
                >
                  <TextField
                    placeholder="Search data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <Search
                          size={20}
                          style={{
                            color: isDark ? "#64748B" : "#94A3B8",
                            marginRight: 12,
                          }}
                        />
                      ),
                    }}
                    sx={{
                      width: 400,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: isDark ? "#0A0E1A" : "#F8FAFC",
                        borderRadius: 1.5,
                        fontSize: "0.9375rem",
                        "& fieldset": {
                          borderColor: isDark
                            ? alpha("#334155", 0.5)
                            : "#CBD5E1",
                        },
                        "&:hover fieldset": {
                          borderColor: isDark ? "#475569" : "#94A3B8",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#86BC25",
                          borderWidth: "2px",
                        },
                        "& input": {
                          color: isDark ? "#FFFFFF" : "#1D1D1D",
                          py: 1.5,
                        },
                      },
                    }}
                  />

                  <Button
                    variant="outlined"
                    startIcon={<Download size={18} />}
                    onClick={handleDownloadData}
                    sx={{
                      borderColor: isDark ? alpha("#334155", 0.7) : "#CBD5E1",
                      color: isDark ? "#94A3B8" : "#475569",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      px: 2,
                      py: 1,
                      borderRadius: 1.5,
                      textTransform: "none",
                    }}
                  >
                    Export Data
                  </Button>
                </Stack>

                {tableData.length === 0 ? (
                  <Box
                    sx={{
                      py: 12,
                      textAlign: "center",
                      borderRadius: 1.5,
                      backgroundColor: isDark ? "#0A0E1A" : "#F8FAFC",
                      border: `2px dashed ${isDark ? alpha("#334155", 0.5) : "#CBD5E1"}`,
                    }}
                  >
                    <Stack spacing={3} alignItems="center">
                      <Box
                        sx={{
                          p: 3,
                          backgroundColor: alpha("#64748B", 0.1),
                          borderRadius: "50%",
                          display: "flex",
                        }}
                      >
                        <FileSpreadsheet
                          size={48}
                          color="#64748B"
                          strokeWidth={1.5}
                        />
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: isDark ? "#FFFFFF" : "#1D1D1D",
                            mb: 1,
                          }}
                        >
                          No Data Available
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.9375rem",
                            color: isDark ? alpha("#FFFFFF", 0.65) : "#64748B",
                            maxWidth: 400,
                            mx: "auto",
                          }}
                        >
                          Upload a CSV file for this asset type to view the data
                          here. Click "Back to Upload" to add data.
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<ArrowLeft size={18} />}
                        onClick={handleBack}
                        sx={{
                          backgroundColor: "#86BC25",
                          color: "#1D1D1D",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          px: 3,
                          py: 1.25,
                          borderRadius: 1.5,
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: "#F59E0B",
                          },
                        }}
                      >
                        Back to Upload
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <>
                    <TableContainer
                      sx={{
                        overflowX: "auto",
                        border: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
                        borderRadius: 1.5,
                        backgroundColor: isDark ? "#0A0E1A" : "#F8FAFC",
                        "&::-webkit-scrollbar": {
                          width: 10,
                          height: 10,
                        },
                        "&::-webkit-scrollbar-track": {
                          background: isDark ? "#0F1623" : "#F1F5F9",
                          borderRadius: 4,
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: isDark ? "#334155" : "#CBD5E1",
                          borderRadius: 4,
                          "&:hover": {
                            background: isDark ? "#475569" : "#94A3B8",
                          },
                        },
                      }}
                    >
                      <Table
                        sx={{
                          minWidth: "100%",
                          width: "100%",
                          tableLayout: "auto",
                          "& .MuiTableCell-root": {
                            whiteSpace: "normal",
                            wordWrap: "break-word",
                            px: 3,
                            py: 2,
                            borderRight: `1px solid ${isDark ? alpha("#334155", 0.3) : "#E2E8F0"}`,
                            "&:last-child": {
                              borderRight: "none",
                            },
                          },
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            {visibleColumns.map((column) => (
                              <TableCell
                                key={column}
                                sx={{
                                  fontWeight: 700,
                                  backgroundColor: isDark
                                    ? "#0F1623"
                                    : "#F1F5F9",
                                  color: isDark ? "#FFFFFF" : "#1D1D1D",
                                  borderBottom: `2px solid ${isDark ? "#2D2D2D" : "#CBD5E1"}`,
                                  textTransform: "uppercase",
                                  fontSize: "0.8125rem",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                {formatColumnHeader(column)}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedData.map((row, index) => (
                            <TableRow
                              key={index}
                              sx={{
                                "&:hover": {
                                  backgroundColor: isDark
                                    ? alpha("#2D2D2D", 0.7)
                                    : alpha("#F1F5F9", 0.9),
                                },
                                borderBottom: `1px solid ${isDark ? alpha("#334155", 0.3) : "#E2E8F0"}`,
                                "&:last-child": {
                                  borderBottom: "none",
                                },
                              }}
                            >
                              {visibleColumns.map((column) => (
                                <TableCell
                                  key={column}
                                  sx={{
                                    color: isDark
                                      ? alpha("#FFFFFF", 0.9)
                                      : "#1D1D1D",
                                    fontSize: "0.9375rem",
                                    fontWeight:
                                      column === "exposure" ? 600 : 400,
                                    backgroundColor: isDark
                                      ? "#0A0E1A"
                                      : "#FFFFFF",
                                  }}
                                >
                                  {column === "exposure" ||
                                  column === "outstandingBalance" ||
                                  column === "Net Book Value" ||
                                  column === "Book Value"
                                    ? `₦${Number(row[column]).toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        },
                                      )}`
                                    : String(row[column])}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box
                      sx={{
                        borderTop: `1px solid ${isDark ? alpha("#334155", 0.5) : "#E2E8F0"}`,
                        pt: 2,
                      }}
                    >
                      <TablePagination
                        component="div"
                        count={filteredData.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        sx={{
                          color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                          "& .MuiTablePagination-select": {
                            color: isDark ? "#FFFFFF" : "#1D1D1D",
                            fontWeight: 600,
                          },
                          "& .MuiTablePagination-selectIcon": {
                            color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                          },
                          "& .MuiTablePagination-actions": {
                            "& button": {
                              color: isDark ? "#FFFFFF" : "#1D1D1D",
                            },
                          },
                          "& .MuiTablePagination-displayedRows": {
                            fontWeight: 600,
                            color: isDark ? "#FFFFFF" : "#1D1D1D",
                          },
                        }}
                      />
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>
    </CRALayout>
  );
};

export default DataViewer;
