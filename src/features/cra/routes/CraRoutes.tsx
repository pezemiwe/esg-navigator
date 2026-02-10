import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { AuthGuard, RoleGuard } from "@/guards";
import { UserRole } from "@/config/permissions.config";
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const CraDataUpload = lazy(() => import("@/features/cra/CRADataUpload"));
const PortfolioSegmentation = lazy(
  () => import("@/features/cra/pages/PortfolioSegmentation"),
);
const PhysicalRiskAssessment = lazy(
  () => import("@/features/cra/pages/PhysicalRiskAssessment"),
);
const TransitionRiskAssessment = lazy(
  () => import("@/features/cra/pages/TransitionRiskAssessment"),
);
const CollateralSensitivity = lazy(
  () => import("@/features/cra/pages/CollateralSensitivity"),
);
const CRAReporting = lazy(() => import("@/features/cra/pages/CRAReporting"));
function CraLoadingFallback() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
      }}
    >
      <CircularProgress sx={{ color: "#86BC25" }} />
    </Box>
  );
}
export default function CraRoutes() {
  return (
    <Routes>
      <Route
        index
        element={
          <AuthGuard>
            <RoleGuard
              allowedRoles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.RISK_ANALYST,
                UserRole.PORTFOLIO_MANAGER,
                UserRole.EXECUTIVE,
              ]}
            >
              <Suspense fallback={<CraLoadingFallback />}>
                <DashboardPage />
              </Suspense>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="data"
        element={
          <AuthGuard>
            <RoleGuard
              allowedRoles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.DATA_ENTRY,
              ]}
            >
              <Suspense fallback={<CraLoadingFallback />}>
                <CraDataUpload />
              </Suspense>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="segmentation"
        element={
          <AuthGuard>
            <RoleGuard
              allowedRoles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.RISK_ANALYST,
                UserRole.PORTFOLIO_MANAGER,
              ]}
            >
              <Suspense fallback={<CraLoadingFallback />}>
                <PortfolioSegmentation />
              </Suspense>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="physical-risk"
        element={
          <AuthGuard>
            <RoleGuard
              allowedRoles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.RISK_ANALYST,
              ]}
            >
              <Suspense fallback={<CraLoadingFallback />}>
                <PhysicalRiskAssessment />
              </Suspense>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="transition-risk"
        element={
          <AuthGuard>
            <RoleGuard
              allowedRoles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.RISK_ANALYST,
              ]}
            >
              <Suspense fallback={<CraLoadingFallback />}>
                <TransitionRiskAssessment />
              </Suspense>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="collateral"
        element={
          <AuthGuard>
            <RoleGuard
              allowedRoles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.RISK_ANALYST,
              ]}
            >
              <Suspense fallback={<CraLoadingFallback />}>
                <CollateralSensitivity />
              </Suspense>
            </RoleGuard>
          </AuthGuard>
        }
      />
      <Route
        path="reporting"
        element={
          <AuthGuard>
            <RoleGuard
              allowedRoles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.RISK_ANALYST,
                UserRole.EXECUTIVE,
              ]}
            >
              <Suspense fallback={<CraLoadingFallback />}>
                <CRAReporting />
              </Suspense>
            </RoleGuard>
          </AuthGuard>
        }
      />
    </Routes>
  );
}