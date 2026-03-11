const fs = require("fs");
const file = "C:/Users/pezemiwe/Documents/gcb-esg-navigator/src/features/materiality/MaterialityDashboard.tsx";
let data = fs.readFileSync(file, "utf8");
data = data.replace(`  const approved = topics.filter((t) => t.approvalStatus === "Approved");`, `  const approved = topics.filter((t) => t.approvalStatus?.includes("Approved"));`)
.replace(`    if (topic.approvalStatus === "Approved")
      return (
        <Chip
          icon={<CheckCircle size={14} />}
          label="Approved"`, `    if (topic.approvalStatus?.includes("Approved"))
      return (
        <Chip
          icon={<CheckCircle size={14} />}
          label={topic.approvalStatus}`)
.replace(`    if (topic.approvalStatus === "Submitted")
      return (
        <Chip
          icon={<Clock size={14} />}
          label="Awaiting Review"`, `    if (topic.approvalStatus === "Submitted")
      return (
        <Chip
          icon={<Clock size={14} />}
          label="Awaiting Manager Review"`);
fs.writeFileSync(file, data, "utf8");
