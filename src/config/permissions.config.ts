export const UserRole = {
  ADMIN: "admin",
  ESG_MANAGER: "esg_manager",
  RISK_ANALYST: "risk_analyst",
  PORTFOLIO_MANAGER: "portfolio_manager",
  EXECUTIVE: "executive",
  DATA_ENTRY: "data_entry", // legacy — kept for backward compat
  SUSTAINABILITY_CHAMPION: "sustainability_champion",
  SUSTAINABILITY_MANAGER: "sustainability_manager",
  DATA_OWNER: "data_owner",
  SUSTAINABILITY_APPROVER: "sustainability_approver",
  BOARD: "board",
  ERM_TEAM: "erm_team",
  CLIENT: "client",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const roleModuleIds: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ["cra", "scenario", "sdg", "learning", "materia", "esrm"],
  [UserRole.ESG_MANAGER]: ["cra", "scenario", "sdg", "learning", "materia", "esrm"],
  [UserRole.RISK_ANALYST]: ["cra", "scenario", "learning"],
  [UserRole.PORTFOLIO_MANAGER]: ["cra", "scenario"],
  [UserRole.EXECUTIVE]: ["cra", "sdg", "materia"],
  [UserRole.DATA_ENTRY]: ["materia"],
  [UserRole.SUSTAINABILITY_CHAMPION]: ["learning", "materia"],
  [UserRole.SUSTAINABILITY_MANAGER]: ["learning", "materia"],
  [UserRole.DATA_OWNER]: ["materia"],
  [UserRole.SUSTAINABILITY_APPROVER]: ["materia"],
  [UserRole.BOARD]: ["materia"],
  [UserRole.ERM_TEAM]: ["cra", "scenario", "learning", "esrm"],
  [UserRole.CLIENT]: [],
};

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
  [UserRole.SUSTAINABILITY_CHAMPION]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.SUSTAINABILITY_MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
    Permission.UPLOAD_DATA,
    Permission.EDIT_DATA,
    Permission.RUN_ANALYSIS,
    Permission.CONFIGURE_RISK,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
  ],
  [UserRole.DATA_OWNER]: [
    Permission.VIEW_CRA_DATA,
    Permission.UPLOAD_DATA,
    Permission.EDIT_DATA,
  ],
  [UserRole.SUSTAINABILITY_APPROVER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.BOARD]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.ERM_TEAM]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
    Permission.UPLOAD_DATA,
    Permission.EDIT_DATA,
    Permission.RUN_ANALYSIS,
    Permission.CONFIGURE_RISK,
    Permission.GENERATE_REPORTS,
    Permission.EXPORT_DATA,
  ],
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
  [UserRole.CLIENT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_CRA_DATA,
  ],
};

export const roleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: "System Administrator",
  [UserRole.ESG_MANAGER]: "ESG Manager",
  [UserRole.RISK_ANALYST]: "Climate Risk Analyst",
  [UserRole.PORTFOLIO_MANAGER]: "Portfolio Manager",
  [UserRole.EXECUTIVE]: "Executive",
  [UserRole.DATA_ENTRY]: "Data Owner",
  [UserRole.SUSTAINABILITY_CHAMPION]: "Sustainability Champion",
  [UserRole.SUSTAINABILITY_MANAGER]: "Sustainability Manager",
  [UserRole.DATA_OWNER]: "Data Owner",
  [UserRole.SUSTAINABILITY_APPROVER]: "Internal Audit",
  [UserRole.BOARD]: "Board",
  [UserRole.ERM_TEAM]: "ERM Team",
  [UserRole.CLIENT]: "Client",
};

export const roleDescriptions: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Full system access with user management capabilities",
  [UserRole.ESG_MANAGER]: "Complete climate risk assessment and reporting access",
  [UserRole.RISK_ANALYST]: "Analysis and reporting capabilities without data modification",
  [UserRole.PORTFOLIO_MANAGER]: "Portfolio viewing and export capabilities",
  [UserRole.EXECUTIVE]: "Dashboard and report viewing access",
  [UserRole.DATA_ENTRY]: "Data upload and management capabilities only",
  [UserRole.SUSTAINABILITY_CHAMPION]:
    "Access to capacity building and materiality & sustainability reporting modules",
  [UserRole.SUSTAINABILITY_MANAGER]:
    "Manage materiality assessments, data collection, and sustainability reporting",
  [UserRole.DATA_OWNER]:
    "Data entry for risk register, data collection, and report setup",
  [UserRole.SUSTAINABILITY_APPROVER]:
    "Conduct independent review and authorise materiality assessments, data submissions, and reports",
  [UserRole.BOARD]:
    "Final board-level review and approval of materiality assessments and sustainability reports",
  [UserRole.ERM_TEAM]:
    "Access to climate risk assessment, scenario analysis, capacity building, and ESRM model",
  [UserRole.CLIENT]:
    "Client portal — complete the value chain questionnaire and view your SRRO/CRRO register with review outcomes",
};
