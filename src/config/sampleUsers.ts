import { UserRole } from "@/config/permissions.config";

export type SampleUser = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

export const sampleUsers: SampleUser[] = [
  {
    email: "admin@deloitte.com",
    password: "admin123",
    name: "Admin User",
    role: UserRole.ADMIN,
  },
  {
    email: "esg@deloitte.com",
    password: "esg123",
    name: "ESG Manager",
    role: UserRole.ESG_MANAGER,
  },
  {
    email: "analyst@deloitte.com",
    password: "analyst123",
    name: "Risk Analyst",
    role: UserRole.RISK_ANALYST,
  },
  {
    email: "portfolio@deloitte.com",
    password: "portfolio123",
    name: "Portfolio Manager",
    role: UserRole.PORTFOLIO_MANAGER,
  },
  {
    email: "exec@deloitte.com",
    password: "exec123",
    name: "Executive",
    role: UserRole.EXECUTIVE,
  },
  {
    email: "data@deloitte.com",
    password: "data123",
    name: "Data Entry",
    role: UserRole.DATA_ENTRY,
  },
];
