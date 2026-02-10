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
import ScenarioLayout from "./layout/ScenarioLayout";
import { useAuthStore } from "@/store/authStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  ArrowRight,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Activity,
  Zap,
  LayoutDashboard,
  Settings2,
  FileText,
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
}
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
          borderColor: DELOITTE_COLORS.green.DEFAULT,
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px -10px ${alpha(
            theme.palette.common.black,
            0.1,
          )}`,
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
                  backgroundColor: alpha(DELOITTE_COLORS.slate.lit, 0.1),
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
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                }}
              >
                {suffix}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: isPositive
                  ? DELOITTE_COLORS.success
                  : theme.palette.error.main,
                bgcolor: alpha(
                  isPositive ? DELOITTE_COLORS.success : theme.palette.error.main,
                  0.1,
                ),
                px: 1,
                py: 0.5,
                borderRadius: "6px",
              }}
            >
              {isPositive ? (
                <TrendingUp size={14} strokeWidth={2.5} />
              ) : (
                <TrendingDown size={14} strokeWidth={2.5} />
              )}
              <Typography variant="caption" fontWeight={700}>
                {change}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};
export default function ScenarioDashboard() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  if (!user) return null;
  const modules: Module[] = [
    {
      id: "run-scenario",
      title: "Run New Scenario",
      description:
        "Execute comprehensive stress testing models with custom parameters.",
      route: "/scenario-analysis/run",
      icon: Activity,
      category: "Execution",
      completion: 0,
    },
    {
      id: "scenario-library",
      title: "Scenario Library",
      description: "Manage saved scenarios, NGFS templates, and custom models.",
      route: "/scenario-analysis/library",
      icon: LayoutDashboard,
      category: "Management",
      completion: 0,
    },
    {
      id: "assumptions",
      title: "Assumptions Config",
      description: "Calibrate key economic and climate variables.",
      route: "/scenario-analysis/assumptions",
      icon: Settings2,
      category: "Configuration",
      completion: 0,
    },
    {
      id: "reports",
      title: "Stress Test Reports",
      description: "Detailed analysis reports and regulatory exports.",
      route: "/scenario-analysis/reports",
      icon: FileText,
      category: "Reporting",
      completion: 0,
    },
  ];
  return (
    <ScenarioLayout>
      <BoxWithGradientHeader user={user} navigate={navigate} theme={theme} />
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
          title="Active Scenarios"
          value="3"
          change="+1"
          isPositive={true}
          description="Currently saved"
          icon={<Activity size={20} />}
        />
        <MetricCard
          title="Max ECL Impact"
          value="12.5"
          suffix="%"
          change="+0.5%"
          isPositive={false}
          description="Worst case scenario"
          icon={<TrendingDown size={20} />}
        />
        <MetricCard
          title="Portfolio Coverage"
          value="85"
          suffix="%"
          change="+5%"
          isPositive={true}
          description="Assets stressed"
          icon={<BarChart3 size={20} />}
        />
        <MetricCard
          title="Avg. Resilience"
          value="Good"
          change="Stable"
          isPositive={true}
          description="Stress test rating"
          icon={<Zap size={20} />}
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
                backgroundColor: DELOITTE_COLORS.slate.DEFAULT,
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
              Analysis Modules
            </Typography>
          </Stack>
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
                        borderColor: DELOITTE_COLORS.green.DEFAULT,
                        transform: "translateY(-4px)",
                        boxShadow: `0 12px 24px -8px ${alpha(
                          theme.palette.common.black,
                          0.1,
                        )}`,
                        "& .icon-box": {
                          backgroundColor: DELOITTE_COLORS.green.DEFAULT,
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
                          : alpha(DELOITTE_COLORS.slate.DEFAULT, 0.1),
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
                      label={module.category}
                      size="small"
                      sx={{
                        backgroundColor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.1),
                        color: DELOITTE_COLORS.green.dark,
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
                      color: theme.palette.text.primary,
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
                  <Divider sx={{ borderColor: theme.palette.divider, mb: 2 }} />
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
                          : DELOITTE_COLORS.green.DEFAULT,
                      }}
                    >
                      <Typography variant="caption" fontWeight={700}>
                        {module.locked ? "Coming Soon" : "Open Module"}
                      </Typography>
                      {!module.locked && (
                        <ArrowRight
                          size={14}
                          className="arrow-icon"
                          style={{
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
    </ScenarioLayout>
  );
}
function BoxWithGradientHeader({
  navigate,
}: {
  navigate: (path: string) => void;
  user?: unknown;
  theme?: unknown;
}) {
  return (
    <Box sx={{ mb: 6 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={3}
        sx={{
          backgroundColor: DELOITTE_COLORS.slate.dark,
          backgroundImage: `linear-gradient(135deg, ${DELOITTE_COLORS.slate.dark} 0%, ${DELOITTE_COLORS.slate.DEFAULT} 100%)`,
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
            opacity: 0.05,
            backgroundImage:
              "radial-gradient(circle at 80% 20%, #86BC25 0%, transparent 50%)",
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
            Scenario Analysis & Stress Testing
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: alpha("#FFF", 0.8),
              fontSize: "1.1rem",
              lineHeight: 1.6,
            }}
          >
            Evaluate your portfolio's resilience against hypothetical climate
            and economic shocks.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate("/scenario-analysis/run")}
          startIcon={<Zap size={18} />}
          sx={{
            backgroundColor: DELOITTE_COLORS.green.DEFAULT,
            color: "#000",
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "8px",
            py: 1.5,
            px: 3,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            position: "relative",
            zIndex: 2,
            "&:hover": {
              backgroundColor: DELOITTE_COLORS.green.dark,
            },
          }}
        >
          Start New Simulation
        </Button>
      </Stack>
    </Box>
  );
}
