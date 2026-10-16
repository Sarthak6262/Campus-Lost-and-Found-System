import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Tag,
  Palette,
  ShieldCheck,
  Edit2,
  Trash2,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { itemService } from '../../services/itemService';
import { claimService } from '../../services/claimService';
import { Item } from '../../types/item';
import { Claim } from '../../types/claim';
import { useToast } from '../../components/common/Toast';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ClaimModal } from '../../components/claims/ClaimModal';
import { ItemImageUpload } from '../../components/items/ItemImageUpload';
import { HandoverReceiptCard } from '../../components/claims/HandoverReceiptCard';
import { formatDate, getImageUrl } from '../../utils/formatters';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();

  const [item, setItem] = useState<Item | null>(null);
  const [approvedClaim, setApprovedClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItem = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await itemService.getItemById(Number(id));
      setItem(data);

      if (data.type === 'FOUND' && (data.status === 'RETURNED' || data.status === 'CLAIMED')) {
        try {
          const claimData = await claimService.getApprovedClaimByItemId(data.id);
          setApprovedClaim(claimData);
        } catch {
          // Unauthenticated or not authorized
        }
      }
    } catch (err: any) {
      setError(err.message || 'Item not found or could not be loaded');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleDeleteConfirm = async () => {
    if (!item) return;
    setIsDeleting(true);
    try {
      await itemService.deleteItem(item.id);
      showSuccess('Item report deleted successfully.');
      navigate('/items', { replace: true });
    } catch (err: any) {
      showError(err.message || 'Failed to delete item.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Item Not Available"
          message={error || 'This item could not be retrieved from the campus database.'}
          onRetry={fetchItem}
        />
        <div className="text-center mt-4">
          <Link to="/items">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Browse
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user ? user.id === item.reported_by : false;
  const canEditOrDelete = isOwner || isAdmin;
  const canClaim =
    item.type === 'FOUND' &&
    item.status === 'ACTIVE' &&
    isAuthenticated &&
    !isOwner;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Smart Match button */}
          <Link to={`/items/${item.id}/matches`}>
            <Button
              variant="outline"
              size="sm"
              className="text-blue-700 bg-blue-50/60 border-blue-200 hover:bg-blue-100/70"
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
            >
              Find Matching Items
            </Button>
          </Link>

          {canEditOrDelete && (
            <>
              <Link to={`/items/${item.id}/edit`}>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image & Media */}
        <div className="md:col-span-5 space-y-4">
          <Card className="overflow-hidden p-2 bg-slate-50">
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white border border-slate-200/80 flex items-center justify-center">
              {item.image_url ? (
                <img
                  src={getImageUrl(item.image_url)}
                  alt={item.item_name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300 p-8 text-center">
                  <span className="text-6xl mb-2">📦</span>
                  <p className="text-sm font-medium text-slate-400">No Photo Uploaded</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Item details recorded without an image
                  </p>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <Badge variant={item.type === 'LOST' ? 'lost' : 'found'} size="md">
                  {item.type}
                </Badge>
                <Badge variant={item.status.toLowerCase() as any} size="md">
                  {item.status}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Upload image widget if owner/admin and item doesn't have image, or to update */}
          {canEditOrDelete && (
            <ItemImageUpload
              itemId={item.id}
              currentImageUrl={item.image_url}
              onSuccess={(updated) => {
                setItem(updated);
                showSuccess('Item image updated successfully!');
              }}
            />
          )}
        </div>

        {/* Right Column: Information & Details */}
        <div className="md:col-span-7 space-y-6">
          <Card className="p-6 md:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <span>Ref ID #{item.id}</span>
                <span>•</span>
                <span>Reported {formatDate(item.created_at)}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {item.item_name}
              </h1>
            </div>

            {/* Description Block */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                {item.description}
              </p>
            </div>

            {/* Key Properties Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-lg bg-blue-100/70 text-blue-700">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Category
                  </span>
                  <span className="text-sm font-bold text-slate-800">{item.category}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Location
                  </span>
                  <span className="text-sm font-bold text-slate-800">{item.location}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-lg bg-purple-100/70 text-purple-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {item.type === 'LOST' ? 'Date Lost' : 'Date Found'}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{formatDate(item.item_date)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-lg bg-amber-100/70 text-amber-700">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Color
                  </span>
                  <span className="text-sm font-bold text-slate-800">{item.color || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              {canClaim && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Is this yours?</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Submit verifiable ownership details to claim this item.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-700/20"
                    onClick={() => setIsClaimModalOpen(true)}
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    Claim This Item
                  </Button>
                </div>
              )}

              {!isAuthenticated && item.type === 'FOUND' && item.status === 'ACTIVE' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-slate-600">
                      Sign in with your student account to submit an ownership claim for this item.
                    </p>
                  </div>
                  <Link to="/login">
                    <Button size="sm" variant="outline">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {isOwner && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    You reported this item. Use <strong>Find Matching Items</strong> to see if a
                    matching {item.type === 'LOST' ? 'found' : 'lost'} item has already been turned
                    in.
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Handover Receipt & Contact Coordination Card if Claim Approved */}
      {approvedClaim && (
        <div className="pt-2">
          <HandoverReceiptCard
            claim={approvedClaim}
            viewingRole={
              user?.id === item.reported_by
                ? 'FINDER'
                : user?.id === approvedClaim.user_id
                ? 'OWNER'
                : 'ADMIN'
            }
          />
        </div>
      )}

      {/* Claim Submission Modal */}
      {isClaimModalOpen && (
        <ClaimModal
          item={item}
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          onSuccess={() => {
            fetchItem();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete Item Report"
        message={`Are you sure you want to permanently delete "${item.item_name}"?`}
        confirmText="Delete Report"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
