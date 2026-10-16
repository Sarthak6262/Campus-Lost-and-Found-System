export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  items?: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
  total_pages?: number;
}
