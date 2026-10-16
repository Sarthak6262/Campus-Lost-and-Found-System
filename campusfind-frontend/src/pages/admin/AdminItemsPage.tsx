import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Item, ItemStatus, ItemType } from '../../types/item';
import { useToast } from '../../components/common/Toast';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

const STATUS_OPTIONS: { label: string; value: ItemStatus }[] = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Claimed', value: 'CLAIMED' },
  { label: 'Returned', value: 'RETURNED' },
  { label: 'Closed', value: 'CLOSED' },
];

export const AdminItemsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterType, setFilterType] = useState<ItemType | ''>('');
  const [filterStatus, setFilterStatus] = useState<ItemStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Change Modal State
  const [itemToUpdateStatus, setItemToUpdateStatus] = useState<Item | null>(null);
  const [newStatus, setNewStatus] = useState<ItemStatus>('ACTIVE');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllItems(
        currentPage,
        10,
        filterType || undefined,
        filterStatus || undefined
      );
      setItems(response.data || response.items || []);
      setTotalPages(response.pages || response.total_pages || 1);
      setTotalItems(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentPage, filterType, filterStatus]);

  const handleStatusSubmit = async () => {
    if (!itemToUpdateStatus) return;
    setIsUpdatingStatus(true);
    try {
      await adminService.updateItemStatus(itemToUpdateStatus.id, { status: newStatus });
      showSuccess(`Status for "${itemToUpdateStatus.item_name}" updated to ${newStatus}.`);
      setItemToUpdateStatus(null);
      await fetchItems();
    } catch (err: any) {
      showError(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await adminService.deleteItem(itemToDelete.id);
      showSuccess(`Report "${itemToDelete.item_name}" deleted.`);
      setItemToDelete(null);
      await fetchItems();
    } catch (err: any) {
      showError(err.message || 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = searchQuery.trim()
    ? items.filter(
        (i) =>
          i.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manage Campus Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Oversee all lost and found listings across campus departments
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchItems}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Listings
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by item title, location, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as ItemType | '');
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="LOST">Lost Only</option>
              <option value="FOUND">Found Only</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as ItemStatus | '');
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CLAIMED">Claimed</option>
              <option value="RETURNED">Returned</option>
              <option value="CLOSED">Closed</option>
            </select>

            <span className="text-xs text-slate-500 font-medium pl-2 shrink-0">
              Total: <strong>{totalItems}</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* Table Content */}
      <Card className="overflow-hidden border border-slate-200/80 shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-500">Loading catalog reports...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchItems} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<FolderOpen className="w-12 h-12 text-slate-300" />}
              title="No reports found"
              description="No item listings match your active filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Ref #</th>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                      #{item.id}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {item.item_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={item.type === 'LOST' ? 'lost' : 'found'}>
                        {item.type}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{item.category}</td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-[150px] truncate">
                      {item.location}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">{formatDate(item.item_date)}</td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          setItemToUpdateStatus(item);
                          setNewStatus(item.status);
                        }}
                        className="group flex items-center gap-1 text-left"
                        title="Click to change status"
                      >
                        <Badge variant={item.status.toLowerCase() as any}>
                          {item.status}
                        </Badge>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Link to={`/items/${item.id}`}>
                        <button
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                          title="View Item"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>

                      <button
                        onClick={() => {
                          setItemToUpdateStatus(item);
                          setNewStatus(item.status);
                        }}
                        className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                        title="Change Status"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Report"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Change Status Modal */}
      {itemToUpdateStatus && (
        <Modal
          isOpen={!!itemToUpdateStatus}
          onClose={() => setItemToUpdateStatus(null)}
          title={`Update Status: "${itemToUpdateStatus.item_name}"`}
          description="Select the updated resolution status for this campus listing."
        >
          <div className="space-y-4">
            <Select
              label="New Listing Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ItemStatus)}
              options={STATUS_OPTIONS}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setItemToUpdateStatus(null)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStatusSubmit}
                isLoading={isUpdatingStatus}
                loadingText="Updating..."
              >
                Save Status
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Item Report"
        message={`Are you sure you want to permanently delete "${itemToDelete?.item_name}"?`}
        confirmText="Delete Report"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
