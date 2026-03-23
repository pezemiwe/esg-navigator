import {
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
  alpha,
  Button,
  Divider,
} from "@mui/material";
import DashboardNavbar from "@/components/layout/DashboardNavbar/DashboardNavbar";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DELOITTE_COLORS } from "@/config/colors.config";

const recentReports = [
  {
    title: "Q4 2025 Climate Risk Assessment",
    date: "Jan 15, 2026",
    type: "Quarterly",
    status: "Finalized",
  },
  {
    title: "Portfolio Segmentation Analysis",
    date: "Dec 20, 2025",
    type: "Ad-hoc",
    status: "Draft",
  },
];

export default function ReportsPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pt: "70px" }}>
      <DashboardNavbar />
      <Box sx={{ p: 4, maxWidth: 1600, mx: "auto" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Reporting Center
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Generate and manage regulatory and internal reports
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<FileText size={18} />}
            onClick={() => navigate("/cra/reporting")}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              color: "#FFF",
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
            }}
          >
            Create New Report
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
              elevation={0}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Recent Reports
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentReports.map((report, index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            bgcolor: "background.paper",
                            borderRadius: 1,
                          }}
                        >
                          <FileText
                            size={20}
                            color={DELOITTE_COLORS.slate.DEFAULT}
                          />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {report.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {report.date} • {report.type}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Download size={14} />}
                      >
                        Download
                      </Button>
                    </Box>
                    {index < recentReports.length - 1 && (
                      <Divider sx={{ my: 2 }} />
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
              }}
              elevation={0}
            >
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Quick Actions
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mb: 2, justifyContent: "flex-start", py: 1.5 }}
                startIcon={<Calendar size={18} />}
              >
                Schedule Report
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mb: 2, justifyContent: "flex-start", py: 1.5 }}
                startIcon={<Filter size={18} />}
              >
                Manage Templates
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
