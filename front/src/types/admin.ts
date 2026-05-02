import { TFunction } from "i18next";

export type Teacher = {
  id: number;
  name: string;
  login: string;
  school: string;
  status: string;
  lastLogin: string;
  plan: string;
  tokenUsage: number;
  ip: string;
  is_active: boolean;
  tokens_limit: number;
  expires_at: string | null;
  organization_id: number | null;
  role: string;
};

export type Org = {
  id: number;
  name: string;
  contact: string;
  seats: number;
  used: number;
  expires: string;
  status: string;
  plan?: string;
};

export type Payment = {
  id: number;
  org: string;
  amount: number;
  currency: string;
  date: string;
  method: string;
  status: "paid" | "pending" | "failed";
  period: string;
};

export type FinancialStats = {
  mrr: number;
  total_revenue: number;
  active_subscriptions: number;
  pending_payments: number;
};

export type AuditLog = {
  id: number;
  action: string;
  target: string;
  time: string;
  type: string;
};

export type OrgUser = {
  id: number;
  full_name: string;
  email: string;
  plan: string;
  expires_at: string | null;
  is_active: boolean;
};

export interface ApiTeacher {
  id: number;
  full_name: string;
  email: string;
  school: string;
  is_active: boolean;
  plan: string;
  expires_at: string | null;
  organization_id: number | null;
  role: string;
  tokens_limit: number;
}

export interface ApiAnalyticEntry {
  user_id: number;
  last_active: string | null;
  total_tokens: number;
}

export interface ApiOrg {
  id: number;
  name: string;
  contact_person: string;
  license_seats: number;
  used_seats: number;
  expires_at: string;
  status: string;
}

export interface ApiPayment {
  id: number;
  org_name: string;
  amount: number;
  currency: string;
  date: string;
  method: string;
  status: "paid" | "pending" | "failed";
  period: string;
}

export interface ApiAuditLog {
  id: number;
  action: string;
  target: string;
  timestamp: string;
  log_type: string;
}

export type Section = "dashboard" | "teachers" | "organizations" | "ai-monitor" | "finances" | "system";
