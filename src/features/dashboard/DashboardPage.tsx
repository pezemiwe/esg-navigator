import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  Paper,
  Stack,
  alpha,
  Button,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import DashboardNavbar from "@/components/layout/DashboardNavbar/DashboardNavbar";
import { useAuthStore } from "@/store/authStore";
import { useCRADataStore, useCRAStatusStore } from "@/store/craStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowRight,
  Download,
  ChevronRight,
  BarChart3,
  Database,
  Shield,
  Globe,
  Building,
  FileText,
  PieChart,
  AlertTriangle,
  Calendar,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
interface Module {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: React.ElementType;
  category: string;
  completion: number;
  locked?: boolean;
  requirement?: string;
}
const sectorExposure = [
  {
    sector: "Agriculture & Forestry",
    exposure: 450,
    risk: "Hi",
    trend: "+12%",
    riskScore: 8.4,
    color: "#EF4444",
  },
  {
    sector: "Energy & Utilities",
    exposure: 320,
    risk: "Medium",
    trend: "+8%",
    riskScore: 6.2,
    color: "#F59E0B",
  },
  {
    sector: "Transport & Storage",
    exposure: 280,
    risk: "Hi",
    trend: "+15%",
    riskScore: 7.9,
    color: "#EF4444",
  },
  {
    sector: "Real Estate",
    exposure: 210,
    risk: "Medium",
    trend: "+5%",
    riskScore: 5.5,
    color: "#F59E0B",
  },
  {
    sector: "Manufacturing",
    exposure: 180,
    risk: "Low",
    trend: "+3%",
    riskScore: 3.2,
    color: "#10B981",
  },
  {
    sector: "Infrastructure",
    exposure: 150,
    risk: "Medium",
    trend: "+7%",
    riskScore: 4.8,
    color: "#F59E0B",
  },
];
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  suffix?: string;
  description?: string;
  icon?: React.ReactNode;
}
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive,
  suffix,
  description,
  icon,
}) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: "12px",
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          borderColor: DELOITTE_COLORS.slate.lit,
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px -10px ${alpha(theme.palette.common.black, 0.1)}`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: isPositive
            ? `linear-gradient(90deg, ${DELOITTE_COLORS.success}, transparent)`
            : `linear-gradient(90deg, ${theme.palette.error.main}, transparent)`,
        }}
      />
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {title}
            </Typography>
            {icon && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  backgroundColor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
                  color: DELOITTE_COLORS.slate.DEFAULT,
                }}
              >
                {icon}
              </Box>
            )}
          </Stack>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                letterSpacing: "-0.5px",
                fontSize: "2rem",
              }}
            >
              {value}
            </Typography>
            {suffix && (
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 600,
                  alignSelf: "flex-end",
                  mb: 0.5,
                }}
              >
                {suffix}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              size="small"
              label={change}
              icon={
                isPositive ? (
                  <TrendingUpIcon size={12} />
                ) : (
                  <TrendingDownIcon size={12} />
                )
              }
              sx={{
                height: 24,
                backgroundColor: isPositive
                  ? alpha(DELOITTE_COLORS.success, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
                color: isPositive
                  ? DELOITTE_COLORS.success
                  : theme.palette.error.main,
                fontWeight: 700,
                fontSize: "0.75rem",
                "& .MuiChip-icon": {
                  color: "inherit",
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.75rem",
              }}
            >
              vs last quarter
            </Typography>
          </Stack>
          {description && (
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.8rem",
                lineHeight: 1.5,
                pt: 1,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              {description}
            </Typography>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `₦${(value / 1000000000).toFixed(1)}`;
  }
  if (value >= 1000000) {
    return `₦${(value / 1000000).toFixed(1)}`;
  }
  return `₦${value.toLocaleString()}`;
};

const getCurrencySuffix = (value: number) => {
  if (value >= 1000000000) return "B";
  if (value >= 1000000) return "M";
  return "";
};

export default function DashboardPage() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { assets } = useCRADataStore();
  const { dataUploaded, segmentationReady, praReady, traReady } =
    useCRAStatusStore();
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState("quarterly");
  if (!user) return null;
  const modules: Module[] = [
    {
      id: "data-upload",
      title: "CRA Data Setup",
      description:
        "Centralized data ingestion and validation for portfolio analysis",
      route: "/cra/data",
      icon: Database,
      category: "Core System",
      completion: dataUploaded ? 100 : 0,
    },
    {
      id: "segmentation",
      title: "Portfolio Segmentation",
      description: "Advanced sector and geographic risk exposure analysis",
      route: "/cra/segmentation",
      icon: PieChart,
      category: "Analytics",
      completion: segmentationReady ? 100 : 0,
      locked: !dataUploaded,
      requirement: "Data Setup",
    },
    {
      id: "physical-risk",
      title: "Physical Risk Assessment",
      description: "Comprehensive climate hazard modeling and impact analysis",
      route: "/cra/physical-risk",
      icon: Globe,
      category: "Risk Analysis",
      completion: praReady ? 100 : 0,
      locked: !dataUploaded,
      requirement: "Data Setup",
    },
    {
      id: "transition-risk",
      title: "Transition Risk Assessment",
      description: "Policy, technology and market transition scenario analysis",
      route: "/cra/transition-risk",
      icon: Shield,
      category: "Strategy",
      completion: traReady ? 100 : 0,
      locked: !dataUploaded,
      requirement: "Data Setup",
    },
    {
      id: "collateral",
      title: "Collateral Sensitivity",
      description:
        "Climate impact assessment on asset valuations and collateral",
      route: "/cra/collateral",
      icon: Building,
      category: "Valuation",
      completion: 0,
      locked: !praReady && !traReady,
      requirement: "Any Risk Assessment",
    },
    {
      id: "reporting",
      title: "CRA Reporting",
      description: "Regulatory compliance and stakeholder reporting suite",
      route: "/cra/reporting",
      icon: FileText,
      category: "Compliance",
      completion: 0,
      locked: !praReady && !traReady,
      requirement: "Any Risk Assessment",
    },
  ];
  const uploadedAssetTypes = Object.values(assets).filter(
    (a) => a.rowCount > 0,
  ).length;
  const totalRecords = Object.values(assets).reduce(
    (sum, asset) => sum + asset.rowCount,
    0,
  );
  const totalExposure = Object.values(assets).reduce(
    (sum, asset) =>
      sum +
      asset.data.reduce((s, a) => s + (Number(a.outstandingBalance) || 0), 0),
    0,
  );
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        pt: "70px",
      }}
    >
      <DashboardNavbar />
      <Box sx={{ maxWidth: 1600, mx: "auto", px: { xs: 2, md: 4 }, py: 4 }}>
        <Box sx={{ mb: 6 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={3}
            sx={{
              backgroundColor: DELOITTE_COLORS.slate.DEFAULT,
              backgroundImage: `linear-gradient(135deg, ${DELOITTE_COLORS.slate.DEFAULT} 0%, ${DELOITTE_COLORS.slate.dark} 100%)`,
              borderRadius: "16px",
              p: 4,
              color: "#FFF",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                rit: 0,
                bottom: 0,
                left: 0,
                opacity: 0.1,
                backgroundImage:
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)",
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                  mb: 1,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Welcome back, {user.name}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: alpha("#FFF", 0.8),
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                }}
              >
                {dataUploaded ? (
                  <>
                    Here's your ESG risk overview for today. Your portfolio
                    shows a{" "}
                    <b style={{ color: DELOITTE_COLORS.success }}>
                      positive alignment
                    </b>{" "}
                    with targeted sustainability goals.
                  </>
                ) : (
                  "Please upload your portfolio data to initialize the dashboard and begin your climate risk assessment."
                )}
              </Typography>
            </Box>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ position: "relative", zIndex: 1 }}
            >
              <Box
                sx={{
                  backgroundColor: alpha("#FFF", 0.1),
                  borderRadius: "8px",
                  p: "4px",
                  display: "flex",
                  border: `1px solid ${alpha("#FFF", 0.2)}`,
                }}
              >
                <Button
                  onClick={() => setSelectedTimeframe("monthly")}
                  sx={{
                    color:
                      selectedTimeframe === "monthly"
                        ? DELOITTE_COLORS.slate.DEFAULT
                        : "#FFF",
                    bgcolor:
                      selectedTimeframe === "monthly" ? "#FFF" : "transparent",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "6px",
                    px: 2,
                    py: 1,
                    "&:hover": {
                      bgcolor:
                        selectedTimeframe === "monthly"
                          ? "#FFF"
                          : alpha("#FFF", 0.1),
                    },
                  }}
                >
                  Monthly
                </Button>
                <Button
                  onClick={() => setSelectedTimeframe("quarterly")}
                  sx={{
                    color:
                      selectedTimeframe === "quarterly"
                        ? DELOITTE_COLORS.slate.DEFAULT
                        : "#FFF",
                    bgcolor:
                      selectedTimeframe === "quarterly"
                        ? "#FFF"
                        : "transparent",
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: "6px",
                    px: 2,
                    py: 1,
                    "&:hover": {
                      bgcolor:
                        selectedTimeframe === "quarterly"
                          ? "#FFF"
                          : alpha("#FFF", 0.1),
                    },
                  }}
                >
                  Quarterly
                </Button>
              </Box>
              <Button
                variant="contained"
                startIcon={<Download size={18} />}
                sx={{
                  backgroundColor: DELOITTE_COLORS.green.DEFAULT,
                  color: "#FFF",
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: "8px",
                  py: 1.5,
                  px: 3,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.9),
                  },
                }}
              >
                Generate Report
              </Button>
            </Stack>
          </Stack>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
            mb: 6,
          }}
        >
          <MetricCard
            title="Total Exposure"
            value={formatCurrency(totalExposure)}
            suffix={getCurrencySuffix(totalExposure)}
            change={dataUploaded ? "+11.1%" : "-"}
            isPositive={true}
            description="Active portfolio volume"
            icon={<BarChart3 size={20} />}
          />
          <MetricCard
            title="Total Records"
            value={totalRecords.toLocaleString()}
            change={dataUploaded ? "+8.5%" : "-"}
            isPositive={true}
            description="Assets under management"
            icon={<Database size={20} />}
          />
          <MetricCard
            title="Asset Classes"
            value={uploadedAssetTypes.toString()}
            change={dataUploaded ? "+1 New" : "-"}
            isPositive={true}
            description="Diversification index"
            icon={<PieChart size={20} />}
          />
          <MetricCard
            title="Avg. Risk Score"
            value={dataUploaded ? "7.2" : "-"}
            change={dataUploaded ? "-2.3%" : "-"}
            isPositive={false}
            suffix={dataUploaded ? "/10" : ""}
            description="Weited risk average"
            icon={<AlertTriangle size={20} />}
          />
        </Box>
        <Box sx={{ mb: 6 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 3 }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 4,
                  height: 24,
                  backgroundColor: DELOITTE_COLORS.green.DEFAULT,
                  borderRadius: "2px",
                }}
              />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  letterSpacing: "-0.5px",
                }}
              >
                Risk Modules
              </Typography>
            </Stack>
            <Button
              endIcon={<ChevronRight size={16} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: DELOITTE_COLORS.slate.DEFAULT,
                "&:hover": {
                  backgroundColor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
                },
              }}
              onClick={() => navigate("/modules")}
            >
              View All
            </Button>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <Paper
                  key={module.id}
                  elevation={0}
                  sx={{
                    backgroundColor: module.locked
                      ? alpha(theme.palette.background.default, 0.5)
                      : theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "12px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: module.locked ? "not-allowed" : "pointer",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    opacity: module.locked ? 0.7 : 1,
                    "&:hover": module.locked
                      ? {}
                      : {
                          borderColor: DELOITTE_COLORS.slate.DEFAULT,
                          transform: "translateY(-4px)",
                          boxShadow: `0 12px 24px -8px ${alpha(theme.palette.common.black, 0.1)}`,
                          "& .icon-box": {
                            backgroundColor: DELOITTE_COLORS.slate.DEFAULT,
                            color: "#FFF",
                            transform: "scale(1.1)",
                          },
                          "& .arrow-icon": {
                            opacity: 1,
                            transform: "translateX(0)",
                          },
                        },
                  }}
                  onClick={() => !module.locked && navigate(module.route)}
                >
                  <Box
                    sx={{
                      p: 3,
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      sx={{ mb: 2 }}
                    >
                      <Box
                        className="icon-box"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          borderRadius: "12px",
                          backgroundColor: module.locked
                            ? alpha(theme.palette.text.secondary, 0.1)
                            : alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
                          color: module.locked
                            ? theme.palette.text.secondary
                            : DELOITTE_COLORS.slate.DEFAULT,
                          transition: "all 0.3s ease",
                        }}
                      >
                        {module.locked ? (
                          <Lock size={24} strokeWidth={1.5} />
                        ) : (
                          <IconComponent size={24} strokeWidth={1.5} />
                        )}
                      </Box>
                      <Chip
                        label={
                          module.locked
                            ? `Requires ${module.requirement}`
                            : module.category
                        }
                        size="small"
                        sx={{
                          backgroundColor: module.locked
                            ? alpha(theme.palette.error.main, 0.1)
                            : alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
                          color: module.locked
                            ? theme.palette.error.main
                            : DELOITTE_COLORS.slate.DEFAULT,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          height: 24,
                          borderRadius: "6px",
                          border: "none",
                        }}
                      />
                    </Stack>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: module.locked
                          ? theme.palette.text.secondary
                          : theme.palette.text.primary,
                        mb: 1,
                        fontSize: "1.1rem",
                      }}
                    >
                      {module.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        lineHeight: 1.6,
                        mb: 3,
                        flex: 1,
                      }}
                    >
                      {module.description}
                    </Typography>
                    <Divider
                      sx={{ borderColor: theme.palette.divider, mb: 2 }}
                    />
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{
                          color: module.locked
                            ? theme.palette.text.secondary
                            : DELOITTE_COLORS.slate.DEFAULT,
                        }}
                      >
                        <Typography variant="caption" fontWeight={700}>
                          {module.locked ? "Locked" : "Open"}
                        </Typography>
                        {!module.locked && (
                          <ArrowRight
                            size={14}
                            className="arrow-icon"
                            style={{
                              transition:
                                "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              opacity: 0.5,
                              transform: "translateX(-4px)",
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: `0 4px 6px -1px ${alpha(theme.palette.common.black, 0.05)}`,
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                }}
              >
                Sector Exposure Analysis
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                }}
              >
                Risk distribution across key economic sectors
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Calendar size={16} />}
              sx={{
                textTransform: "none",
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
              }}
            >
              Last 30 Days
            </Button>
          </Box>
          <Box
            sx={{
              p: 3,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            {sectorExposure.map((sector) => (
              <Paper
                key={sector.sector}
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  borderRadius: "8px",
                  border: "1px solid transparent",
                  transition: "all 0.2s ease",
                  cursor: "default",
                  "&:hover": {
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`,
                  },
                }}
              >
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        fontSize: "0.9rem",
                      }}
                    >
                      {sector.sector}
                    </Typography>
                    <Chip
                      label={sector.risk}
                      size="small"
                      sx={{
                        backgroundColor: alpha(sector.color, 0.1),
                        color: sector.color,
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        height: 20,
                        borderRadius: "4px",
                      }}
                    />
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      ₦{sector.exposure}M
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="caption"
                        sx={{ color: sector.color, fontWeight: 700 }}
                      >
                        {sector.trend}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        vs last year
                      </Typography>
                    </Stack>
                  </Stack>
                  <Box
                    sx={{
                      width: "100%",
                      height: "4px",
                      bgcolor: alpha(theme.palette.text.secondary, 0.1),
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(sector.riskScore / 10) * 100}%`,
                        height: "100%",
                        bgcolor: sector.color,
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>
        </Paper>
        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Deloitte ESG Platform &copy; 2026. All rights reserved. •
            Confidential & Proprietary
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
