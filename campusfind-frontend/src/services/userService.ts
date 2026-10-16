import { api } from './api';
import { APIResponse } from '../types/api';
import { User, UserUpdateRequest } from '../types/user';
import { Item } from '../types/item';
import { Claim } from '../types/claim';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get<APIResponse<User>>('/api/users/me');
    return response.data.data;
  },

  async updateProfile(data: UserUpdateRequest): Promise<User> {
    const response = await api.put<APIResponse<User>>('/api/users/me', data);
    return response.data.data;
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/api/users/me');
  },

  async getMyItems(): Promise<Item[]> {
    const response = await api.get<APIResponse<Item[]>>('/api/users/me/items');
    return response.data.data;
  },

  async getMyClaims(): Promise<Claim[]> {
    const response = await api.get<APIResponse<Claim[]>>('/api/users/me/claims');
    return response.data.data;
  },
};
