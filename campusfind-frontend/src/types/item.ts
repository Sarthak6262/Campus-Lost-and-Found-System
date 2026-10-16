export type ItemType = 'LOST' | 'FOUND';

export type ItemStatus = 'ACTIVE' | 'CLAIMED' | 'RETURNED' | 'CLOSED';

export type ItemCategory =
  | 'ELECTRONICS'
  | 'DOCUMENTS'
  | 'BOOKS'
  | 'WALLET'
  | 'KEYS'
  | 'CLOTHING'
  | 'BAG'
  | 'ACCESSORIES'
  | 'OTHER';

export interface Item {
  id: number;
  item_name: string;
  category: ItemCategory;
  description: string;
  color?: string | null;
  location: string;
  item_date: string;
  type: ItemType;
  status: ItemStatus;
  image_url?: string | null;
  reported_by: number;
  created_at: string;
  updated_at: string;
}

export interface ItemCreateRequest {
  item_name: string;
  category: ItemCategory;
  description: string;
  color?: string;
  location: string;
  item_date: string; // YYYY-MM-DD
}

export interface ItemUpdateRequest {
  item_name?: string;
  category?: ItemCategory;
  description?: string;
  color?: string;
  location?: string;
  item_date?: string;
}

export interface ItemAdminStatusUpdate {
  status: ItemStatus;
}

export interface MatchResult {
  matched_item_id: number;
  matched_item_name: string;
  match_score: number;
  reasons: string[];
}

export interface ItemMatchResponse {
  item_id: number;
  matches: MatchResult[];
}

export interface ItemSearchParams {
  item_name?: string;
  category?: ItemCategory;
  color?: string;
  location?: string;
  type?: ItemType;
  status?: ItemStatus;
  item_date?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
