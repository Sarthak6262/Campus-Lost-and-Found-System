export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: number;
  student_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUpdateRequest {
  name?: string;
  phone?: string;
  department?: string;
}

export interface AdminUserStatusUpdate {
  is_active: boolean;
}
