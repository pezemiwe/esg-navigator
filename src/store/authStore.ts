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
      name: "Chukwuemeka Okafor",
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
      name: "auth-storage",
    },
  ),
);
