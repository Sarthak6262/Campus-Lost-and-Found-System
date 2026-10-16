import { User } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserRegisterRequest {
  student_id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  department: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: UserRegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshUser: () => Promise<void>;
}
