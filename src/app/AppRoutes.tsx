import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/guards";
import { UserRole } from "@/config/permissions.config";
import { LoadingFallback } from "@/components/common/LoadingFallback";

const LandingPage = lazy(() => import("@/features/landing/LandingPage"));
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const ModuleSelectionPage = lazy(
  () => import("@/features/dashboard/ModuleSelectionPage"),
);
const IndustrySelectionPage = lazy(
  () => import("@/features/industry/IndustrySelectionPage"),
);
const ReportsPage = lazy(() => import("@/features/reports/ReportsPage"));

const CRADataUpload = lazy(() => import("@/features/cra/CRADataUpload"));
const DataViewer = lazy(() => import("@/features/cra/pages/DataViewer"));
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
const RiskRatingEngine = lazy(
  () => import("@/features/cra/pages/RiskRatingEngine"),
);
const CRAReporting = lazy(() => import("@/features/cra/pages/CRAReporting"));

const ScenarioDashboard = lazy(
  () => import("@/features/scenario-analysis/ScenarioDashboard"),
);
const ScenarioWorkflowPage = lazy(
  () => import("@/features/scenario-analysis/ScenarioWorkflowPage"),
);
const ScenarioLibrary = lazy(
  () => import("@/features/scenario-analysis/ScenarioLibrary"),
);
const ScenarioReports = lazy(
  () => import("@/features/scenario-analysis/ScenarioReports"),
);
const QuantAnalysis = lazy(
  () => import("@/features/scenario-analysis/QuantAnalysis"),
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
const GovernanceAssessment = lazy(
  () => import("@/features/sustainability/pages/GovernanceAssessment"),
);
const ValueChainAssessment = lazy(
  () => import("@/features/sustainability/pages/ValueChainAssessment"),
);
const SRRORegister = lazy(
  () => import("@/features/sustainability/pages/SRRORegister"),
);
const MaterialInformation = lazy(
  () => import("@/features/sustainability/pages/MaterialInformation"),
);
const MaterialityAssessmentPage = lazy(
  () => import("@/features/sustainability/pages/MaterialityAssessmentPage"),
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

const MaterialityProfiling = lazy(
  () => import("@/features/materiality/MaterialityProfiling"),
);
const MaterialityDataInput = lazy(
  () => import("@/features/materiality/MaterialityDataInput"),
);
const MaterialityDashboard = lazy(
  () => import("@/features/materiality/MaterialityDashboard"),
);

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

const ALL_ROLES = Object.values(UserRole);

const SCENARIO_ROLES = [
  UserRole.RISK_ANALYST,
  UserRole.ESG_MANAGER,
  UserRole.ADMIN,
] as const;

const CRA_ANALYST_ROLES = [
  UserRole.ADMIN,
  UserRole.ESG_MANAGER,
  UserRole.RISK_ANALYST,
] as const;

// All roles that have access to the Materiality & Sustainability module
const SUSTAINABILITY_ROLES = [
  UserRole.ADMIN,
  UserRole.ESG_MANAGER,
  UserRole.EXECUTIVE,
  UserRole.DATA_ENTRY,
  UserRole.SUSTAINABILITY_CHAMPION,
  UserRole.SUSTAINABILITY_MANAGER,
  UserRole.DATA_OWNER,
  UserRole.SUSTAINABILITY_APPROVER,
  UserRole.BOARD,
] as const;

// Roles with access to Capacity Building (LMS)
const LMS_ROLES = [
  UserRole.ADMIN,
  UserRole.ESG_MANAGER,
  UserRole.RISK_ANALYST,
  UserRole.SUSTAINABILITY_CHAMPION,
  UserRole.SUSTAINABILITY_MANAGER,
  UserRole.ERM_TEAM,
] as const;

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/industry-setup"
          element={
            <ProtectedRoute roles={[...ALL_ROLES]}>
              <IndustrySelectionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modules"
          element={
            <ProtectedRoute roles={[...ALL_ROLES]}>
              <ModuleSelectionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cra/dashboard"
          element={
            <ProtectedRoute roles={[...ALL_ROLES]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cra/data"
          element={
            <ProtectedRoute
              roles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.DATA_ENTRY,
              ]}
            >
              <CRADataUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cra/data/:assetTypeId"
          element={
            <ProtectedRoute
              roles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.DATA_ENTRY,
                UserRole.RISK_ANALYST,
                UserRole.PORTFOLIO_MANAGER,
              ]}
            >
              <DataViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cra/segmentation"
          element={
            <ProtectedRoute
              roles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.RISK_ANALYST,
                UserRole.PORTFOLIO_MANAGER,
              ]}
            >
              <PortfolioSegmentation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cra/physical-risk"
          element={
            <ProtectedRoute roles={[...CRA_ANALYST_ROLES]}>
              <PhysicalRiskAssessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cra/transition-risk"
          element={
            <ProtectedRoute roles={[...CRA_ANALYST_ROLES]}>
              <TransitionRiskAssessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cra/collateral"
          element={
            <ProtectedRoute roles={[...CRA_ANALYST_ROLES]}>
              <CollateralSensitivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cra/risk-rating"
          element={
            <ProtectedRoute
              roles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.RISK_ANALYST,
                UserRole.PORTFOLIO_MANAGER,
              ]}
            >
              <RiskRatingEngine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cra/reporting"
          element={
            <ProtectedRoute
              roles={[
                UserRole.ADMIN,
                UserRole.ESG_MANAGER,
                UserRole.RISK_ANALYST,
                UserRole.EXECUTIVE,
              ]}
            >
              <CRAReporting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={[...ALL_ROLES]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scenario-analysis"
          element={
            <ProtectedRoute roles={[...SCENARIO_ROLES]}>
              <ScenarioDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenario-analysis/run"
          element={
            <ProtectedRoute roles={[...SCENARIO_ROLES]}>
              <ScenarioWorkflowPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenario-analysis/library"
          element={
            <ProtectedRoute roles={[...SCENARIO_ROLES]}>
              <ScenarioLibrary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenario-analysis/reports"
          element={
            <ProtectedRoute roles={[...SCENARIO_ROLES]}>
              <ScenarioReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scenario-analysis/quant"
          element={
            <ProtectedRoute roles={[...SCENARIO_ROLES]}>
              <QuantAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sustainability"
          element={
            <ProtectedRoute roles={[...SUSTAINABILITY_ROLES]}>
              <SustainabilityLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SustainabilityDashboard />} />
          <Route path="entity" element={<EntitySetup />} />
          <Route path="governance-assessment" element={<GovernanceAssessment />} />
          <Route path="value-chain" element={<ValueChainAssessment />} />
          <Route path="srro-register" element={<SRRORegister />} />
          <Route path="material-information" element={<MaterialInformation />} />
          <Route path="materiality-scoring" element={<MaterialityAssessmentPage />} />
          <Route path="risks" element={<RiskIdentification />} />
          <Route path="risks/scoring" element={<MaterialityScoringPage />} />
          <Route path="materiality" element={<MaterialityDashboard />} />
          <Route path="templates" element={<TemplateGeneration />} />
          <Route
            path="emissions"
            element={<Navigate to="/carbon-accounting" replace />}
          />
          <Route path="scenarios" element={<SustainabilityScenario />} />
          <Route path="report" element={<AIReport />} />
        </Route>

        <Route
          path="/carbon-accounting/*"
          element={
            <ProtectedRoute roles={[...SUSTAINABILITY_ROLES]}>
              <EmissionsModule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/materiality/profiling"
          element={
            <ProtectedRoute roles={[...SUSTAINABILITY_ROLES]}>
              <MaterialityProfiling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materiality/data-input"
          element={
            <ProtectedRoute roles={[...SUSTAINABILITY_ROLES]}>
              <MaterialityDataInput />
            </ProtectedRoute>
          }
        />

        <Route
          path="/esrm/*"
          element={
            <ProtectedRoute roles={[...ALL_ROLES]}>
              <ESRMPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/capacity-building"
          element={
            <ProtectedRoute roles={[...LMS_ROLES]}>
              <LMSLayout />
            </ProtectedRoute>
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
          path="/sdg-ndc/*"
          element={<Navigate to="/carbon-accounting" replace />}
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/demo"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
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
