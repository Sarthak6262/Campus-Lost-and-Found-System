import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Search, ShieldCheck } from 'lucide-react';
import { userService } from '../../services/userService';
import { itemService } from '../../services/itemService';
import { Item, ItemType } from '../../types/item';
import { useToast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { CardSkeleton } from '../../components/common/Skeleton';
import { formatDate, getImageUrl } from '../../utils/formatters';

export const MyItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [filterType, setFilterType] = useState<'ALL' | ItemType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Deletion modal state
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getMyItems();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your reported items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await itemService.deleteItem(itemToDelete.id);
      showSuccess(`"${itemToDelete.item_name}" deleted successfully.`);
      setItemToDelete(null);
      await fetchItems();
    } catch (err: any) {
      showError(err.message || 'Could not delete item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = items
    .filter((item) => (filterType === 'ALL' ? true : item.type === filterType))
    .filter((item) =>
      searchQuery.trim()
        ? item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const lostCount = items.filter((i) => i.type === 'LOST').length;
  const foundCount = items.filter((i) => i.type === 'FOUND').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Reported Items</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage items you have reported lost or found across campus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/items/report-lost">
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Report Lost
            </Button>
          </Link>
          <Link to="/items/report-found">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Report Found
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b md:border-b-0 pb-3 md:pb-0 border-slate-100">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setFilterType('LOST')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'LOST'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Lost Items ({lostCount})
            </button>
            <button
              onClick={() => setFilterType('FOUND')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'FOUND'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Found Items ({foundCount})
            </button>
          </div>

          {/* Search filter input */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by name, location, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchItems} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No matching reports' : 'No items reported'}
          description={
            searchQuery
              ? 'Try modifying your search criteria or resetting filters.'
              : 'You have not reported any items under this category yet.'
          }
          action={
            !searchQuery
              ? {
                  label: 'Report an Item',
                  onClick: () => navigate('/items/report-lost'),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col justify-between">
              <div>
                {/* Item Thumbnail / Header */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.item_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <span className="text-3xl mb-1">📦</span>
                      <span className="text-xs">No image attached</span>
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <Badge variant={item.type === 'LOST' ? 'lost' : 'found'}>
                      {item.type}
                    </Badge>
                    <Badge variant={item.status.toLowerCase() as any}>
                      {item.status}
                    </Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                      {item.item_name}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-500 shrink-0">
                      {formatDate(item.item_date)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="pt-2 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-medium text-slate-700">{item.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="font-medium text-slate-700">{item.location}</span>
                    </div>
                    {item.color && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Color:</span>
                        <span className="font-medium text-slate-700">{item.color}</span>
                      </div>
                    )}
                  </div>

                  {item.type === 'FOUND' && (item.status === 'RETURNED' || item.status === 'CLAIMED') && (
                    <div className="mt-2.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-1.5 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Owner Verified • Handover Info Ready</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link to={`/items/${item.id}`} className="flex-1">
                  <Button
                    size="sm"
                    variant={
                      item.type === 'FOUND' && (item.status === 'RETURNED' || item.status === 'CLAIMED')
                        ? 'primary'
                        : 'outline'
                    }
                    className={`w-full text-xs ${
                      item.type === 'FOUND' && (item.status === 'RETURNED' || item.status === 'CLAIMED')
                        ? 'bg-emerald-600 hover:bg-emerald-500'
                        : ''
                    }`}
                    leftIcon={
                      item.type === 'FOUND' && (item.status === 'RETURNED' || item.status === 'CLAIMED') ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {item.type === 'FOUND' && (item.status === 'RETURNED' || item.status === 'CLAIMED')
                      ? 'Handover Info'
                      : 'View'}
                  </Button>
                </Link>

                <Link to={`/items/${item.id}/edit`} className="flex-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="danger"
                  className="px-2.5 text-xs"
                  onClick={() => setItemToDelete(item)}
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Item Report"
        message={`Are you sure you want to delete "${itemToDelete?.item_name}"? This action cannot be undone.`}
        confirmText="Delete Report"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
