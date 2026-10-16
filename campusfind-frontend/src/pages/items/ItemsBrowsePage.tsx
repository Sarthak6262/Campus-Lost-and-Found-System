import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';
import { itemService } from '../../services/itemService';
import { Item, ItemSearchParams, ItemType, ItemCategory, ItemStatus } from '../../types/item';
import { ItemGrid } from '../../components/items/ItemGrid';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterPanel } from '../../components/common/FilterPanel';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/common/Button';
import { useDebounce } from '../../hooks/useDebounce';

export const ItemsBrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState<ItemType | ''>(
    (searchParams.get('type') as ItemType) || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>(
    (searchParams.get('category') as ItemCategory) || ''
  );
  const [selectedStatus, setSelectedStatus] = useState<ItemStatus | ''>(
    (searchParams.get('status') as ItemStatus) || ''
  );
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '');

  // Pagination & Results state
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItems] = useState<Item[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mobile filter drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounced search query
  const debouncedSearch = useDebounce(searchQuery, 400);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: ItemSearchParams = {
        page: currentPage,
        limit: 12,
        order: 'desc',
      };

      if (debouncedSearch.trim()) params.item_name = debouncedSearch.trim();
      if (selectedType) params.type = selectedType;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedLocation) params.location = selectedLocation;
      if (selectedColor) params.color = selectedColor;
      if (selectedDate) params.item_date = selectedDate;

      // Always use the backend search endpoint for consistent querying
      const response = await itemService.searchItems(params);
      setItems(response.data || response.items || []);
      setTotalItems(response.total);
      setTotalPages(response.pages || response.total_pages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load campus items');
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearch,
    selectedType,
    selectedCategory,
    selectedStatus,
    selectedLocation,
    selectedColor,
    selectedDate,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Keep URL search params in sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (selectedType) params.set('type', selectedType);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedLocation) params.set('location', selectedLocation);
    if (selectedColor) params.set('color', selectedColor);
    if (selectedDate) params.set('date', selectedDate);
    setSearchParams(params, { replace: true });
  }, [
    debouncedSearch,
    selectedType,
    selectedCategory,
    selectedStatus,
    selectedLocation,
    selectedColor,
    selectedDate,
    setSearchParams,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedLocation('');
    setSelectedColor('');
    setSelectedDate('');
    setCurrentPage(1);
  };

  const activeFilterCount = [
    selectedType,
    selectedCategory,
    selectedStatus,
    selectedLocation,
    selectedColor,
    selectedDate,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Campus Lost & Found Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and recover lost belongings reported by students and faculty
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchItems}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Top Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Search by item name (e.g. MacBook Air, Blue Backpack, Water Bottle)..."
        />
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Panel */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterPanel
            type={selectedType}
            category={selectedCategory}
            status={selectedStatus}
            location={selectedLocation}
            color={selectedColor}
            date={selectedDate}
            onTypeChange={(val) => {
              setSelectedType(val);
              setCurrentPage(1);
            }}
            onCategoryChange={(val) => {
              setSelectedCategory(val);
              setCurrentPage(1);
            }}
            onStatusChange={(val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            }}
            onLocationChange={(val) => {
              setSelectedLocation(val);
              setCurrentPage(1);
            }}
            onColorChange={(val) => {
              setSelectedColor(val);
              setCurrentPage(1);
            }}
            onDateChange={(val) => {
              setSelectedDate(val);
              setCurrentPage(1);
            }}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {showMobileFilters && (
          <div className="lg:hidden col-span-1">
            <FilterPanel
              type={selectedType}
              category={selectedCategory}
              status={selectedStatus}
              location={selectedLocation}
              color={selectedColor}
              date={selectedDate}
              onTypeChange={(val) => {
                setSelectedType(val);
                setCurrentPage(1);
              }}
              onCategoryChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              onStatusChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
              onLocationChange={(val) => {
                setSelectedLocation(val);
                setCurrentPage(1);
              }}
              onColorChange={(val) => {
                setSelectedColor(val);
                setCurrentPage(1);
              }}
              onDateChange={(val) => {
                setSelectedDate(val);
                setCurrentPage(1);
              }}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Items Grid Content */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          {/* Results count label */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing{' '}
              <strong className="text-slate-700 font-semibold">{items.length}</strong> of{' '}
              <strong className="text-slate-700 font-semibold">{totalItems}</strong> items
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          <ItemGrid
            items={items}
            isLoading={isLoading}
            error={error}
            onRetry={fetchItems}
            emptyMessage={
              debouncedSearch || activeFilterCount > 0
                ? 'No items match your active filters. Try clearing some criteria.'
                : 'No items currently reported on campus.'
            }
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
