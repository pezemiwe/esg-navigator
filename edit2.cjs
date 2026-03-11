const fs = require("fs");
const file =
  "C:/Users/pezemiwe/Documents/gcb-esg-navigator/src/features/materiality/MaterialityDashboard.tsx";
let data = fs.readFileSync(file, "utf8");
data = data.replace(
  `    const statusChip = (topic: MaterialTopic) => {
      if (topic.approvalStatus === "Approved")
        return (
          <Chip
            icon={<CheckCircle size={14} />}
            label="Approved"
            color="success"
            size="small"
          />
        );
      if (topic.approvalStatus === "Submitted")
        return (
          <Chip
            icon={<Clock size={14} />}
            label="Awaiting Review"
            color="warning"
            size="small"
          />
        );`,
  `    const statusChip = (topic: MaterialTopic) => {
      if (topic.approvalStatus?.includes("Approved"))
        return (
          <Chip
            icon={<CheckCircle size={14} />}
            label={topic.approvalStatus}
            color="success"
            size="small"
          />
        );
      if (topic.approvalStatus === "Submitted")
        return (
          <Chip
            icon={<Clock size={14} />}
            label="Awaiting Manager Review"
            color="warning"
            size="small"
          />
        );`,
);
fs.writeFileSync(file, data, "utf8");
// ----------------

let content2 = fs.readFileSync(file, "utf8");
content2 = content2.replace(
  `  const role = user?.role as UserRole | undefined;
  const isDataOwner = role === UserRole.DATA_OWNER;
  const isApprover = role === UserRole.SUSTAINABILITY_APPROVER;

  const selectedTopics = useMemo(
    () => topics.filter((t) => t.selected),
    [topics],
  );

  if (isApprover) {
    return (
      <ApproverView
        topics={selectedTopics}
        onApprove={(id) => approveTopic(id, role)}
        onReject={rejectTopic}
      />
    );
  }`,
  `  const role = user?.role as UserRole | undefined;
  const isDataOwner = role === UserRole.DATA_OWNER;
  const isApprover = role === UserRole.SUSTAINABILITY_APPROVER || role === UserRole.EXECUTIVE;
  // Let MANAGER see the ManagerView which also includes the "Submit" banners. Actually no, if we want them to approve topics, they need the ApproverView too.
  // But wait, managers assign topics. So Manager MUST use ManagerView, but can we put the approval button inside ManagerView?
  // Let's modify the Main dashboard: Manager needs both tab 0 (Assign/View) and perhaps we can just let manager approve directly from the table or add a tab.
  // Wait, the prompt says Manager approves it. If we route manager to ApproverView, they can't assign. 
`,
);
