export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Claim {
  id: number;
  item_id: number;
  user_id: number;
  reason: string;
  identification_details: string;
  status: ClaimStatus;
  admin_remark?: string | null;
  created_at: string;
  updated_at: string;
  claimant_id?: number | null;
  claimant_name?: string | null;
  claimant_email?: string | null;
  claimant_student_id?: string | null;
  claimant_department?: string | null;
  claimant_phone?: string | null;
  finder_id?: number | null;
  finder_name?: string | null;
  finder_email?: string | null;
  finder_phone?: string | null;
  finder_student_id?: string | null;
  finder_department?: string | null;
  collection_location?: string | null;
  item_name?: string | null;
  item_category?: string | null;
  item_type?: string | null;
  item_status?: string | null;
}


export interface ClaimCreateRequest {
  item_id: number;
  reason: string;
  identification_details: string;
}

export interface ClaimAdminAction {
  admin_remark: string;
}
