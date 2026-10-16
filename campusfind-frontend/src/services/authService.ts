import { api } from './api';
import { APIResponse } from '../types/api';
import { LoginRequest, TokenResponse, UserRegisterRequest } from '../types/auth';
import { User } from '../types/user';

export const authService = {
  async register(data: UserRegisterRequest): Promise<User> {
    const response = await api.post<APIResponse<User>>('/api/auth/register', data);
    return response.data.data;
  },

  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await api.post<APIResponse<TokenResponse>>('/api/auth/login', credentials);
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<APIResponse<User>>('/api/auth/me');
    return response.data.data;
  },
};
