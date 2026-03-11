import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  BarChart3,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Building2,
  Settings2,
  Shield,
  MapPin,
  Users,
  Zap,
  ArrowUpCircle,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import ApproverModal from "./ApproverModal";
import { step3Approvers } from "../data/formData";
import { downloadCSV, computeScoringResult } from "../utils";
import { getCategoryStyles } from "../utils";
import { useApproverModal } from "../hooks";
import { useEsrmStore } from "../../../store/esrmStore";
import {
  sectorScores,
  projectCharacteristicsQuestions,
  preAssessmentQuestions,
  psQuestionnaires,
  contextQuestions,
  clientTrackRecordQuestions,
  DIMENSION_WEIGHTS,
  demoAutoFill,
} from "../data/scoringData";
import type { ScoringResult } from "../types";
import type { ScoredQuestion, PSQuestionnaire } from "../data/scoringData";

// ─── Sub-step definitions ────────────────────────────────────────────────────

const SUB_STEPS = [
  { id: 0, label: "Sector Risk", icon: Building2 },
  { id: 1, label: "Project Characteristics", icon: Settings2 },
  { id: 2, label: "Pre-Assessment", icon: Shield },
  { id: 3, label: "PS Questionnaire", icon: FileText },
  { id: 4, label: "Context & Location", icon: MapPin },
  { id: 5, label: "Client Track Record", icon: Users },
  { id: 6, label: "Result", icon: BarChart3 },
] as const;

// ─── Reusable multi-option question renderer ─────────────────────────────────

const RadioQuestionGroup: React.FC<{
  questions: ScoredQuestion[];
  answers: Record<string, number>;
  onChange: (key: string, value: number) => void;
}> = ({ questions, answers, onChange }) => (
  <div className="space-y-6">
    {questions.map((q) => (
      <div
        key={q.key}
        className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
      >
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          {q.text}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          {q.options.map((opt) => {
            const selected = answers[q.key] === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all text-sm font-medium flex-1 ${
                  selected
                    ? "border-[#86BC25] bg-[#86BC25]/10 text-slate-900 dark:text-white ring-1 ring-[#86BC25]"
                    : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name={q.key}
                  value={opt.value}
                  checked={selected}
                  onChange={() => onChange(q.key, opt.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selected
                      ? "border-[#86BC25] bg-[#86BC25]"
                      : "border-slate-300 dark:border-slate-500"
                  }`}
                >
                  {selected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span>{opt.label}</span>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    selected
                      ? "bg-[#86BC25]/20 text-[#86BC25]"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  {opt.value}/3
                </span>
              </label>
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// CategorizationStep – BRD 5-Dimension Weighted Scoring Wizard
// ═══════════════════════════════════════════════════════════════════════════════

const CategorizationStep: React.FC = () => {
  const navigate = useNavigate();
  const [subStep, setSubStep] = useState(0);

  // D1 – Sector
  const [selectedSector, setSelectedSector] = useState("");

  // D2 – Project Characteristics
  const [pcAnswers, setPcAnswers] = useState<Record<string, number>>({});

  // Pre-assessment triggers
  const [triggerAnswers, setTriggerAnswers] = useState<Record<string, string>>(
    {},
  );

  // D3 – PS detailed answers
  const [psAnswers, setPsAnswers] = useState<Record<string, number>>({});

  // D4 – Context
  const [ctxAnswers, setCtxAnswers] = useState<Record<string, number>>({});

  // D5 – Client
  const [ctrAnswers, setCtrAnswers] = useState<Record<string, number>>({});

  const {
    showModal,
    selectedApprover,
    expectedCompletionDate,
    notificationSent,
    setSelectedApprover,
    setExpectedCompletionDate,
    openModal,
    closeModal,
    handleSubmit,
  } = useApproverModal();

  const addTask = useEsrmStore((state) => state.addTask);
  const currentProjectId = useEsrmStore((state) => state.currentProjectId);
  const projects = useEsrmStore((state) => state.projects);
  const updateProject = useEsrmStore((state) => state.updateProject);

  const handleFinalSubmit = () => {
    const proj = projects.find((p) => p.id === currentProjectId);

    if (proj) {
      updateProject(proj.id, {
        currentStepPath: "esdd",
        stepNumber: 3,
        progress: 30,
        isDraft: false,
      });
    }

    if (selectedApprover) {
      addTask({
        id: Date.now().toString(),
        projectName: proj ? proj.project : "New Project",
        clientName: proj ? proj.client : "Unknown Client",
        currentStep: "Environmental & Social Due Diligence",
        priority: "High",
        dueDate:
          expectedCompletionDate ||
          new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        assignedBy: "You",
        status: "Awaiting Approval",
      });
    }

    handleSubmit(() => {
      navigate("../esdd");
    });
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const triggeredPSIds = useMemo(() => {
    const ids: string[] = [];
    preAssessmentQuestions.forEach((q) => {
      if (triggerAnswers[q.key] === "yes") ids.push(q.triggeredPS);
    });
    return ids;
  }, [triggerAnswers]);

  const activePSQuestionnaires = useMemo(
    () =>
      psQuestionnaires.filter(
        (ps) => ps.id === "ps1" || triggeredPSIds.includes(ps.id),
      ),
    [triggeredPSIds],
  );

  const scoringResult: ScoringResult | null = useMemo(() => {
    if (subStep < 6) return null;
    if (!selectedSector) return null;
    return computeScoringResult(
      selectedSector,
      pcAnswers,
      triggeredPSIds,
      psAnswers,
      ctxAnswers,
      ctrAnswers,
    );
  }, [
    subStep,
    selectedSector,
    pcAnswers,
    triggeredPSIds,
    psAnswers,
    ctxAnswers,
    ctrAnswers,
  ]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePcChange = useCallback((key: string, value: number) => {
    setPcAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePsChange = useCallback((key: string, value: number) => {
    setPsAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCtxChange = useCallback((key: string, value: number) => {
    setCtxAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCtrChange = useCallback((key: string, value: number) => {
    setCtrAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleDemoAutoFill = useCallback(() => {
    setSelectedSector(demoAutoFill.sector);
    setPcAnswers({ ...demoAutoFill.projectCharacteristics });
    setTriggerAnswers({ ...demoAutoFill.preAssessment });
    setPsAnswers({ ...demoAutoFill.psAnswers });
    setCtxAnswers({ ...demoAutoFill.context });
    setCtrAnswers({ ...demoAutoFill.clientTrackRecord });
    setSubStep(6);
  }, []);

  const handleExportReport = useCallback(() => {
    if (!scoringResult) return;
    const rows: string[][] = [
      ["ESRM Risk Categorization Report"],
      [""],
      [
        "Dimension",
        "Raw Score",
        "Normalised (0-5)",
        "Weight",
        "Weighted Score",
      ],
      [
        "D1 – Sector Risk",
        scoringResult.D1.raw.toFixed(1),
        scoringResult.D1.normalised.toFixed(2),
        "15%",
        scoringResult.D1.weighted.toFixed(2),
      ],
      [
        "D2 – Project Characteristics",
        scoringResult.D2.raw.toFixed(1),
        scoringResult.D2.normalised.toFixed(2),
        "20%",
        scoringResult.D2.weighted.toFixed(2),
      ],
      [
        "D3 – PS Questionnaire",
        scoringResult.D3.raw.toFixed(1),
        scoringResult.D3.normalised.toFixed(2),
        "40%",
        scoringResult.D3.weighted.toFixed(2),
      ],
      [
        "D4 – Context & Location",
        scoringResult.D4.raw.toFixed(1),
        scoringResult.D4.normalised.toFixed(2),
        "15%",
        scoringResult.D4.weighted.toFixed(2),
      ],
      [
        "D5 – Client Track Record",
        scoringResult.D5.raw.toFixed(1),
        scoringResult.D5.normalised.toFixed(2),
        "10%",
        scoringResult.D5.weighted.toFixed(2),
      ],
      [""],
      ["Composite Score", scoringResult.composite.toFixed(2)],
      ["Risk Category", `Category ${scoringResult.category}`],
      [""],
      ["Performance Standard Scores"],
      ["PS", "Raw", "Max", "Normalised", "Triggered"],
      ...scoringResult.psScores.map((ps) => [
        ps.id.toUpperCase(),
        ps.rawTotal.toString(),
        ps.maxRaw.toString(),
        ps.normalised.toFixed(2),
        ps.triggered ? "Yes" : "No",
      ]),
    ];
    if (scoringResult.escalationReasons.length > 0) {
      rows.push([""], ["Escalation Alerts"]);
      scoringResult.escalationReasons.forEach((r) => rows.push([r]));
    }
    downloadCSV(rows, "ESRM_Risk_Categorization_Report.csv");
  }, [scoringResult]);

  // ── Sub-step completion check ──────────────────────────────────────────────

  const isSubStepComplete = useCallback(
    (step: number): boolean => {
      switch (step) {
        case 0:
          return selectedSector !== "";
        case 1:
          return projectCharacteristicsQuestions.every(
            (q) => pcAnswers[q.key] != null,
          );
        case 2:
          return preAssessmentQuestions.every(
            (q) =>
              triggerAnswers[q.key] != null && triggerAnswers[q.key] !== "",
          );
        case 3:
          return activePSQuestionnaires.every((ps) =>
            ps.questions.every((q) => psAnswers[q.key] != null),
          );
        case 4:
          return contextQuestions.every((q) => ctxAnswers[q.key] != null);
        case 5:
          return clientTrackRecordQuestions.every(
            (q) => ctrAnswers[q.key] != null,
          );
        default:
          return true;
      }
    },
    [
      selectedSector,
      pcAnswers,
      triggerAnswers,
      psAnswers,
      ctxAnswers,
      ctrAnswers,
      activePSQuestionnaires,
    ],
  );

  // ── Sub-step renderers ─────────────────────────────────────────────────────

  const renderSectorStep = () => (
    <div className="space-y-6">
      <div className="bg-[#FFF8E6] border border-[#86BC25] rounded-lg p-4">
        <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#86BC25]" />
          Dimension 1 – Sector / Activity Risk
        </h3>
        <p className="text-sm text-slate-700">
          Select the sector that best matches the project's primary activity.
          Each sector carries a fixed risk score (1–5) aligned to IFC industry
          benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sectorScores.map((s) => {
          const active = selectedSector === s.label;
          return (
            <button
              key={s.label}
              onClick={() => setSelectedSector(s.label)}
              className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left cursor-pointer ${
                active
                  ? "border-[#86BC25] bg-[#86BC25]/10 shadow-md"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  active
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {s.label}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  s.score >= 4
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    : s.score >= 3
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                }`}
              >
                {s.score}/5
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderProjectCharacteristics = () => (
    <div className="space-y-6">
      <div className="bg-[#FFF8E6] border border-[#86BC25] rounded-lg p-4">
        <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#86BC25]" />
          Dimension 2 – Project Characteristics
        </h3>
        <p className="text-sm text-slate-700">
          Assess the project's inherent characteristics. Each factor is scored
          1–3 (Low → High) and normalised to a 0–5 scale.
        </p>
      </div>
      <RadioQuestionGroup
        questions={projectCharacteristicsQuestions}
        answers={pcAnswers}
        onChange={handlePcChange}
      />
    </div>
  );

  const renderPreAssessment = () => (
    <div className="space-y-6">
      <div className="bg-[#FFF8E6] border border-[#86BC25] rounded-lg p-4">
        <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#86BC25]" />
          Pre-Assessment Screening
        </h3>
        <p className="text-sm text-slate-700">
          Answer Yes / No for each question. "Yes" triggers the corresponding
          Performance Standard for detailed assessment in the next step. PS1 is
          always assessed.
        </p>
      </div>

      <div className="space-y-4">
        {preAssessmentQuestions.map((q) => {
          const val = triggerAnswers[q.key] ?? "";
          return (
            <div
              key={q.key}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {q.text}
                  </p>
                  <span className="text-xs text-slate-400 mt-1 block">
                    Triggers: {q.triggeredPS.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-3">
                  {(["yes", "no"] as const).map((opt) => {
                    const sel = val === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() =>
                          setTriggerAnswers((prev) => ({
                            ...prev,
                            [q.key]: opt,
                          }))
                        }
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all border cursor-pointer ${
                          sel
                            ? opt === "yes"
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-slate-700 text-white border-slate-700"
                            : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {opt === "yes" ? "Yes" : "No"}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {triggeredPSIds.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-2">
            Triggered Performance Standards
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white">
              PS1 (always)
            </span>
            {triggeredPSIds.map((id) => (
              <span
                key={id}
                className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white"
              >
                {id.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPSDetailedQuestions = () => (
    <div className="space-y-8">
      <div className="bg-[#FFF8E6] border border-[#86BC25] rounded-lg p-4">
        <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#86BC25]" />
          Dimension 3 – Performance Standards Detailed Assessment
        </h3>
        <p className="text-sm text-slate-700">
          Answer detailed questions for each triggered Performance Standard.
          Scores are normalised per-PS, then combined using Severity (70%) and
          Breadth (30%) sub-formula. This dimension carries 40% of the total
          weight.
        </p>
      </div>

      {activePSQuestionnaires.map((ps: PSQuestionnaire) => (
        <div
          key={ps.id}
          className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm"
        >
          <div className="bg-slate-900 px-6 py-4 border-b border-[#86BC25] flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">{ps.shortTitle}</h3>
            <span className="text-xs text-slate-400">Max raw: {ps.maxRaw}</span>
          </div>
          <div className="p-6">
            <RadioQuestionGroup
              questions={ps.questions}
              answers={psAnswers}
              onChange={handlePsChange}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderContextStep = () => (
    <div className="space-y-6">
      <div className="bg-[#FFF8E6] border border-[#86BC25] rounded-lg p-4">
        <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#86BC25]" />
          Dimension 4 – Context & Location Risk
        </h3>
        <p className="text-sm text-slate-700">
          Assess the external context and location-specific risk factors. Scores
          are normalised to 0–5 and carry 15% of the total weight.
        </p>
      </div>
      <RadioQuestionGroup
        questions={contextQuestions}
        answers={ctxAnswers}
        onChange={handleCtxChange}
      />
    </div>
  );

  const renderClientStep = () => (
    <div className="space-y-6">
      <div className="bg-[#FFF8E6] border border-[#86BC25] rounded-lg p-4">
        <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#86BC25]" />
          Dimension 5 – Client Track Record
        </h3>
        <p className="text-sm text-slate-700">
          Evaluate the client's historical E&S performance and capacity. Scores
          are normalised to 0–5 and carry 10% of the total weight.
        </p>
      </div>
      <RadioQuestionGroup
        questions={clientTrackRecordQuestions}
        answers={ctrAnswers}
        onChange={handleCtrChange}
      />
    </div>
  );

  // ── Result page ────────────────────────────────────────────────────────────

  const renderResult = () => {
    if (!scoringResult) return null;
    const {
      D1,
      D2,
      D3,
      D4,
      D5,
      composite,
      category,
      escalationReasons,
      psScores,
      requiredActions,
    } = scoringResult;

    const dimensions = [
      {
        label: "D1 – Sector Risk",
        dim: D1,
        weight: DIMENSION_WEIGHTS.D1,
        color: "bg-indigo-500",
      },
      {
        label: "D2 – Project Characteristics",
        dim: D2,
        weight: DIMENSION_WEIGHTS.D2,
        color: "bg-sky-500",
      },
      {
        label: "D3 – PS Questionnaire",
        dim: D3,
        weight: DIMENSION_WEIGHTS.D3,
        color: "bg-amber-500",
      },
      {
        label: "D4 – Context & Location",
        dim: D4,
        weight: DIMENSION_WEIGHTS.D4,
        color: "bg-teal-500",
      },
      {
        label: "D5 – Client Track Record",
        dim: D5,
        weight: DIMENSION_WEIGHTS.D5,
        color: "bg-purple-500",
      },
    ];

    const catLabel =
      category === "A"
        ? "Category A — High Risk"
        : category === "B"
          ? "Category B — Medium Risk"
          : "Category C — Low Risk";

    return (
      <div className="space-y-8">
        {/* ── Top-level category card ───────────────────────────────────── */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
          <div className="bg-slate-900 px-6 py-4 border-b border-[#86BC25] flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">
              Risk Categorization Result
            </h3>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-[#86BC25] text-slate-900 rounded-lg hover:bg-[#76a821] transition-colors text-sm font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category badge */}
              <div
                className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-2 ${getCategoryStyles(
                  `Category ${category}`,
                )}`}
              >
                <AlertTriangle className="w-10 h-10" />
                <span className="text-2xl font-extrabold">{catLabel}</span>
              </div>
              {/* Composite score */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Composite Score
                </span>
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {composite.toFixed(2)}
                </span>
                <span className="text-sm text-slate-400">out of 5.00</span>
              </div>
              {/* Formula summary */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                  Weighted Formula
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono leading-relaxed">
                  (D1 × 0.15) + (D2 × 0.20) + (D3 × 0.40) + (D4 × 0.15) + (D5 ×
                  0.10)
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-2">
                  = {D1.weighted.toFixed(2)} + {D2.weighted.toFixed(2)} +{" "}
                  {D3.weighted.toFixed(2)} + {D4.weighted.toFixed(2)} +{" "}
                  {D5.weighted.toFixed(2)} ={" "}
                  <strong>{composite.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Dimension Breakdown ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 border-b border-[#86BC25]">
            <h3 className="font-bold text-lg text-white">
              Dimension Breakdown
            </h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Dimension
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Normalised (0–5)
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Weighted
                    </th>
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-48">
                      Bar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dimensions.map((d) => (
                    <tr
                      key={d.label}
                      className="border-b border-slate-100 dark:border-slate-700/50"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {d.label}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300">
                        {d.dim.normalised.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500">
                        {(d.weight * 100).toFixed(0)}%
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white">
                        {d.dim.weighted.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${d.color} transition-all duration-700`}
                            style={{
                              width: `${Math.min((d.dim.normalised / 5) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── D3 detail: PS scores ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-slate-900 px-6 py-4 border-b border-[#86BC25]">
            <h3 className="font-bold text-lg text-white">
              Performance Standard Scores (D3 Detail)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Severity (highest PS norm) = {D3.severity.toFixed(2)}{" "}
              &nbsp;|&nbsp; Breadth (triggered/total × 5) ={" "}
              {D3.breadth.toFixed(2)} &nbsp;|&nbsp; D3 = Severity × 0.70 +
              Breadth × 0.30 = {D3.normalised.toFixed(2)}
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {psScores.map((ps) => (
                <div
                  key={ps.id}
                  className={`rounded-lg border p-4 ${
                    ps.triggered
                      ? "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      : "border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {ps.id.toUpperCase()}
                    </span>
                    {ps.triggered ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        Triggered
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
                        Not Triggered
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {ps.normalised.toFixed(2)}
                    <span className="text-sm font-normal text-slate-400">
                      {" "}
                      / 5
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Raw: {ps.rawTotal} / {ps.maxRaw}
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        ps.normalised >= 3.5
                          ? "bg-red-500"
                          : ps.normalised >= 2
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${(ps.normalised / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Escalation alerts ─────────────────────────────────────────── */}
        {escalationReasons.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5" />
              Auto-Escalation Alerts
            </h4>
            <ul className="space-y-2">
              {escalationReasons.map((reason, i) => (
                <li
                  key={i}
                  className="text-sm text-red-700 dark:text-red-300 flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Required actions ──────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            Required Actions — Category {category}
          </h3>
          <ul className="space-y-3">
            {requiredActions.map((action, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
              >
                <CheckCircle className="w-5 h-5 text-[#86BC25] flex-shrink-0 mt-0.5" />
                {action}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Submit for approval ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
            Submission & Approval
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Review the scoring results above. If correct, submit for approval by
            a senior risk officer.
          </p>
          <button
            onClick={openModal}
            className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold shadow-lg shadow-slate-900/20 cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 mr-2 text-[#86BC25]" />
            Submit for Approval
          </button>
        </div>
      </div>
    );
  };

  // ── Sub-step content switch ────────────────────────────────────────────────

  const renderContent = () => {
    switch (subStep) {
      case 0:
        return renderSectorStep();
      case 1:
        return renderProjectCharacteristics();
      case 2:
        return renderPreAssessment();
      case 3:
        return renderPSDetailedQuestions();
      case 4:
        return renderContextStep();
      case 5:
        return renderClientStep();
      case 6:
        return renderResult();
      default:
        return null;
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Risk Categorization
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Step 2: 5-Dimension Weighted Scoring Model (IFC Performance
            Standards)
          </p>
        </div>
        <button
          onClick={handleDemoAutoFill}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#86BC25] to-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          Demo Auto-Fill
        </button>
      </div>

      <ProgressBar currentStep={2} totalSteps={5} />

      {/* Sub-step navigator */}
      <div className="flex flex-wrap gap-1 bg-white dark:bg-slate-800 rounded-xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-700">
        {SUB_STEPS.map((s) => {
          const Icon = s.icon;
          const active = subStep === s.id;
          const complete = s.id < subStep;
          return (
            <button
              key={s.id}
              onClick={() => setSubStep(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                active
                  ? "bg-slate-900 text-white shadow-md"
                  : complete
                    ? "text-[#86BC25] hover:bg-slate-50 dark:hover:bg-slate-700"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${active ? "text-[#86BC25]" : ""}`}
              />
              <span className="hidden sm:inline">{s.label}</span>
              {complete && <CheckCircle className="w-3 h-3 text-[#86BC25]" />}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Navigation */}
      {subStep < 6 && (
        <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setSubStep((s) => Math.max(0, s - 1))}
            disabled={subStep === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium text-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={() => setSubStep((s) => Math.min(6, s + 1))}
            disabled={!isSubStepComplete(subStep)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm cursor-pointer shadow-lg shadow-slate-900/20"
          >
            {subStep === 5 ? "Compute Result" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ApproverModal
        showModal={showModal}
        selectedApprover={selectedApprover}
        expectedCompletionDate={expectedCompletionDate}
        notificationSent={notificationSent}
        approverOptions={step3Approvers}
        onClose={closeModal}
        onSubmit={handleFinalSubmit}
        onApproverChange={setSelectedApprover}
        onDateChange={setExpectedCompletionDate}
        title="Submit for Approval"
        subtitle="Choose approver for categorization review"
      />
    </div>
  );
};

export default CategorizationStep;
