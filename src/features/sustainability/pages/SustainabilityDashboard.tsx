import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronRight,
  ClipboardCheck,
  Network,
  ListChecks,
  BookOpen,
  BarChart2,
  Building2,
  Users,
  Trash2,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Search,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import {
  useSustainabilityStore,
  type AssessmentProject,
} from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";

// ─── Phase definitions ────────────────────────────────────────────────────────
const PHASES = [
  { id: 1, label: "Governance Assessment", short: "Governance", icon: ClipboardCheck, route: "/sustainability/governance-assessment" },
  { id: 2, label: "Value Chain Assessment", short: "Value Chain", icon: Network, route: "/sustainability/value-chain" },
  { id: 3, label: "SRRO / CRRO Register", short: "SRRO", icon: ListChecks, route: "/sustainability/srro-register" },
  { id: 4, label: "Material Information", short: "Material Info", icon: BookOpen, route: "/sustainability/material-information" },
  { id: 5, label: "Materiality Scoring", short: "Scoring", icon: BarChart2, route: "/sustainability/materiality-scoring" },
] as const;

type PhaseStatus = "complete" | "active" | "pending";

interface PhaseState {
  status: PhaseStatus;
  detail: string;
}

function getPhaseStates(project: AssessmentProject): PhaseState[] {
  const ga = project.governanceAssessment;
  const vc = project.valueChain;

  const ph1Questions = Object.keys(ga.questions ?? {}).length;
  const ph1Complete = ph1Questions >= 18;
  const ph1Started = ga.clientName !== "" || ph1Questions > 0;

  const ph2Started = vc.businessModelDescription !== "" || (vc.activities?.length ?? 0) > 0;

  const ph3Started = project.srroItems.length > 0;
  const ph3Complete = project.srroItems.some((i) => i.includeInFinalList === "Yes");

  const ph4Started = project.phase4Entries.length > 0;

  const ph5Started = project.phase5Items.length > 0;
  const ph5Scored = project.phase5Items.filter((i) => i.metricScores?.length > 0).length;

  return [
    {
      status: ph1Complete ? "complete" : ph1Started ? "active" : "pending",
      detail: ph1Complete ? "All 18 questions answered" : ph1Questions > 0 ? `${ph1Questions}/18 questions` : ga.clientName ? "Details captured" : "Not started",
    },
    {
      status: ph2Started ? "complete" : "pending",
      detail: ph2Started ? `${(vc.activities?.length ?? 0)} activities mapped` : "Not started",
    },
    {
      status: ph3Complete ? "complete" : ph3Started ? "active" : "pending",
      detail: ph3Complete ? `${project.srroItems.filter((i) => i.includeInFinalList === "Yes").length} items confirmed` : ph3Started ? `${project.srroItems.length} items identified` : "Not started",
    },
    {
      status: ph4Started ? "complete" : "pending",
      detail: ph4Started ? `${project.phase4Entries.length} SRRO entries mapped` : "Not started",
    },
    {
      status: ph5Scored > 0 ? "complete" : ph5Started ? "active" : "pending",
      detail: ph5Scored > 0 ? `${ph5Scored} items scored` : ph5Started ? "Scoring in progress" : "Not started",
    },
  ];
}

function getCompletion(phases: PhaseState[]): number {
  const weights = [0.25, 0.15, 0.2, 0.2, 0.2];
  return Math.round(
    phases.reduce((sum, ph, i) => {
      if (ph.status === "complete") return sum + weights[i] * 100;
      if (ph.status === "active") return sum + weights[i] * 50;
      return sum;
    }, 0),
  );
}

function getFirstIncompleteRoute(phases: PhaseState[]): string {
  const idx = phases.findIndex((p) => p.status !== "complete");
  return PHASES[idx === -1 ? 4 : idx].route;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Phase Pill ───────────────────────────────────────────────────────────────
function PhasePill({ phase, state, onClick }: { phase: typeof PHASES[number]; state: PhaseState; onClick: () => void }) {
  const Icon = phase.icon;
  const colors: Record<PhaseStatus, string> = {
    complete: "bg-[#f0f7e0] border-[#86bc25]/50 text-[#435e12]",
    active:   "bg-[#fffbeb] border-[#f59e0b]/50 text-[#92400e]",
    pending:  "bg-[#f4f4f4] border-[#e0e0e0] text-[#8d8d8d]",
  };
  const dotColors: Record<PhaseStatus, string> = {
    complete: "bg-[#86bc25]",
    active:   "bg-[#f59e0b]",
    pending:  "bg-[#c6c6c6]",
  };
  const iconEl: Record<PhaseStatus, React.ReactNode> = {
    complete: <CheckCircle2 className="w-3.5 h-3.5 text-[#86bc25]" />,
    active:   <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" />,
    pending:  <Circle className="w-3.5 h-3.5 text-[#c6c6c6]" />,
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-1.5 px-3 py-2.5 border transition-all hover:shadow-sm hover:-translate-y-px ${colors[state.status]}`}
      title={`Go to ${phase.label}`}
    >
      <div className="flex items-center gap-1.5 w-full">
        <span className={`text-[9px] font-black tracking-widest uppercase ${state.status === "complete" ? "text-[#86bc25]" : state.status === "active" ? "text-[#f59e0b]" : "text-[#c6c6c6]"}`}>
          Ph {phase.id}
        </span>
        <div className="ml-auto">{iconEl[state.status]}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 opacity-70 shrink-0" />
        <span className="text-[11px] font-semibold leading-tight">{phase.short}</span>
      </div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[state.status]}`} />
        <span className="text-[10px] leading-tight opacity-80">{state.detail}</span>
      </div>
    </button>
  );
}

// ─── Assessment Card ──────────────────────────────────────────────────────────
function AssessmentCard({
  project,
  isActive,
  onContinue,
  onDelete,
  onPhaseClick,
}: {
  project: AssessmentProject;
  isActive: boolean;
  onContinue: () => void;
  onDelete: () => void;
  onPhaseClick: (route: string) => void;
}) {
  const phases = getPhaseStates(project);
  const completion = getCompletion(phases);
  const ga = project.governanceAssessment;
  const clientName = ga.clientName || "Untitled Assessment";
  const isComplete = completion === 100;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`bg-white border transition-all ${isActive ? "border-[#86bc25]/60 shadow-sm shadow-[#86bc25]/10" : "border-[#e0e0e0] hover:border-[#d0d0d0]"}`}>
      {/* Active indicator stripe */}
      {isActive && <div className="h-0.5 bg-[#86bc25] w-full" />}

      <div className="px-6 py-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {isActive && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest uppercase text-[#86bc25] bg-[#f0f7e0] px-1.5 py-0.5 border border-[#86bc25]/30">
                  Active
                </span>
              )}
              {isComplete && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest uppercase text-white bg-[#86bc25] px-1.5 py-0.5">
                  Complete
                </span>
              )}
            </div>
            <h3 className="text-[16px] font-bold text-[#161616] leading-snug truncate">{clientName}</h3>
            <div className="flex items-center gap-2 mt-1">
              {ga.sector && <span className="text-[12px] text-[#525252]">{ga.sector}</span>}
              {ga.sector && ga.geography && <span className="text-[#c6c6c6]">·</span>}
              {ga.geography && <span className="text-[12px] text-[#525252]">{ga.geography}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-[22px] font-black text-[#161616] leading-none">{completion}%</div>
              <div className="text-[10px] text-[#8d8d8d] font-medium mt-0.5">complete</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-[#f4f4f4] mb-4">
          <div
            className="h-1 transition-all duration-700"
            style={{
              width: `${completion}%`,
              backgroundColor: completion === 100 ? "#86bc25" : completion > 50 ? "#f59e0b" : "#da1e28",
            }}
          />
        </div>

        {/* Phase pills */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {PHASES.map((phase, i) => (
            <PhasePill
              key={phase.id}
              phase={phase}
              state={phases[i]}
              onClick={() => onPhaseClick(phase.route)}
            />
          ))}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-[#f4f4f4]">
          <div className="flex items-center gap-4 text-[11px] text-[#8d8d8d]">
            {project.isGroupAssessment && project.assessmentEntities.length > 0 && (
              <span className="flex items-center gap-1.5 text-[#525252]">
                <Users className="w-3.5 h-3.5 text-[#86bc25]" />
                <strong className="text-[#161616]">{project.groupName || "Group"}</strong>
                · {project.assessmentEntities.length} {project.assessmentEntities.length === 1 ? "entity" : "entities"}
              </span>
            )}
            {project.isGroupAssessment && project.assessmentEntities.length === 0 && (
              <span className="flex items-center gap-1 text-[#8d8d8d]">
                <Building2 className="w-3.5 h-3.5" /> Group entity
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Created {formatDate(project.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              Last edit {timeAgo(project.updatedAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <>
                <span className="text-[11px] text-[#da1e28] font-medium">Delete this assessment?</span>
                <button
                  onClick={() => { onDelete(); setConfirmDelete(false); }}
                  className="text-[12px] font-semibold text-white bg-[#da1e28] px-3 py-1 hover:bg-[#b91c1c] transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[12px] font-semibold text-[#525252] px-3 py-1 border border-[#e0e0e0] hover:bg-[#f4f4f4] transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1.5 text-[#c6c6c6] hover:text-[#da1e28] hover:bg-[#fff1f1] transition-colors border border-transparent hover:border-[#ffb3b8]/50"
                  title="Delete assessment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onContinue}
                  className="flex items-center gap-2 bg-[#161616] text-white text-[12px] font-bold px-4 py-2 hover:bg-[#86bc25] transition-colors"
                >
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-[#f4f4f4] border border-[#e0e0e0] flex items-center justify-center mb-6">
        <FolderOpen className="w-8 h-8 text-[#8d8d8d]" />
      </div>
      <h3 className="text-[18px] font-bold text-[#161616] mb-2">No assessments yet</h3>
      <p className="text-[14px] text-[#525252] max-w-xs mb-8 leading-relaxed">
        Start a new materiality assessment to begin the 5-phase workflow for a client or organisation.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-2 bg-[#161616] text-white text-[13px] font-bold px-6 py-3 hover:bg-[#86bc25] transition-colors"
      >
        <Plus className="w-4 h-4" /> Start New Assessment
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SustainabilityDashboard() {
  const navigate = useNavigate();
  const {
    assessmentProjects,
    activeProjectId,
    governanceAssessment,
    saveCurrentProject,
    createNewProject,
    loadProject,
    deleteProject,
  } = useSustainabilityStore(
    useShallow((s) => ({
      assessmentProjects: s.assessmentProjects,
      activeProjectId: s.activeProjectId,
      governanceAssessment: s.governanceAssessment,
      saveCurrentProject: s.saveCurrentProject,
      createNewProject: s.createNewProject,
      loadProject: s.loadProject,
      deleteProject: s.deleteProject,
    })),
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "complete">("all");

  // On mount: save working state into active project (so list is up-to-date)
  useEffect(() => {
    if (activeProjectId) saveCurrentProject();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Migration: if there's data in working state but no project, auto-create one
  useEffect(() => {
    if (assessmentProjects.length === 0 && governanceAssessment.clientName !== "" && activeProjectId === null) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      useSustainabilityStore.setState((s) => ({
        assessmentProjects: [{
          id,
          createdAt: now,
          updatedAt: now,
          governanceAssessment: s.governanceAssessment,
          valueChain: s.valueChain,
          srroItems: s.srroItems,
          phase4Entries: s.phase4Entries,
          phase5Items: s.phase5Items,
          isGroupAssessment: s.isGroupAssessment,
          groupName: s.groupName,
          assessmentEntities: s.assessmentEntities,
          activeEntityId: s.activeEntityId,
          entitySnapshots: s.entitySnapshots,
          srroApproval: s.srroApproval,
          reportApproval: s.reportApproval,
        }],
        activeProjectId: id,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNew = () => {
    createNewProject();
    navigate("/sustainability/governance-assessment");
  };

  const handleContinue = (projectId: string) => {
    if (projectId !== activeProjectId) loadProject(projectId);
    const project = assessmentProjects.find((p) => p.id === projectId);
    if (!project) {
      navigate("/sustainability/governance-assessment");
      return;
    }
    const phases = getPhaseStates(project);
    navigate(getFirstIncompleteRoute(phases));
  };

  const handlePhaseClick = (projectId: string, route: string) => {
    if (projectId !== activeProjectId) loadProject(projectId);
    navigate(route);
  };

  // Stats
  const total = assessmentProjects.length;
  const inProgress = assessmentProjects.filter((p) => {
    const phases = getPhaseStates(p);
    const c = getCompletion(phases);
    return c > 0 && c < 100;
  }).length;
  const completed = assessmentProjects.filter((p) => getCompletion(getPhaseStates(p)) === 100).length;

  // Filtered list (most recent first)
  const filtered = assessmentProjects
    .filter((p) => {
      const name = (p.governanceAssessment.clientName || "").toLowerCase();
      const sector = (p.governanceAssessment.sector || "").toLowerCase();
      const q = search.toLowerCase();
      if (q && !name.includes(q) && !sector.includes(q)) return false;
      if (filter === "active") return getCompletion(getPhaseStates(p)) < 100 && getCompletion(getPhaseStates(p)) > 0;
      if (filter === "complete") return getCompletion(getPhaseStates(p)) === 100;
      return true;
    })
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="min-h-full bg-[#f4f4f4]">
      {/* ── Hero Header ── */}
      <div className="bg-white border-b border-[#e0e0e0]">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[#86bc25]" />
                <span className="text-[10px] font-black tracking-widest uppercase text-[#86bc25]">
                  ESG Navigator
                </span>
              </div>
              <h1 className="text-[28px] font-black text-[#161616] tracking-tight leading-tight">
                Materiality Assessment Workspace
              </h1>
              <p className="text-[14px] text-[#525252] mt-2 max-w-xl leading-relaxed">
                Manage sustainability assessments across clients and organisations. Each assessment follows a structured 5-phase methodology aligned to IFRS S1/S2 and SASB/GRI standards.
              </p>
            </div>
            <button
              onClick={handleNew}
              className="shrink-0 flex items-center gap-2.5 bg-[#161616] text-white text-[13px] font-bold px-6 py-3.5 hover:bg-[#86bc25] transition-colors group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              New Assessment
            </button>
          </div>

          {/* Stats strip */}
          {total > 0 && (
            <div className="flex items-center gap-0 mt-8 border border-[#e0e0e0] divide-x divide-[#e0e0e0] bg-[#f4f4f4]">
              {[
                { label: "Total Assessments", value: total, accent: false },
                { label: "In Progress", value: inProgress, accent: false },
                { label: "Completed", value: completed, accent: true },
              ].map((stat) => (
                <div key={stat.label} className="flex-1 px-6 py-4">
                  <div className={`text-[28px] font-black leading-none ${stat.accent ? "text-[#86bc25]" : "text-[#161616]"}`}>
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-semibold text-[#8d8d8d] uppercase tracking-wider mt-1">{stat.label}</div>
                </div>
              ))}
              <div className="flex-1 px-6 py-4">
                <div className="text-[28px] font-black text-[#161616] leading-none">
                  {total > 0 ? Math.round((completed / total) * 100) : 0}%
                </div>
                <div className="text-[11px] font-semibold text-[#8d8d8d] uppercase tracking-wider mt-1">Completion Rate</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Phase Guide Strip ── */}
      <div className="bg-white border-b border-[#e0e0e0]">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center gap-0 overflow-x-auto">
            {PHASES.map((ph, i) => {
              const Icon = ph.icon;
              return (
                <div key={ph.id} className="flex items-center shrink-0">
                  <div className="flex items-center gap-2 px-4 py-2">
                    <div className="w-5 h-5 bg-[#161616] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                      {ph.id}
                    </div>
                    <Icon className="w-3.5 h-3.5 text-[#8d8d8d]" />
                    <span className="text-[11px] font-semibold text-[#525252] whitespace-nowrap">{ph.short}</span>
                  </div>
                  {i < PHASES.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-[#c6c6c6] shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {total === 0 ? (
          <EmptyState onNew={handleNew} />
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8d8d8d]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by client or sector…"
                  className="w-full bg-white border border-[#e0e0e0] text-[13px] text-[#161616] pl-9 pr-3 py-2 outline-none focus:border-[#86bc25] transition-colors placeholder:text-[#c6c6c6]"
                />
              </div>
              <div className="flex items-center gap-0 border border-[#e0e0e0] bg-white divide-x divide-[#e0e0e0]">
                {(["all", "active", "complete"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 text-[12px] font-semibold capitalize transition-colors ${filter === f ? "bg-[#161616] text-white" : "text-[#525252] hover:bg-[#f4f4f4]"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <span className="text-[12px] text-[#8d8d8d] ml-auto">{filtered.length} assessment{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {/* Cards */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="bg-white border border-[#e0e0e0] py-12 text-center">
                  <p className="text-[14px] text-[#8d8d8d]">No assessments match your filter.</p>
                </div>
              ) : (
                filtered.map((project) => (
                  <AssessmentCard
                    key={project.id}
                    project={project}
                    isActive={project.id === activeProjectId}
                    onContinue={() => handleContinue(project.id)}
                    onDelete={() => deleteProject(project.id)}
                    onPhaseClick={(route) => handlePhaseClick(project.id, route)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
