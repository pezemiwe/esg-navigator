import { UserRole } from "@/config/permissions.config";

export type SampleUser = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

export const sampleUsers: SampleUser[] = [
  {
    email: "chioma.adebayo@fmn.com",
    password: "password123",
    name: "Chioma Adebayo",
    role: UserRole.ADMIN,
  },
  {
    email: "ibrahim.musa@fmn.com",
    password: "password123",
    name: "Ibrahim Musa",
    role: UserRole.ESG_MANAGER,
  },
  {
    email: "funke.akindele@fmn.com",
    password: "password123",
    name: "Funke Akindele",
    role: UserRole.RISK_ANALYST,
  },
  {
    email: "emeka.okonkwo@fmn.com",
    password: "password123",
    name: "Emeka Okonkwo",
    role: UserRole.PORTFOLIO_MANAGER,
  },
  {
    email: "zainab.ahmed@fmn.com",
    password: "password123",
    name: "Zainab Ahmed",
    role: UserRole.EXECUTIVE,
  },
  {
    email: "tunde.bakare@fmn.com",
    password: "password123",
    name: "Tunde Bakare",
    role: UserRole.DATA_ENTRY,
  },
  {
    email: "ngozi.obi@fmn.com",
    password: "password123",
    name: "Ngozi Obi",
    role: UserRole.DATA_ENTRY,
  },
  {
    email: "yusuf.ali@fmn.com",
    password: "password123",
    name: "Yusuf Ali",
    role: UserRole.RISK_ANALYST,
  },
  {
    email: "aisha.bello@fmn.com",
    password: "password123",
    name: "Aisha Bello",
    role: UserRole.ESG_MANAGER,
  },
  {
    email: "kingsley.eze@fmn.com",
    password: "password123",
    name: "Kingsley Eze",
    role: UserRole.DATA_ENTRY,
  },
];
