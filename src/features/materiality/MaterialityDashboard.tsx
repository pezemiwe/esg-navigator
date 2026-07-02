import React, { useState, useMemo } from "react";
import { ConfirmModal } from "@/components/ui";
import { useMaterialityStore } from "@/store/materialityStore";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { useShallow } from "zustand/react/shallow";
import { MaterialityTemplateList } from "./components/MaterialityTemplateList";
import { sampleUsers } from "@/config/sampleUsers";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  UserCheck,
  ClipboardList,
  Users,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const PRIORITY_DATA_OWNERS = [
  "Amaka Obiora",
  "Tunde Fashola",
  "Chidinma Obi",
  "Babatunde Okafor",
];

function getSortedUsers() {
  const priority = sampleUsers.filter((u) =>
    PRIORITY_DATA_OWNERS.includes(u.name),
  );
  const rest = sampleUsers.filter(
    (u) => !PRIORITY_DATA_OWNERS.includes(u.name),
  );
  priority.sort(
    (a, b) =>
      PRIORITY_DATA_OWNERS.indexOf(a.name) -
      PRIORITY_DATA_OWNERS.indexOf(b.name),
  );
  return [...priority, ...rest];
}

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  icon: React.ElementType;
}
function StatCard({ label, value, color, icon: Icon }: StatCardProps) {
  return (
    <div className="flex-1 min-w-35 bg-white border border-slate-200 rounded-lg p-4 relative overflow-hidden flex items-center gap-4">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: color }}
      />
      <div
        className="opacity-80 p-2 rounded-full"
        style={{ backgroundColor: color + "1a", color }}
      >
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-extrabold leading-none" style={{ color }}>
          {value}
        </div>
        <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function MaterialityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const isDataOwner = role === UserRole.DATA_OWNER;
  const isApprover =
    role === UserRole.SUSTAINABILITY_APPROVER ||
    role === UserRole.BOARD ||
    role === UserRole.EXECUTIVE ||
    role === UserRole.ADMIN;

  const { topics, assignTopic, bulkAssignTopics } = useMaterialityStore(
    useShallow((state) => ({
      topics: state.topics,
      assignTopic: state.assignTopic,
      bulkAssignTopics: state.bulkAssignTopics,
    })),
  );

  const {
    materialityApproval,
    internalApproveMaterialityAssessment,
    approveMaterialityAssessment,
    rejectMaterialityAssessment,
    entityProfile,
  } = useSustainabilityStore(
    useShallow((state) => ({
      materialityApproval: state.materialityApproval,
      internalApproveMaterialityAssessment:
        state.internalApproveMaterialityAssessment,
      approveMaterialityAssessment: state.approveMaterialityAssessment,
      rejectMaterialityAssessment: state.rejectMaterialityAssessment,
      entityProfile: state.entityProfile,
    })),
  );

  const branches = entityProfile.branchLocations || [];
  const sortedUsers = useMemo(() => getSortedUsers(), []);

  const selectedTopics = useMemo(
    () => topics.filter((t) => t.selected),
    [topics],
  );
  const topicsForUser = isDataOwner
    ? selectedTopics.filter((t) => t.assignedUserId === user?.name)
    : selectedTopics;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [snackMsg, setSnackMsg] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false);

  const showApprovePanel =
    isApprover &&
    ((materialityApproval.status === "pending_internal" &&
      role === UserRole.SUSTAINABILITY_APPROVER) ||
      (materialityApproval.status === "pending_board" &&
        (role === UserRole.BOARD ||
          role === UserRole.ADMIN ||
          role === UserRole.EXECUTIVE)));

  const filteredTopics = topicsForUser.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (statusFilter !== "all") {
      if (statusFilter === "none" && t.approvalStatus) return false;
      if (statusFilter !== "none" && t.approvalStatus !== statusFilter)
        return false;
    }
    if (ownerFilter !== "all") {
      if (ownerFilter === "unassigned" && t.assignedUserId) return false;
      if (ownerFilter !== "unassigned" && t.assignedUserId !== ownerFilter)
        return false;
    }
    return true;
  });

  const handleBulkAssign = () => {
    if (!bulkAssignee || selectedIds.length === 0) return;
    bulkAssignTopics(selectedIds, bulkAssignee, user?.name || "System", "");
    setSelectedIds([]);
    setBulkAssignee("");
    setSnackMsg("Topics assigned successfully");
    setTimeout(() => setSnackMsg(""), 3000);
  };

  const getStatusBadge = (status: string | undefined, approver?: string) => {
    if (!status || status === "Draft") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold border border-slate-200 text-slate-500 bg-slate-50 relative">
          <AlertCircle size={12} /> Not Submitted
        </span>
      );
    }
    if (status === "Submitted") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={12} /> Awaiting Review
        </span>
      );
    }
    const val = approver ? "Approved by " + approver : "";
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
        title={val}
      >
        <CheckCircle size={12} /> {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Data Management
          </h1>
          <p className="text-slate-500 mt-1">
            Assign responsible persons, collect data, and review topic
            submissions.
          </p>
        </div>

        {snackMsg && (
          <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-sm font-medium">{snackMsg}</span>
          </div>
        )}

        {showApprovePanel && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-amber-800">
              <ShieldCheck size={20} />
              <h2 className="font-bold text-lg">
                Materiality Assessment Pending Your Review
              </h2>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Submitted by <strong>{materialityApproval.submittedBy}</strong>.
              Review the topics below, then approve or return for revision.
            </p>
            <input
              type="text"
              placeholder="Add a review note (optional)..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setApproveConfirmOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#86bc25] hover:bg-[#75a620] text-white font-semibold rounded-none text-sm transition-colors shadow-sm"
              >
                <ShieldCheck size={16} /> Approve Assessment
              </button>
              <button
                onClick={() => {
                  if (!reviewComment.trim()) {
                    alert("Please enter a review note explaining why the assessment is being returned.");
                    return;
                  }
                  setReturnConfirmOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold rounded-none text-sm transition-colors shadow-sm"
              >
                <XCircle size={16} /> Return for Revision
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <StatCard
            label="Total Topics"
            value={topicsForUser.length}
            color="#3b82f6"
            icon={ClipboardList}
          />
          <StatCard
            label="Assigned"
            value={topicsForUser.filter((t) => t.assignedUserId).length}
            color="#f59e0b"
            icon={UserCheck}
          />
          <StatCard
            label="Awaiting Review"
            value={
              topicsForUser.filter((t) => t.approvalStatus === "Submitted")
                .length
            }
            color="#8b5cf6"
            icon={Clock}
          />
          <StatCard
            label="Approved"
            value={
              topicsForUser.filter((t) =>
                t.approvalStatus?.includes("Approved"),
              ).length
            }
            color="#10b981"
            icon={CheckCircle2}
          />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#86bc25] focus:border-[#86bc25] transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#86bc25] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="none">Not Submitted</option>
            <option value="Submitted">Awaiting Review</option>
            <option value="Manager Approved">Manager Approved</option>
            <option value="Internal Audit Approved">Audit Approved</option>
          </select>
          {!isDataOwner && (
            <select
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#86bc25] cursor-pointer"
            >
              <option value="all">All Owners</option>
              <option value="unassigned">Unassigned</option>
              {sortedUsers.map((u) => (
                <option key={u.name} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {!isDataOwner && selectedIds.length > 0 && (
          <div className="bg-[#f4fadc] border border-[#86bc25]/40 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#435e12] font-semibold">
              <Users size={18} />
              <span>{selectedIds.length} topics selected</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                value={bulkAssignee}
                onChange={(e) => setBulkAssignee(e.target.value)}
                className="flex-1 sm:w-64 px-3 py-2 border border-[#86bc25]/30 rounded-lg text-sm focus:ring-[#86bc25] outline-none"
              >
                <option value="">Assign to...</option>
                {sortedUsers.map((u) => (
                  <option key={u.name} value={u.name}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkAssign}
                disabled={!bulkAssignee}
                className="px-5 py-2 bg-[#86bc25] hover:bg-[#75a61e] disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors whitespace-nowrap"
              >
                Apply Assignment
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-225">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs tracking-wider uppercase">
                  {!isDataOwner && (
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filteredTopics.length &&
                          filteredTopics.length > 0
                        }
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked
                              ? filteredTopics.map((t) => t.id)
                              : [],
                          )
                        }
                        className="w-4 h-4 text-[#86bc25] rounded border-slate-300 focus:ring-[#86bc25]"
                      />
                    </th>
                  )}
                  <th className="p-4 rounded-tl-xl text-slate-800">
                    Material Topic
                  </th>
                  <th className="p-4 w-52 text-slate-800">Data Owner</th>
                  {branches.length > 0 && (
                    <th className="p-4 w-40 text-slate-800">Location</th>
                  )}
                  <th className="p-4 w-48 text-slate-800">Status</th>
                  <th className="p-4 w-44 text-right rounded-tr-xl text-slate-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTopics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No topics found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTopics.map((topic) => (
                    <tr
                      key={topic.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {!isDataOwner && (
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(topic.id)}
                            onChange={(e) => {
                              if (e.target.checked)
                                setSelectedIds([...selectedIds, topic.id]);
                              else
                                setSelectedIds(
                                  selectedIds.filter((id) => id !== topic.id),
                                );
                            }}
                            className="w-4 h-4 text-[#86bc25] rounded border-slate-300 focus:ring-[#86bc25]"
                          />
                        </td>
                      )}
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {topic.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {topic.description}
                        </div>
                      </td>
                      <td className="p-4">
                        {isDataOwner ? (
                          <div className="font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase">
                              {user?.name?.charAt(0) || "U"}
                            </span>
                            {user?.name}
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              value={topic.assignedUserId || ""}
                              onChange={(e) =>
                                assignTopic(topic.id, e.target.value)
                              }
                              className="w-full appearance-none bg-transparent hover:bg-slate-50 border border-transparent hover:border-slate-200 px-3 py-1.5 pr-8 rounded-lg cursor-pointer outline-none focus:border-[#86bc25] focus:ring-1 focus:ring-[#86bc25] transition-all truncate"
                            >
                              <option value="">Unassigned</option>
                              {sortedUsers.map((u) => (
                                <option key={u.name} value={u.name}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={14}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                          </div>
                        )}
                      </td>
                      {branches.length > 0 && (
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="truncate">
                              {topic.assignedBranch || "HQ Level"}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="p-4">
                        {getStatusBadge(topic.approvalStatus, topic.approvedBy)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => navigate("/cra/data")}
                          className="px-3 py-1.5 bg-[#86bc25] hover:bg-[#75a61e] text-white text-xs font-bold rounded shadow-sm transition-colors whitespace-nowrap"
                        >
                          Enter Data
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-8">
          <MaterialityTemplateList topics={topics} />
        </div>
      </div>

      <ConfirmModal
        open={approveConfirmOpen}
        title="Approve assessment?"
        message="This will approve the materiality assessment. This action will be logged."
        confirmLabel="Approve"
        onConfirm={() => {
          if (role === UserRole.SUSTAINABILITY_APPROVER)
            internalApproveMaterialityAssessment(user?.name || "Internal Audit", reviewComment || undefined);
          else
            approveMaterialityAssessment(user?.name || "Board", reviewComment || undefined);
          setReviewComment("");
          setApproveConfirmOpen(false);
        }}
        onCancel={() => setApproveConfirmOpen(false)}
      />

      <ConfirmModal
        open={returnConfirmOpen}
        title="Return for revision?"
        message="The assessment will be sent back to the submitter with your review note."
        confirmLabel="Return"
        variant="danger"
        onConfirm={() => {
          rejectMaterialityAssessment(user?.name || "Reviewer", reviewComment);
          setReviewComment("");
          setReturnConfirmOpen(false);
        }}
        onCancel={() => setReturnConfirmOpen(false)}
      />
    </div>
  );
}
