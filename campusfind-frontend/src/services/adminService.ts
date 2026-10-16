import { api } from './api';
import { APIResponse, PaginatedResponse } from '../types/api';
import { Claim, ClaimAdminAction, ClaimStatus } from '../types/claim';
import { Item, ItemAdminStatusUpdate, ItemStatus, ItemType } from '../types/item';
import { AdminUserStatusUpdate, User } from '../types/user';

export interface DashboardStats {
  total_users: number;
  total_lost_items: number;
  total_found_items: number;
  active_items: number;
  claimed_items: number;
  returned_items: number;
  pending_claims: number;
  approved_claims: number;
  rejected_claims: number;
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<APIResponse<DashboardStats>>('/api/admin/dashboard');
    return response.data.data;
  },

  async getAllUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/api/admin/users', {
      params: { page, limit },
    });
    return response.data;
  },

  async getUserById(userId: number): Promise<User> {
    const response = await api.get<APIResponse<User>>(`/api/admin/users/${userId}`);
    return response.data.data;
  },

  async updateUserStatus(userId: number, data: AdminUserStatusUpdate): Promise<User> {
    const response = await api.put<APIResponse<User>>(`/api/admin/users/${userId}/status`, data);
    return response.data.data;
  },

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/api/admin/users/${userId}`);
  },

  async getAllItems(
    page = 1,
    limit = 10,
    type?: ItemType,
    status?: ItemStatus
  ): Promise<PaginatedResponse<Item>> {
    const response = await api.get<PaginatedResponse<Item>>('/api/admin/items', {
      params: { page, limit, type, status },
    });
    return response.data;
  },

  async updateItemStatus(itemId: number, data: ItemAdminStatusUpdate): Promise<Item> {
    const response = await api.put<APIResponse<Item>>(`/api/admin/items/${itemId}/status`, data);
    return response.data.data;
  },

  async deleteItem(itemId: number): Promise<void> {
    await api.delete(`/api/admin/items/${itemId}`);
  },

  async getAllClaims(
    page = 1,
    limit = 10,
    status?: ClaimStatus | ''
  ): Promise<PaginatedResponse<Claim>> {
    const response = await api.get<PaginatedResponse<Claim>>('/api/admin/claims', {
      params: {
        page,
        limit,
        status: status ? status : undefined,
      },
    });
    return response.data;
  },


  async approveClaim(claimId: number, data: ClaimAdminAction): Promise<Claim> {
    const response = await api.put<APIResponse<Claim>>(`/api/admin/claims/${claimId}/approve`, data);
    return response.data.data;
  },

  async rejectClaim(claimId: number, data: ClaimAdminAction): Promise<Claim> {
    const response = await api.put<APIResponse<Claim>>(`/api/admin/claims/${claimId}/reject`, data);
    return response.data.data;
  },
};
