import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Alert,
  Button,
  Chip,
  Stack,
  Paper,
  TextField,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Snackbar,
  Tooltip,
  Divider,
  InputAdornment,
  alpha,

} from "@mui/material";
import { useMaterialityStore } from "@/store/materialityStore";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { useShallow } from "zustand/react/shallow";
import { MaterialityTemplateList } from "./components/MaterialityTemplateList";
import { sampleUsers } from "@/config/sampleUsers";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  UserCheck,
  UserX,
  ClipboardList,
  Users,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  AlertTriangle,

  MapPin,

} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MaterialTopic } from "./types";
import { DELOITTE_COLORS } from "@/config/colors.config";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

// Priority data owners — must match login page order
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
  // Sort priority users to match PRIORITY_DATA_OWNERS order
  priority.sort(
    (a, b) =>
      PRIORITY_DATA_OWNERS.indexOf(a.name) -
      PRIORITY_DATA_OWNERS.indexOf(b.name),
  );
  return [...priority, ...rest];
}

// ---------------------------------------------------------------------------
// Approver view: TABLE layout for SM, Internal Audit, Board with approve/reject
// ---------------------------------------------------------------------------
function ApproverView({
  topics,
  onApprove,
  onReject,
}: {
  topics: MaterialTopic[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [reviewComment, setReviewComment] = useState("");
  const {
    materialityApproval,
    internalApproveMaterialityAssessment,
    approveMaterialityAssessment,
    rejectMaterialityAssessment,
  } = useSustainabilityStore(
    useShallow((state) => ({
      materialityApproval: state.materialityApproval,
      internalApproveMaterialityAssessment:
        state.internalApproveMaterialityAssessment,
      approveMaterialityAssessment: state.approveMaterialityAssessment,
      rejectMaterialityAssessment: state.rejectMaterialityAssessment,
    })),
  );
  const { user } = useAuthStore();
  const submitted = topics.filter((t) => t.approvalStatus === "Submitted");
  const approved = topics.filter((t) => t.approvalStatus?.includes("Approved"));
  const draft = topics.filter(
    (t) => !t.approvalStatus || t.approvalStatus === "Draft",
  );

  const roleTitle =
    user?.role === UserRole.SUSTAINABILITY_MANAGER
      ? "Data Submission Review"
      : user?.role === UserRole.SUSTAINABILITY_APPROVER
        ? "Internal Audit Review"
        : user?.role === UserRole.BOARD
          ? "Board Review"
          : "Data Submission Review";

  const roleDesc =
    user?.role === UserRole.SUSTAINABILITY_MANAGER
      ? "Review data submitted by data owners and approve or request revisions per topic."
      : user?.role === UserRole.SUSTAINABILITY_APPROVER
        ? "Conduct an independent review of approved topic data before escalating to the Board."
        : user?.role === UserRole.BOARD
          ? "Conduct final review and provide board-level approval for the materiality data."
          : "Review and approve data submissions.";

  const statusChip = (topic: MaterialTopic) => {
    if (topic.approvalStatus && topic.approvalStatus.includes("Approved"))
      return (
        <Tooltip
          title={topic.approvedBy ? `Approved by ${topic.approvedBy}` : ""}
        >
          <Chip
            icon={<CheckCircle size={14} />}
            label={`${topic.approvalStatus}${topic.approvedBy ? ` by ${topic.approvedBy}` : ""}`}
            color="success"
            size="small"
          />
        </Tooltip>
      );
    if (topic.approvalStatus === "Submitted")
      return (
        <Chip
          icon={<Clock size={14} />}
          label="Awaiting Review"
          color="warning"
          size="small"
        />
      );
    return (
      <Chip
        icon={<AlertCircle size={14} />}
        label="Not Submitted"
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 8 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          mb={4}
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {roleTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {roleDesc}
            </Typography>
          </Box>
        </Box>

        {/* Assessment-level approval panel */}
        {((materialityApproval.status === "pending_internal" &&
          user?.role === UserRole.SUSTAINABILITY_APPROVER) ||
          (materialityApproval.status === "pending_board" &&
            (user?.role === UserRole.BOARD ||
              user?.role === UserRole.ADMIN ||
              user?.role === UserRole.EXECUTIVE))) && (
          <Paper
            variant="outlined"
            sx={{
              mb: 3,
              p: 3,
              borderRadius: 2,
              borderColor: "warning.main",
              bgcolor: alpha("#f59e0b", 0.05),
            }}
          >
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <ShieldCheck size={18} color="#b45309" />
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="warning.dark"
                >
                  Materiality Assessment Pending Your Review
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Submitted by <strong>{materialityApproval.submittedBy}</strong>.
                Review the {topics.length} material topic
                {topics.length !== 1 ? "s" : ""} below, then approve or return
                for revision.
              </Typography>
              <TextField
                label="Comment (optional)"
                size="small"
                fullWidth
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Add a review note..."
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ShieldCheck size={16} />}
                  onClick={() => {
                    if (user?.role === UserRole.SUSTAINABILITY_APPROVER) {
                      internalApproveMaterialityAssessment(
                        user?.name ?? "Internal Audit",
                        reviewComment || undefined,
                      );
                    } else if (
                      user?.role === UserRole.BOARD ||
                      user?.role === UserRole.EXECUTIVE ||
                      user?.role === UserRole.ADMIN
                    ) {
                      approveMaterialityAssessment(
                        user?.name ?? "Board",
                        reviewComment || undefined,
                      );
                    }
                    setReviewComment("");
                  }}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Approve Assessment
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<XCircle size={16} />}
                  onClick={() => {
                    rejectMaterialityAssessment(
                      user?.name ?? "Reviewer",
                      reviewComment || "Needs revision",
                    );
                    setReviewComment("");
                  }}
                  sx={{ textTransform: "none" }}
                >
                  Return for Revision
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        {((materialityApproval.status === "pending_internal" &&
          user?.role !== UserRole.SUSTAINABILITY_APPROVER) ||
          (materialityApproval.status === "pending_board" &&
            user?.role !== UserRole.BOARD &&
            user?.role !== UserRole.ADMIN &&
            user?.role !== UserRole.EXECUTIVE)) &&
          (materialityApproval.status as string) !== "none" &&
          (materialityApproval.status as string) !== "approved" &&
          (materialityApproval.status as string) !== "rejected" && (
            <Alert severity="info" sx={{ mb: 3 }} icon={<Clock size={18} />}>
              Assessment is currently in review stage:{" "}
              {materialityApproval.status.replace("pending_", "").toUpperCase()}
              .
            </Alert>
          )}

        {/* Summary chips */}
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
          <Chip
            icon={<Clock size={14} />}
            label={`${submitted.length} Awaiting Review`}
            color="warning"
            variant="outlined"
          />
          <Chip
            icon={<CheckCircle size={14} />}
            label={`${approved.length} Approved`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<AlertCircle size={14} />}
            label={`${draft.length} Not Yet Submitted`}
            variant="outlined"
          />
        </Stack>

        {topics.length === 0 && (
          <Alert severity="info">
            No material topics have been selected yet. The Sustainability
            Manager must complete the scoring step first.
          </Alert>
        )}

        {/* TABLE VIEW for SM, Internal Audit, Board */}
        {topics.length > 0 && (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>
                    Topic
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>
                    Data Owner
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 130 }}>
                    Branch
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>
                    Approved By
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, minWidth: 200 }}
                    align="right"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topics.map((topic) => {
                  const canApproveThis =
                    (topic.approvalStatus === "Submitted" &&
                      user?.role === UserRole.SUSTAINABILITY_MANAGER) ||
                    (topic.approvalStatus === "Manager Approved" &&
                      user?.role === UserRole.SUSTAINABILITY_APPROVER) ||
                    (topic.approvalStatus === "Internal Audit Approved" &&
                      (user?.role === UserRole.BOARD ||
                        user?.role === UserRole.ADMIN ||
                        user?.role === UserRole.EXECUTIVE));

                  return (
                    <TableRow
                      key={topic.id}
                      sx={{
                        "&:hover": { bgcolor: alpha(BRAND, 0.03) },
                      }}
                    >
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {topic.name}
                          </Typography>
                          {topic.isCustom && (
                            <Chip
                              label="Custom"
                              size="small"
                              sx={{ fontSize: 10, height: 18 }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {topic.description.length > 60
                            ? topic.description.slice(0, 60) + "…"
                            : topic.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {topic.assignedUserId || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {topic.assignedBranch ? (
                          <Chip
                            icon={<MapPin size={12} />}
                            label={topic.assignedBranch}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: 11 }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{statusChip(topic)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {topic.approvedBy || "—"}
                        </Typography>
                        {topic.approvedAt && (
                          <Typography variant="caption" color="text.disabled">
                            {new Date(topic.approvedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {canApproveThis ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => onApprove(topic.id)}
                              sx={{
                                textTransform: "none",
                                minWidth: 80,
                                fontWeight: 700,
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => onReject(topic.id)}
                              sx={{ textTransform: "none", minWidth: 80 }}
                            >
                              Reject
                            </Button>
                          </Stack>
                        ) : topic.approvalStatus?.includes("Approved") ? (
                          <Chip
                            icon={<CheckCircle size={12} />}
                            label="Completed"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            Pending submission
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1,
        flex: "1 1 140px",
        minWidth: 130,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color, opacity: 0.85 }}>{icon}</Box>
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            color={color}
            lineHeight={1}
          >
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

// ---------------------------------------------------------------------------
// Manager / Admin / Champion view — full assignment dashboard
// ---------------------------------------------------------------------------
function ManagerView({
  topics,
  isDataOwner,
}: {
  topics: MaterialTopic[];
  isDataOwner: boolean;
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignee, setBulkAssignee] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [justAssigned, setJustAssigned] = useState<Set<string>>(new Set());

  const { assignTopic, bulkAssignTopics } = useMaterialityStore(
    useShallow((state) => ({
      assignTopic: state.assignTopic,
      bulkAssignTopics: state.bulkAssignTopics,
    })),
  );
  const { user } = useAuthStore();
  const { entityProfile } = useSustainabilityStore(
    useShallow((state) => ({ entityProfile: state.entityProfile })),
  );
  const branches = entityProfile.branchLocations || [];
  const sortedUsers = useMemo(() => getSortedUsers(), []);


  const totalCount = topics.length;
  const assignedCount = topics.filter((t) => !!t.assignedUserId).length;
  const unassignedCount = topics.filter((t) => !t.assignedUserId).length;
  const submittedCount = topics.filter(
    (t) =>
      t.approvalStatus === "Submitted" ||
      (t.approvalStatus && t.approvalStatus.includes("Approved")),
  ).length;

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "assigned"
            ? !!t.assignedUserId
            : statusFilter === "unassigned"
              ? !t.assignedUserId
              : statusFilter === "submitted"
                ? t.approvalStatus === "Submitted"
                : true;
      const matchOwner =
        ownerFilter === "all" ? true : t.assignedUserId === ownerFilter;
      return matchSearch && matchStatus && matchOwner;
    });
  }, [topics, search, statusFilter, ownerFilter]);

  const handleAssign = (topicId: string, userId: string) => {
    assignTopic(topicId, userId, user?.name ?? "Manager", undefined);
    if (userId) {
      setJustAssigned((prev) => new Set([...prev, topicId]));
      setSnackMsg(`Assigned to ${userId}. Notification sent.`);
      setSnackOpen(true);
      setTimeout(() => {
        setJustAssigned((prev) => {
          const next = new Set(prev);
          next.delete(topicId);
          return next;
        });
      }, 2000);
    }
  };

  const handleAssignBranch = (topicId: string, branch: string) => {
    const topic = topics.find((t) => t.id === topicId);
    assignTopic(
      topicId,
      topic?.assignedUserId || "",
      user?.name ?? "Manager",
      branch,
    );
  };

  const handleBulkAssign = () => {
    if (!bulkAssignee || selectedIds.length === 0) return;
    bulkAssignTopics(
      selectedIds,
      bulkAssignee,
      user?.name ?? "Manager",
      undefined,
    );
    setSnackMsg(
      `${selectedIds.length} topic(s) assigned to ${bulkAssignee}. Notifications sent.`,
    );
    setSnackOpen(true);
    setJustAssigned(new Set(selectedIds));
    setSelectedIds([]);
    setBulkAssignee("");
    setTimeout(() => setJustAssigned(new Set()), 2000);
  };

  const handleToggleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? filteredTopics.map((t) => t.id) : []);

  const allSelected =
    filteredTopics.length > 0 &&
    filteredTopics.every((t) => selectedIds.includes(t.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Data Owner: simplified view
  if (isDataOwner) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box mb={3}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Data Collection
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter data for the material topics assigned to you.
          </Typography>
          {/* Escalation alerts for data owners */}
          {topics.filter(
            (t) => !t.approvalStatus || t.approvalStatus === "Draft",
          ).length > 0 && (
            <Alert
              severity="warning"
              sx={{ mt: 2 }}
              icon={<AlertTriangle size={18} />}
            >
              <strong>Deadline Reminder:</strong> You have{" "}
              {
                topics.filter(
                  (t) => !t.approvalStatus || t.approvalStatus === "Draft",
                ).length
              }{" "}
              topic(s) pending submission. Please submit before the quarterly
              deadline to avoid escalation.
            </Alert>
          )}
        </Box>
        {topics.length === 0 ? (
          <Alert severity="info">
            No topics have been assigned to you yet.
          </Alert>
        ) : (
          <MaterialityTemplateList topics={topics} />
        )}

        {/* Navigate to Reporting */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/sustainability/report")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#86BC25",
              "&:hover": { bgcolor: "#6ea01e" },
              borderRadius: 2,
              px: 4,
            }}
          >
            Proceed to Reporting
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", pb: 8 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          mb={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Data Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Assign responsible persons and collect data for {totalCount}{" "}
              material topics.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate("/sustainability/risks/scoring")}
            sx={{ textTransform: "none" }}
          >
            Back to Scoring
          </Button>
        </Box>

        {totalCount === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No topics selected. Please go back to Scoring to select your
            material topics.
          </Alert>
        )}

        {/* ── Assignment Management ── */}
        {/* Stats Row */}
        <Stack direction="row" spacing={2} flexWrap="wrap" mb={3}>
          <StatCard
            label="Total Topics"
            value={totalCount}
            color={BRAND}
            icon={<Users size={20} />}
          />
          <StatCard
            label="Assigned"
            value={assignedCount}
            color="#22c55e"
            icon={<UserCheck size={20} />}
          />
          <StatCard
            label="Unassigned"
            value={unassignedCount}
            color="#f59e0b"
            icon={<UserX size={20} />}
          />
          <StatCard
            label="Submitted"
            value={submittedCount}
            color="#3b82f6"
            icon={<ClipboardList size={20} />}
          />
        </Stack>

        {/* Search + Filter + Bulk Assign */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ sm: "center" }}
            flexWrap="wrap"
          >
            <TextField
              size="small"
              placeholder="Search risks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 240 }}
            />
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="unassigned">Unassigned</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Owner"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All Owners</MenuItem>
              {sortedUsers.map((u) => (
                <MenuItem key={u.email} value={u.name}>
                  {u.name}
                </MenuItem>
              ))}
            </TextField>
            {selectedIds.length > 0 && (
              <>
                <Divider orientation="vertical" flexItem />
                <Chip
                  label={`${selectedIds.length} selected`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <TextField
                  select
                  size="small"
                  label="Assign selected to"
                  value={bulkAssignee}
                  onChange={(e) => setBulkAssignee(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  {sortedUsers.map((u) => (
                    <MenuItem key={u.email} value={u.name}>
                      {u.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleBulkAssign}
                  disabled={!bulkAssignee}
                  sx={{
                    bgcolor: BRAND,
                    color: "#000",
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": { bgcolor: alpha(BRAND, 0.85) },
                    "&.Mui-disabled": { bgcolor: alpha(BRAND, 0.3) },
                  }}
                >
                  Assign ({selectedIds.length})
                </Button>
                <Button
                  size="small"
                  onClick={() => setSelectedIds([])}
                  sx={{ textTransform: "none" }}
                >
                  Clear
                </Button>
              </>
            )}
          </Stack>
        </Paper>

        {/* Risk Register Table */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, mb: 3 }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell padding="checkbox" sx={{ width: 48 }}>
                  <Tooltip title="Select all visible">
                    <Checkbox
                      indeterminate={someSelected}
                      checked={allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      size="small"
                    />
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>
                  Risk / Topic
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>
                  Description
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 210 }}>
                  Data Owner
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 160 }}>
                  Branch
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 130 }}>
                  Assignment
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>
                  Data Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTopics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      No topics match your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTopics.map((topic) => {
                  const isFlash = justAssigned.has(topic.id);
                  const dataStatus = topic.approvalStatus || "Draft";
                  const statusColor = dataStatus.includes("Approved")
                    ? ("success" as const)
                    : dataStatus === "Submitted"
                      ? ("warning" as const)
                      : ("default" as const);
                  return (
                    <TableRow
                      key={topic.id}
                      sx={{
                        bgcolor: isFlash ? alpha(BRAND, 0.07) : "inherit",
                        transition: "background-color 0.6s ease",
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(topic.id)}
                          onChange={() => handleToggleSelect(topic.id)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {topic.name}
                          </Typography>
                          {topic.isCustom && (
                            <Chip
                              label="Custom"
                              size="small"
                              sx={{ fontSize: 10, height: 18 }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {topic.description.length > 70
                            ? topic.description.slice(0, 70)
                            : topic.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {isFlash && topic.assignedUserId && (
                            <CheckCircle2
                              size={15}
                              color={BRAND}
                              style={{ flexShrink: 0 }}
                            />
                          )}
                          <TextField
                            select
                            size="small"
                            value={topic.assignedUserId || ""}
                            onChange={(e) =>
                              handleAssign(topic.id, e.target.value)
                            }
                            sx={{ minWidth: 165 }}
                          >
                            <MenuItem value="">
                              <em>Unassigned</em>
                            </MenuItem>
                            {sortedUsers.map((u) => (
                              <MenuItem key={u.email} value={u.name}>
                                {u.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={topic.assignedBranch || ""}
                          onChange={(e) =>
                            handleAssignBranch(topic.id, e.target.value)
                          }
                          sx={{ minWidth: 140 }}
                        >
                          <MenuItem value="">
                            <em>HQ</em>
                          </MenuItem>
                          {branches.map((b) => (
                            <MenuItem key={b.id} value={b.name}>
                              {b.name} ({b.state})
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            topic.assignedUserId ? "Assigned" : "Unassigned"
                          }
                          size="small"
                          color={topic.assignedUserId ? "success" : "default"}
                          variant={topic.assignedUserId ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={dataStatus}
                          size="small"
                          color={statusColor}
                          variant={
                            dataStatus === "Draft" ? "outlined" : "filled"
                          }
                          icon={
                            dataStatus.includes("Approved") ? (
                              <CheckCircle size={12} />
                            ) : dataStatus === "Submitted" ? (
                              <Clock size={12} />
                            ) : undefined
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Navigate to Reporting */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="contained"
            onClick={() => navigate("/sustainability/report")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#86BC25",
              "&:hover": { bgcolor: "#6ea01e" },
              borderRadius: 2,
              px: 4,
            }}
          >
            Proceed to Reporting
          </Button>
        </Box>
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message={snackMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard — routes to role-appropriate view
// ---------------------------------------------------------------------------
export default function MaterialityDashboard() {
  const { topics, approveTopic, rejectTopic } = useMaterialityStore(
    useShallow((state) => ({
      topics: state.topics,
      approveTopic: state.approveTopic,
      rejectTopic: state.rejectTopic,
    })),
  );
  const { user } = useAuthStore();

  const role = user?.role as UserRole | undefined;
  const isDataOwner = role === UserRole.DATA_OWNER;
  const isApprover =
    role === UserRole.SUSTAINABILITY_APPROVER ||
    role === UserRole.BOARD ||
    role === UserRole.SUSTAINABILITY_MANAGER ||
    role === UserRole.EXECUTIVE ||
    role === UserRole.ADMIN;

  const selectedTopics = useMemo(
    () => topics.filter((t) => t.selected),
    [topics],
  );

  // Show ApproverView for approver/admin roles, or for managers when topics are awaiting their review.
  const showApproverView =
    isApprover &&
    (role === UserRole.SUSTAINABILITY_APPROVER ||
      role === UserRole.BOARD ||
      role === UserRole.EXECUTIVE ||
      role === UserRole.ADMIN ||
      (role === UserRole.SUSTAINABILITY_MANAGER &&
        topics.some((t) => t.approvalStatus === "Submitted")));

  if (showApproverView) {
    return (
      <ApproverView
        topics={selectedTopics}
        onApprove={(id) => approveTopic(id, role, user?.name)}
        onReject={rejectTopic}
      />
    );
  }

  const topicsForUser = isDataOwner
    ? selectedTopics.filter((t) => t.assignedUserId === user?.name)
    : selectedTopics;

  return <ManagerView topics={topicsForUser} isDataOwner={isDataOwner} />;
}
