import { ItemCategory, ItemStatus, ItemType } from '../types/item';
import { ClaimStatus } from '../types/claim';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const CATEGORIES: { label: string; value: ItemCategory }[] = [
  { label: 'Electronics', value: 'ELECTRONICS' },
  { label: 'Documents & IDs', value: 'DOCUMENTS' },
  { label: 'Books & Notes', value: 'BOOKS' },
  { label: 'Wallets & Purses', value: 'WALLET' },
  { label: 'Keys', value: 'KEYS' },
  { label: 'Clothing', value: 'CLOTHING' },
  { label: 'Bags & Backpacks', value: 'BAG' },
  { label: 'Accessories', value: 'ACCESSORIES' },
  { label: 'Other', value: 'OTHER' },
];

export const ITEM_STATUSES: { label: string; value: ItemStatus; color: string }[] = [
  { label: 'Active', value: 'ACTIVE', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Claimed', value: 'CLAIMED', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Returned', value: 'RETURNED', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Closed', value: 'CLOSED', color: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export const ITEM_TYPES: { label: string; value: ItemType }[] = [
  { label: 'Lost', value: 'LOST' },
  { label: 'Found', value: 'FOUND' },
];

export const CLAIM_STATUSES: { label: string; value: ClaimStatus; color: string }[] = [
  { label: 'Pending Review', value: 'PENDING', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Approved', value: 'APPROVED', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Rejected', value: 'REJECTED', color: 'bg-rose-50 text-rose-700 border-rose-200' },
];

export const CAMPUS_LOCATIONS = [
  'Central Library',
  'Cafeteria / Canteen',
  'Auditorium',
  'Computer Center / Lab 1-4',
  'Main Academic Block (Ground Floor)',
  'Main Academic Block (First Floor)',
  'Main Academic Block (Second Floor)',
  'Sports Complex / Ground',
  'Boys Hostel Block A/B',
  'Girls Hostel Block A/B',
  'Admin Building / Reception',
  'Parking Lot A/B',
  'Campus Garden / Quadrangle',
  'Workshop / Mech Lab',
  'Other Campus Location',
];

export const COMMON_COLORS = [
  'Black',
  'White',
  'Silver / Grey',
  'Blue',
  'Red',
  'Green',
  'Brown',
  'Yellow / Gold',
  'Pink / Purple',
  'Other / Multicolor',
];
