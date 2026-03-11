export const getRiskBadgeColor = (risk: string): string => {
  switch (risk) {
    case "A":
      return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case "B":
      return "bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case "C":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    default:
      return "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
};

export const getDecisionColor = (decision: string): string => {
  switch (decision) {
    case "Approve":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    case "Approve with Conditions":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case "Reject":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    case "Escalate":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
};

export const getAppraisalDecisionColor = (decision: string): string => {
  switch (decision) {
    case "Approve":
      return "bg-emerald-50/50 border-emerald-200";
    case "Approve with Conditions":
      return "bg-amber-50/50 border-amber-200";
    case "Reject":
      return "bg-red-50/50 border-red-200";
    case "Escalate":
      return "bg-purple-50/50 border-purple-200";
    default:
      return "bg-slate-50 border-slate-200";
  }
};

export const getHeaderColor = (decision: string): string => {
  switch (decision) {
    case "Approve":
      return "border-l-4 border-emerald-500";
    case "Approve with Conditions":
      return "border-l-4 border-amber-500";
    case "Reject":
      return "border-l-4 border-red-500";
    case "Escalate":
      return "border-l-4 border-purple-500";
    default:
      return "border-l-4 border-slate-500";
  }
};

export const getRecommendationColor = (category: string): string => {
  switch (category) {
    case "Excluded":
      return "text-red-700 bg-red-50 border-red-200";
    case "Category A":
      return "text-red-700 bg-red-50 border-red-200";
    case "Category B":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "Category C":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200";
  }
};

export const getCategoryStyles = (category: string): string => {
  switch (category) {
    case "Category A":
      return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800";
    case "Category B":
      return "text-[#86BC25] bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800";
    case "Category C":
      return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800";
    default:
      return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700";
  }
};

export const getUserStatusColor = (status: string): string => {
  switch (status) {
    case "Active":
      return "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
    case "Inactive":
      return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
    case "Suspended":
      return "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

export const getActionColor = (action: string): string => {
  if (action.includes("Created") || action.includes("Added"))
    return "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
  if (action.includes("Updated") || action.includes("Modified"))
    return "bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
  if (action.includes("Deleted") || action.includes("Removed"))
    return "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  if (action.includes("Downloaded") || action.includes("Exported"))
    return "bg-indigo-50 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400";
  return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
};

export const getMonitoringStatusColor = (status: string): string => {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "In Progress":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Pending":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "Overdue":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "High":
      return "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800";
    case "Medium":
      return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/20 dark:border-amber-800";
    case "Low":
      return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800";
    default:
      return "text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700";
  }
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
