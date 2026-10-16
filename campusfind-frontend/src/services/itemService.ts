import { api } from './api';
import { APIResponse, PaginatedResponse } from '../types/api';
import {
  Item,
  ItemCreateRequest,
  ItemMatchResponse,
  ItemSearchParams,
  ItemUpdateRequest,
} from '../types/item';

export const itemService = {
  async createLostItem(data: ItemCreateRequest): Promise<Item> {
    const response = await api.post<APIResponse<Item>>('/api/items/lost', data);
    return response.data.data;
  },

  async createFoundItem(data: ItemCreateRequest): Promise<Item> {
    const response = await api.post<APIResponse<Item>>('/api/items/found', data);
    return response.data.data;
  },

  async getAllItems(page = 1, limit = 12): Promise<PaginatedResponse<Item>> {
    const response = await api.get<PaginatedResponse<Item>>('/api/items', {
      params: { page, limit },
    });
    return response.data;
  },

  async getLostItems(page = 1, limit = 12): Promise<PaginatedResponse<Item>> {
    const response = await api.get<PaginatedResponse<Item>>('/api/items/lost', {
      params: { page, limit },
    });
    return response.data;
  },

  async getFoundItems(page = 1, limit = 12): Promise<PaginatedResponse<Item>> {
    const response = await api.get<PaginatedResponse<Item>>('/api/items/found', {
      params: { page, limit },
    });
    return response.data;
  },

  async searchItems(params: ItemSearchParams): Promise<PaginatedResponse<Item>> {
    const response = await api.get<PaginatedResponse<Item>>('/api/items/search', {
      params,
    });
    return response.data;
  },

  async getItemById(itemId: number): Promise<Item> {
    const response = await api.get<APIResponse<Item>>(`/api/items/${itemId}`);
    return response.data.data;
  },

  async updateItem(itemId: number, data: ItemUpdateRequest): Promise<Item> {
    const response = await api.put<APIResponse<Item>>(`/api/items/${itemId}`, data);
    return response.data.data;
  },

  async deleteItem(itemId: number): Promise<void> {
    await api.delete(`/api/items/${itemId}`);
  },

  async getMatches(itemId: number): Promise<ItemMatchResponse> {
    const response = await api.get<APIResponse<ItemMatchResponse>>(`/api/items/${itemId}/matches`);
    return response.data.data;
  },

  async uploadImage(itemId: number, file: File): Promise<Item> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<APIResponse<Item>>(`/api/items/${itemId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
