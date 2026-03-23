import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRole } from "@/config/permissions.config";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

const mockUsers: Record<string, { password: string; user: User }> = {
  "admin@deloitte.com": {
    password: "admin123",
    user: {
      id: "1",
      name: "Zainab Murtala",
      email: "admin@deloitte.com",
      role: UserRole.ADMIN,
      department: "IT & Systems",
    },
  },
  "esg@deloitte.com": {
    password: "esg123",
    user: {
      id: "2",
      name: "Ngozi Adeyemi",
      email: "esg@deloitte.com",
      role: UserRole.ESG_MANAGER,
      department: "Risk Management",
    },
  },
  "analyst@deloitte.com": {
    password: "analyst123",
    user: {
      id: "3",
      name: "Oluwaseun Ibrahim",
      email: "analyst@deloitte.com",
      role: UserRole.RISK_ANALYST,
      department: "Climate Risk",
    },
  },
  "portfolio@deloitte.com": {
    password: "portfolio123",
    user: {
      id: "4",
      name: "Aisha Bello",
      email: "portfolio@deloitte.com",
      role: UserRole.PORTFOLIO_MANAGER,
      department: "Portfolio Management",
    },
  },
  "executive@deloitte.com": {
    password: "exec123",
    user: {
      id: "5",
      name: "Emeka Nwosu",
      email: "executive@deloitte.com",
      role: UserRole.EXECUTIVE,
      department: "Executive Office",
    },
  },
  "data@deloitte.com": {
    password: "data123",
    user: {
      id: "6",
      name: "Funke Adeleke",
      email: "data@deloitte.com",
      role: UserRole.DATA_ENTRY,
      department: "Data Management",
    },
  },
  // Sustainability-specific mock users
  "sustainability-champion@deloitte.com": {
    password: "champion123",
    user: {
      id: "7",
      name: "Ngozi Eze",
      email: "sustainability-champion@deloitte.com",
      role: UserRole.SUSTAINABILITY_CHAMPION,
      department: "Sustainability",
    },
  },
  "sustainability-manager@deloitte.com": {
    password: "manager123",
    user: {
      id: "8",
      name: "Dare Adeleke",
      email: "sustainability-manager@deloitte.com",
      role: UserRole.SUSTAINABILITY_MANAGER,
      department: "Sustainability Management",
    },
  },
  "data-owner@deloitte.com": {
    password: "owner123",
    user: {
      id: "9",
      name: "Amaka Obiora",
      email: "data-owner@deloitte.com",
      role: UserRole.DATA_OWNER,
      department: "Finance",
    },
  },
  "data-owner2@deloitte.com": {
    password: "owner456",
    user: {
      id: "12",
      name: "Tunde Fashola",
      email: "data-owner2@deloitte.com",
      role: UserRole.DATA_OWNER,
      department: "Operations",
    },
  },
  "data-owner3@deloitte.com": {
    password: "owner789",
    user: {
      id: "13",
      name: "Chidinma Obi",
      email: "data-owner3@deloitte.com",
      role: UserRole.DATA_OWNER,
      department: "HR & Admin",
    },
  },
  "data-owner4@deloitte.com": {
    password: "owner321",
    user: {
      id: "14",
      name: "Babatunde Okafor",
      email: "data-owner4@deloitte.com",
      role: UserRole.DATA_OWNER,
      department: "Procurement",
    },
  },
  "approver@deloitte.com": {
    password: "approver123",
    user: {
      id: "10",
      name: "Ifeoma Chukwudi",
      email: "approver@deloitte.com",
      role: UserRole.SUSTAINABILITY_APPROVER,
      department: "Internal Audit",
    },
  },
  "board@deloitte.com": {
    password: "board123",
    user: {
      id: "15",
      name: "Chief Adeyinka Ogunleye",
      email: "board@deloitte.com",
      role: UserRole.BOARD,
      department: "Board of Directors",
    },
  },
  "erm@deloitte.com": {
    password: "erm123",
    user: {
      id: "11",
      name: "Seun Afolabi",
      email: "erm@deloitte.com",
      role: UserRole.ERM_TEAM,
      department: "Enterprise Risk Management",
    },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        const userRecord = mockUsers[email.toLowerCase()];

        if (!userRecord || userRecord.password !== password) {
          throw new Error("Invalid email or password");
        }

        const user = userRecord.user;
        set({ user, isAuthenticated: true });
        return user;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage-v2",
    },
  ),
);
