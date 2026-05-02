/**
 * Standard API response interfaces for front-end type safety.
 * Used to replace 'any' casts in API service calls.
 */

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: "super_admin" | "org_admin" | "teacher" | "student";
  is_active: boolean;
  avatar_url?: string;
}

export interface GenericSetting {
  key: string;
  value: string;
  description?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface ErrorResponse {
  error: string;
  detail?: string | Record<string, string[]>;
}
