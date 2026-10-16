import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { ItemCategory, ItemStatus, ItemType } from '../../types/item';
import { CATEGORIES, COMMON_COLORS } from '../../utils/constants';

interface FilterPanelProps {
  type?: ItemType | '';
  category?: ItemCategory | '';
  location?: string;
  color?: string;
  status?: ItemStatus | '';
  date?: string;
  onTypeChange: (type: ItemType | '') => void;
  onCategoryChange: (cat: ItemCategory | '') => void;
  onLocationChange: (loc: string) => void;
  onColorChange: (color: string) => void;
  onStatusChange: (status: ItemStatus | '') => void;
  onDateChange: (date: string) => void;
  onReset: () => void;
  showStatusFilter?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  type = '',
  category = '',
  location = '',
  color = '',
  status = '',
  date = '',
  onTypeChange,
  onCategoryChange,
  onLocationChange,
  onColorChange,
  onStatusChange,
  onDateChange,
  onReset,
  showStatusFilter = true,
}) => {
  const hasActiveFilters = !!(type || category || location || color || status || date);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Type Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Type</label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as ItemType | '')}
            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
          >
            <option value="">All Types (Lost & Found)</option>
            <option value="LOST">Lost Items</option>
            <option value="FOUND">Found Items</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as ItemCategory | '')}
            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="e.g. Library, Canteen"
            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
          />
        </div>

        {/* Color Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Color</label>
          <select
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
          >
            <option value="">All Colors</option>
            {COMMON_COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as ItemStatus | '')}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CLAIMED">Claimed</option>
              <option value="RETURNED">Returned</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        )}

        {/* Date Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Reported Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
          />
        </div>
      </div>
    </div>
  );
};
