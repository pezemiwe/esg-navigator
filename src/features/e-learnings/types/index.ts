export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

export interface Quiz {
  passingScore: number;
  questions: Question[];
}

export interface Training {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: "mandatory" | "annual" | "optional";
  category: string;
  videoUrl: string;
  dueDate?: string;
  status: "not_started" | "in_progress" | "completed";
  assignedRoles: string[];
  completionRate: number;
  quiz?: Quiz;
  completedDate?: string;
  quizScore?: number;
}

export interface Stats {
  totalModules: number;
  completionRate: number;
  certificates: number;
  pending: number;
  completed: number;
}
