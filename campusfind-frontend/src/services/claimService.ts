import { api } from './api';
import { APIResponse } from '../types/api';
import { Claim, ClaimCreateRequest } from '../types/claim';

export const claimService = {
  async submitClaim(data: ClaimCreateRequest): Promise<Claim> {
    const response = await api.post<APIResponse<Claim>>('/api/claims', data);
    return response.data.data;
  },

  async getMyClaims(): Promise<Claim[]> {
    const response = await api.get<APIResponse<Claim[]>>('/api/claims/my');
    return response.data.data;
  },

  async getClaimById(claimId: number): Promise<Claim> {
    const response = await api.get<APIResponse<Claim>>(`/api/claims/${claimId}`);
    return response.data.data;
  },

  async getApprovedClaimByItemId(itemId: number): Promise<Claim | null> {
    try {
      const response = await api.get<APIResponse<Claim | null>>(`/api/claims/item/${itemId}`);
      return response.data.data;
    } catch {
      return null;
    }
  },
};
