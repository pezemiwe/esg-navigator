export const UserRole = {
  ADMIN: "admin",
  ESG_MANAGER: "esg_manager",
  RISK_ANALYST: "risk_analyst",
  PORTFOLIO_MANAGER: "portfolio_manager",
  EXECUTIVE: "executive",
  DATA_ENTRY: "data_entry",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Permission = {
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_CRA_DATA: "view_cra_data",
  UPLOAD_DATA: "upload_data",
  EDIT_DATA: "edit_data",
  DELETE_DATA: "delete_data",
  RUN_ANALYSIS: "run_analysis",
  CONFIGURE_RISK: "configure_risk",
  GENERATE_REPORTS: "generate_reports",
  EXPORT_DATA: "export_data",
  MANAGE_USERS: "manage_users",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  SYSTEM_CONFIG: "system_config",
} as const;
export type Permission = (typeof Permission)[keyof typeof Permission];

export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
    Permission.UPLOAD_DATA,
    Permission.EDIT_DATA,
    Permission.DELETE_DATA,
    Permission.RUN_ANALYSIS,
    Permission.CONFIGURE_RISK,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.SYSTEM_CONFIG,
  ],
  [UserRole.ESG_MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
    Permission.UPLOAD_DATA,
    Permission.EDIT_DATA,
    Permission.DELETE_DATA,
    Permission.RUN_ANALYSIS,
    Permission.CONFIGURE_RISK,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.RISK_ANALYST]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
    Permission.RUN_ANALYSIS,
    Permission.CONFIGURE_RISK,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.PORTFOLIO_MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
    Permission.EXPORT_DATA,
  ],
  [UserRole.EXECUTIVE]: [
    Permission.VIEW_DASHBOARD,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.DATA_ENTRY]: [
    Permission.VIEW_CRA_DATA,
    Permission.UPLOAD_DATA,
    Permission.EDIT_DATA,
  ],
};

export const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "System Administrator",
  [UserRole.ESG_MANAGER]: "ESG Manager",
  [UserRole.RISK_ANALYST]: "Climate Risk Analyst",
  [UserRole.PORTFOLIO_MANAGER]: "Portfolio Manager",
  [UserRole.EXECUTIVE]: "Executive",
  [UserRole.DATA_ENTRY]: "Data Entry Specialist",
};

export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Full system access with user management capabilities",
  [UserRole.ESG_MANAGER]:
    "Complete climate risk assessment and reporting access",
  [UserRole.RISK_ANALYST]:
    "Analysis and reporting capabilities without data modification",
  [UserRole.PORTFOLIO_MANAGER]: "Portfolio viewing and export capabilities",
  [UserRole.EXECUTIVE]: "Dashboard and report viewing access",
  [UserRole.DATA_ENTRY]: "Data upload and management capabilities only",
};
