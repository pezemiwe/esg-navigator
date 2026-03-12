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
  // Sustainability demo users
  {
    email: "data-owner@deloitte.com",
    password: "owner123",
    name: "Amaka Obiora",
    role: UserRole.DATA_OWNER,
  },
  {
    email: "data-owner2@deloitte.com",
    password: "owner456",
    name: "Tunde Fashola",
    role: UserRole.DATA_OWNER,
  },
  {
    email: "data-owner3@deloitte.com",
    password: "owner789",
    name: "Chidinma Obi",
    role: UserRole.DATA_OWNER,
  },
  {
    email: "data-owner4@deloitte.com",
    password: "owner321",
    name: "Babatunde Okafor",
    role: UserRole.DATA_OWNER,
  },
  {
    email: "sustainability-manager@deloitte.com",
    password: "manager123",
    name: "Adaeze Nwosu",
    role: UserRole.SUSTAINABILITY_MANAGER,
  },
  {
    email: "sustainability-approver@deloitte.com",
    password: "approver123",
    name: "Chukwuemeka Eze",
    role: UserRole.SUSTAINABILITY_APPROVER,
  },
  {
    email: "board@deloitte.com",
    password: "board123",
    name: "Chief Adeyinka Ogunleye",
    role: UserRole.BOARD,
  },
];
