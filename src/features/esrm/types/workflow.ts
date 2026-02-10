export interface WorkflowStep {
  id: number;
  name: string;
  status: 'locked' | 'available' | 'in-progress' | 'pending-approval' | 'completed';
  assignedTo?: string;
  completedBy?: string;
  completedDate?: string;
  approver?: string;
}

export interface Project {
  id: string;
  clientName: string;
  projectName: string;
  sector: string;
  location: string;
  currentStep: number;
  status: 'draft' | 'in-progress' | 'completed' | 'rejected';
  createdBy: string;
  createdDate: string;
  steps: WorkflowStep[];
}

export interface PendingTask {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  stepName: string;
  stepNumber: number;
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'hi';
  status: 'pending' | 'in-progress' | 'overdue';
}