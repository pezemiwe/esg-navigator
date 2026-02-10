export interface Project {
  id: string;
  name: string;
  client: string;
  sector: string;
  riskCategory: "A" | "B" | "C";
  status: string;
  progress: number;
  lastUpdated: string;
  assignedTo: string;
  location?: string;
  facilityType?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending";
}

export interface PendingTask {
  id: string;
  projectName: string;
  clientName: string;
  currentStep: string;
  priority: "Hi" | "Medium" | "Low";
  dueDate: string;
  assignedBy: string;
  status: "Pending Review" | "In Progress" | "Awaiting Approval" | "Overdue";
}

export interface ProjectData {
  clientName: string;
  facilityType: string;
  sector: string;
  subSector: string;
  projectLocation: string;
  projectType: string;
  currency: string;
  estimatedAmount: string;
  estimatedEmployees: string;
}

export interface ExclusionData {
  [key: string]: boolean;
}

export interface RiskQuestions {
  [key: string]: "yes" | "no" | "na" | "";
}

export interface PSQuestions {
  [key: string]: "yes" | "no" | "na" | "";
}

export interface ActionItem {
  id: number;
  actionItem: string;
  ifcPsRef: string;
  responsibleParty: string;
  timeline: string;
  monitoringIndicator: string;
}

export interface MonitoringEntry {
  id: number;
  date: string;
  monitoringActivity: string;
  findings: string;
  followUpAction: string;
  status: string;
}

export interface CompletedProject {
  id: string;
  clientName: string;
  projectName: string;
  sector: string;
  location: string;
  riskCategory: "A" | "B" | "C";
  facilityType: string;
  estimatedAmount: number;
  completedDate: string;
  decision: "Approve" | "Approve with Conditions" | "Reject" | "Escalate";
  approver: string;
  approvalAuthority: string;
  finalComments?: string;
}

export interface ESRMUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "Inactive" | "Suspended";
  lastLogin: string;
  createdDate: string;
}

export interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export interface SystemSetting {
  id: string;
  category: string;
  name: string;
  value: string;
  description: string;
  type: "text" | "number" | "boolean" | "select";
  options?: string[];
}

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface ExclusionItem {
  key: string;
  label: string;
}

export interface PerformanceStandard {
  id?: string;
  title: string;
  questions: {
    key: string;
    text: string;
  }[];
}

export interface ApprovalOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeClass: string;
}

export interface KPIData {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface UserProfileProps {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}
