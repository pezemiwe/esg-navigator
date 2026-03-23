const fs = require("fs");
const file =
  "C:/Users/pezemiwe/Documents/gcb-esg-navigator/src/features/materiality/MaterialityDashboard.tsx";
let code = fs.readFileSync(file, "utf8");

// Add hooks
code = code.replace(
  `    internalApproveMaterialityAssessment,
    rejectMaterialityAssessment,
  } = useSustainabilityStore(
    useShallow((state) => ({`,
  `    managerApproveMaterialityAssessment,
    internalApproveMaterialityAssessment,
    approveMaterialityAssessment,
    rejectMaterialityAssessment,
  } = useSustainabilityStore(
    useShallow((state) => ({
      managerApproveMaterialityAssessment: state.managerApproveMaterialityAssessment,
      approveMaterialityAssessment: state.approveMaterialityAssessment,`,
);

// We want to dynamically select the right panel for the user's role
const panelsReplacement = `
        {/* Assessment-level approval panel */}
        {((materialityApproval.status === "pending_manager" && user?.role === UserRole.SUSTAINABILITY_MANAGER) ||
          (materialityApproval.status === "pending_internal" && user?.role === UserRole.SUSTAINABILITY_APPROVER) ||
          (materialityApproval.status === "pending_board" && user?.role === UserRole.EXECUTIVE)) && (
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
                <Typography variant="subtitle1" fontWeight={700} color="warning.dark">
                  Materiality Assessment Pending Your Review
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Submitted by <strong>{materialityApproval.submittedBy}</strong>. 
                Review the {topics.length} material topic{topics.length !== 1 ? "s" : ""} below, then approve or return for revision.
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
                    if (user?.role === UserRole.SUSTAINABILITY_MANAGER) {
                       managerApproveMaterialityAssessment(user?.name ?? "Manager", reviewComment || undefined);
                    } else if (user?.role === UserRole.SUSTAINABILITY_APPROVER) {
                       internalApproveMaterialityAssessment(user?.name ?? "Internal Audit", reviewComment || undefined);
                    } else if (user?.role === UserRole.EXECUTIVE) {
                       approveMaterialityAssessment(user?.name ?? "Board", reviewComment || undefined);
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
                    rejectMaterialityAssessment(user?.name ?? "Reviewer", reviewComment || "Needs revision");
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

        {(
          (materialityApproval.status === "pending_manager" && user?.role !== UserRole.SUSTAINABILITY_MANAGER) ||
          (materialityApproval.status === "pending_internal" && user?.role !== UserRole.SUSTAINABILITY_APPROVER) ||
          (materialityApproval.status === "pending_board" && user?.role !== UserRole.EXECUTIVE)
        ) && materialityApproval.status !== "none" && materialityApproval.status !== "approved" && materialityApproval.status !== "rejected" && (
          <Alert severity="info" sx={{ mb: 3 }} icon={<Clock size={18} />}>
            Assessment is currently in review stage: {materialityApproval.status.replace("pending_", "").toUpperCase()}.
          </Alert>
        )}
`;

code = code.replace(
  /\{\/\* Assessment-level approval panel \*\/\}[\s\S]*?\{\/\* Summary chips \*\/\}/s,
  panelsReplacement + "\n        {/* Summary chips */}",
);

// Per topic approval buttons logic
const buttonLogicRepl = `
                    {((topic.approvalStatus === "Submitted" && user?.role === UserRole.SUSTAINABILITY_MANAGER) ||
                      (topic.approvalStatus === "Manager Approved" && user?.role === UserRole.SUSTAINABILITY_APPROVER) ||
                      (topic.approvalStatus === "Internal Audit Approved" && user?.role === UserRole.EXECUTIVE)) && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => onApprove(topic.id)}
                          sx={{ textTransform: "none", minWidth: 90 }}
                        >
                          Approve ({user.role.split("_")[0]})
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => onReject(topic.id)}
                          sx={{ textTransform: "none" }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
`;
code = code.replace(
  /\{topic\.approvalStatus === "Submitted" && \([\s\S]*?<\/>\n\s*\)\}/s,
  buttonLogicRepl,
);

// Main dashboard routing logic
const routingLogicRepl = `
  const role = user?.role as UserRole | undefined;
  const isDataOwner = role === UserRole.DATA_OWNER;
  const isApprover = role === UserRole.SUSTAINABILITY_APPROVER || role === UserRole.SUSTAINABILITY_MANAGER || role === UserRole.EXECUTIVE;

  const selectedTopics = useMemo(
    () => topics.filter((t) => t.selected),
    [topics],
  );

  // For manager, they might need to see the ManagerView. We'll show ApproverView if there are topics pending their role, or if they explicitly want to review. 
  // For simplicity, if they aren't DataOwner, let's just let ApproverView handle things IF it's in a pending approval state. Otherwise fallback to ManagerView.
  const { materialityApproval } = useSustainabilityStore(state => ({ materialityApproval: state.materialityApproval }));
  
  const showApproverView = isApprover && (
    (role === UserRole.SUSTAINABILITY_MANAGER && (!isDataOwner || materialityApproval.status === "pending_manager" || topics.some(t => t.approvalStatus === "Submitted"))) ||
    (role === UserRole.SUSTAINABILITY_APPROVER) ||
    (role === UserRole.EXECUTIVE)
  );

  if (showApproverView) {
    return (
      <ApproverView
        topics={selectedTopics}
        onApprove={(id) => approveTopic(id, role)}
        onReject={rejectTopic}
      />
    );
  }

  const topicsForUser = isDataOwner
    ? selectedTopics.filter((t) => t.assignedUserId === user?.name)
    : selectedTopics;

  return <ManagerView topics={topicsForUser} isDataOwner={isDataOwner} />;      
`;
code = code.replace(
  /  const role = user\?\.role as UserRole \| undefined;[\s\S]*?return <ManagerView topics=\{topicsForUser\} isDataOwner=\{isDataOwner\} \/>;[\s\S]*?$/s,
  routingLogicRepl + "\n}\n",
);

fs.writeFileSync(file, code, "utf8");
