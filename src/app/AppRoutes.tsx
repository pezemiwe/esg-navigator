import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { AuthGuard, RoleGuard } from "@/guards";
import { UserRole } from "@/config/permissions.config";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
const LandingPage = lazy(() => import("@/features/landing/LandingPage"));
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const CRADataUpload = lazy(() => import("@/features/cra/CRADataUpload"));
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
const DataViewer = lazy(() => import("@/features/cra/pages/DataViewer"));
const ReportsPage = lazy(() => import("@/features/reports/ReportsPage"));
const ModuleSelectionPage = lazy(
  () => import("@/features/dashboard/ModuleSelectionPage"),
);
const IndustrySelectionPage = lazy(
  () => import("@/features/industry/IndustrySelectionPage"),
);
const ScenarioDashboard = lazy(
  () => import("@/features/scenario-analysis/ScenarioDashboard"),
);
const ScenarioWorkflowPage = lazy(
  () => import("@/features/scenario-analysis/ScenarioWorkflowPage"),
);
const QuantAnalysis = lazy(
  () => import("../features/scenario-analysis/QuantAnalysis"),
);
const ScenarioLibrary = lazy(
  () => import("@/features/scenario-analysis/ScenarioLibrary"),
);
const ScenarioReports = lazy(
  () => import("@/features/scenario-analysis/ScenarioReports"),
);
const SustainabilityLayout = lazy(
  () => import("@/features/sustainability/layout/SustainabilityLayout"),
);
const SustainabilityDashboard = lazy(
  () => import("@/features/sustainability/pages/SustainabilityDashboard"),
);
const EntitySetup = lazy(
  () => import("@/features/sustainability/pages/EntitySetup"),
);
const RiskIdentification = lazy(
  () => import("@/features/sustainability/pages/RiskIdentification"),
);
const MaterialityScoringPage = lazy(
  () =>
    import("@/features/sustainability/pages/MaterialityScoring/MaterialityScoringPage"),
);
const TemplateGeneration = lazy(
  () => import("@/features/sustainability/pages/TemplateGeneration"),
);
const EmissionsModule = lazy(
  () => import("@/features/sustainability/pages/EmissionsModule"),
);
const SustainabilityScenario = lazy(
  () => import("@/features/sustainability/pages/SustainabilityScenario"),
);
const AIReport = lazy(() => import("@/features/sustainability/pages/AIReport"));
const ESRMPage = lazy(() => import("@/features/esrm/esrm"));
const LMSLayout = lazy(() => import("@/features/e-learnings/layout/LMSLayout"));
const LMSDashboard = lazy(
  () => import("@/features/e-learnings/pages/LMSDashboard"),
);
const MyLearning = lazy(
  () => import("@/features/e-learnings/pages/MyLearning"),
);
const CourseCatalog = lazy(
  () => import("@/features/e-learnings/pages/CourseCatalog"),
);
const CoursePlayer = lazy(
  () => import("@/features/e-learnings/pages/CoursePlayer"),
);
const Certifications = lazy(
  () => import("@/features/e-learnings/pages/Certifications"),
);
const UserProfile = lazy(
  () => import("@/features/e-learnings/pages/UserProfile"),
);
const SDGLayout = lazy(() => import("@/features/sdg-ndc/layout/SDGLayout"));
const SDGDashboard = lazy(
  () => import("@/features/sdg-ndc/pages/SDGDashboard"),
);
const SDGAlignment = lazy(
  () => import("@/features/sdg-ndc/pages/SDGAlignment"),
);
const NDCTracker = lazy(() => import("@/features/sdg-ndc/pages/NDCTracker"));
const SDGReports = lazy(() => import("@/features/sdg-ndc/pages/SDGReports"));
function LoadingFallback() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#1D1D1D",
      }}
    >
      <CircularProgress sx={{ color: "#86BC25" }} />
    </Box>
  );
}
const MaterialityProfiling = lazy(
  () => import("@/features/materiality/MaterialityProfiling"),
);
const MaterialityDataInput = lazy(
  () => import("@/features/materiality/MaterialityDataInput"),
);
const MaterialityDashboard = lazy(
  () => import("@/features/materiality/MaterialityDashboard"),
);
// const MaterialityDashboard = () => <div>Dashboard Placeholder</div>; // Debugging

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/industry-setup"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={Object.values(UserRole)}>
                <IndustrySelectionPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/modules"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={Object.values(UserRole)}>
                <ModuleSelectionPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/cra/dashboard"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={Object.values(UserRole)}>
                <ErrorBoundary>
                  <DashboardPage />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/reports"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={Object.values(UserRole)}>
                <ErrorBoundary>
                  <ReportsPage />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/scenario-analysis"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.RISK_ANALYST,
                  UserRole.ESG_MANAGER,
                  UserRole.ADMIN,
                ]}
              >
                <ErrorBoundary>
                  <ScenarioDashboard />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/scenario-analysis/run"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.RISK_ANALYST,
                  UserRole.ESG_MANAGER,
                  UserRole.ADMIN,
                ]}
              >
                <ErrorBoundary>
                  <ScenarioWorkflowPage />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/scenario-analysis/library"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.RISK_ANALYST,
                  UserRole.ESG_MANAGER,
                  UserRole.ADMIN,
                ]}
              >
                <ErrorBoundary>
                  <ScenarioLibrary />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/scenario-analysis/reports"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.RISK_ANALYST,
                  UserRole.ESG_MANAGER,
                  UserRole.ADMIN,
                ]}
              >
                <ErrorBoundary>
                  <ScenarioReports />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/scenario-analysis/quant"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.RISK_ANALYST,
                  UserRole.ESG_MANAGER,
                  UserRole.ADMIN,
                ]}
              >
                <ErrorBoundary>
                  <Suspense
                    fallback={
                      <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                      </Box>
                    }
                  >
                    <QuantAnalysis />
                  </Suspense>
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/sustainability"
          element={
            <AuthGuard>
              <ErrorBoundary>
                <SustainabilityLayout />
              </ErrorBoundary>
            </AuthGuard>
          }
        >
          <Route index element={<SustainabilityDashboard />} />
          <Route path="entity" element={<EntitySetup />} />
          <Route path="risks" element={<RiskIdentification />} />
          <Route path="risks/scoring" element={<MaterialityScoringPage />} />
          <Route path="materiality" element={<MaterialityDashboard />} />
          <Route path="templates" element={<TemplateGeneration />} />
          <Route path="emissions" element={<EmissionsModule />} />
          <Route path="scenarios" element={<SustainabilityScenario />} />
          <Route path="report" element={<AIReport />} />
        </Route>

        {/* New Materiality Routes */}
        <Route
          path="/materiality/profiling"
          element={
            <AuthGuard>
              <MaterialityProfiling />
            </AuthGuard>
          }
        />
        {/* <Route
          path="/materiality/dashboard"
          element={
            <AuthGuard>
              <MaterialityDashboard />
            </AuthGuard>
          } 
        /> */}
        {/* Assignment Route removed/hidden per user request for direct flow */}
        {/* <Route
          path="/materiality/assignments" ... /> */}
        <Route
          path="/materiality/data-input"
          element={
            <AuthGuard>
              <MaterialityDataInput />
            </AuthGuard>
          }
        />

        <Route
          path="/esrm/*"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={Object.values(UserRole)}>
                <ErrorBoundary>
                  <ESRMPage />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/capacity-building"
          element={
            <AuthGuard>
              <ErrorBoundary>
                <LMSLayout />
              </ErrorBoundary>
            </AuthGuard>
          }
        >
          <Route index element={<LMSDashboard />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="my-learning" element={<MyLearning />} />
          <Route path="course/:courseId" element={<CoursePlayer />} />
          <Route path="certifications" element={<Certifications />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
        <Route
          path="/sdg-ndc"
          element={
            <AuthGuard>
              <ErrorBoundary>
                <SDGLayout />
              </ErrorBoundary>
            </AuthGuard>
          }
        >
          <Route index element={<SDGDashboard />} />
          <Route path="sdg-alignment" element={<SDGAlignment />} />
          <Route path="ndc-tracker" element={<NDCTracker />} />
          <Route path="reports" element={<SDGReports />} />
        </Route>
        <Route
          path="/cra/data"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.ESG_MANAGER,
                  UserRole.DATA_ENTRY,
                ]}
              >
                <ErrorBoundary>
                  <CRADataUpload />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/cra/data/:assetTypeId"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.ESG_MANAGER,
                  UserRole.DATA_ENTRY,
                  UserRole.RISK_ANALYST,
                  UserRole.PORTFOLIO_MANAGER,
                ]}
              >
                <ErrorBoundary>
                  <DataViewer />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/cra/segmentation"
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
                <ErrorBoundary>
                  <PortfolioSegmentation />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/cra/physical-risk"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.ESG_MANAGER,
                  UserRole.RISK_ANALYST,
                ]}
              >
                <ErrorBoundary>
                  <PhysicalRiskAssessment />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/cra/transition-risk"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.ESG_MANAGER,
                  UserRole.RISK_ANALYST,
                ]}
              >
                <ErrorBoundary>
                  <TransitionRiskAssessment />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/cra/collateral"
          element={
            <AuthGuard>
              <RoleGuard
                allowedRoles={[
                  UserRole.ADMIN,
                  UserRole.ESG_MANAGER,
                  UserRole.RISK_ANALYST,
                ]}
              >
                <ErrorBoundary>
                  <CollateralSensitivity />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/cra/reporting"
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
                <ErrorBoundary>
                  <CRAReporting />
                </ErrorBoundary>
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AuthGuard>
              <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                <DashboardPage />
              </RoleGuard>
            </AuthGuard>
          }
        />
        <Route
          path="/demo"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route path="/privacy" element={<DashboardPage />} />
        <Route path="/terms" element={<DashboardPage />} />
        <Route path="/compliance" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
