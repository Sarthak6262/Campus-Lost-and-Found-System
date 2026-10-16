import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { claimService } from '../../services/claimService';
import { itemService } from '../../services/itemService';
import { Claim } from '../../types/claim';
import { Item } from '../../types/item';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { HandoverReceiptCard } from '../../components/claims/HandoverReceiptCard';
import { formatDate, formatDateTime, getImageUrl } from '../../utils/formatters';

export const ClaimDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [claim, setClaim] = useState<Claim | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClaimAndItem = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const claimData = await claimService.getClaimById(Number(id));
        setClaim(claimData);

        // Fetch claimed item info
        try {
          const itemData = await itemService.getItemById(claimData.item_id);
          setItem(itemData);
        } catch (itemErr) {
          console.warn('Could not load associated item:', itemErr);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve claim record');
      } finally {
        setIsLoading(false);
      }
    };

    loadClaimAndItem();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Loading claim record...</p>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Claim Not Found"
          message={error || 'The requested claim could not be found.'}
          onRetry={() => window.location.reload()}
        />
        <div className="text-center mt-4">
          <Link to="/claims">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to My Claims
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBanner = () => {
    switch (claim.status) {
      case 'APPROVED':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          title: 'Claim Approved by Campus Administration',
          desc: 'Your proof of ownership has been verified. You may collect your item at the campus central Lost & Found desk or contact the reporter.',
        };
      case 'REJECTED':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          title: 'Claim Rejected by Administrator',
          desc: 'The evidence provided was insufficient or conflicting. Review the admin remarks below.',
        };
      default:
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          icon: <Clock className="w-5 h-5 text-amber-600 shrink-0" />,
          title: 'Claim Pending Administrator Review',
          desc: 'Your claim has been submitted into the verification queue. Campus authorities will inspect the proof shortly.',
        };
    }
  };

  const banner = getStatusBanner();

  const viewingRole: 'OWNER' | 'FINDER' | 'ADMIN' =
    user?.id === claim.user_id
      ? 'OWNER'
      : item && user?.id === item.reported_by
      ? 'FINDER'
      : user?.role === 'ADMIN'
      ? 'ADMIN'
      : 'OWNER';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Claims</span>
        </button>

        <span className="text-xs font-mono text-slate-400">Claim ID #{claim.id}</span>
      </div>

      {/* Handover Receipt & Mutual Contact Details if APPROVED */}
      {claim.status === 'APPROVED' ? (
        <HandoverReceiptCard claim={claim} viewingRole={viewingRole} />
      ) : (
        /* Status Notice */
        <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${banner.bg}`}>
          {banner.icon}
          <div>
            <h3 className="text-sm font-bold">{banner.title}</h3>
            <p className="text-xs mt-0.5 leading-relaxed opacity-90">{banner.desc}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Claim Details */}
        <Card className="p-6 md:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Claim Documentation</h2>
              <p className="text-xs text-slate-500">Submitted on {formatDateTime(claim.created_at)}</p>
            </div>
            <Badge variant={claim.status.toLowerCase() as any} size="md">
              {claim.status}
            </Badge>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Reason for Claim
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800 leading-relaxed">
              {claim.reason}
            </div>
          </div>

          {/* Identification proof */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Proof & Identification Details Provided
            </span>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
              {claim.identification_details}
            </div>
          </div>

          {/* Administrator remark */}
          {claim.admin_remark && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Administrative Feedback
              </span>
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-sm text-blue-900 leading-relaxed">
                {claim.admin_remark}
              </div>
            </div>
          )}

          {/* Verification Timeline */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verification Lifecycle
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Claim registered on {formatDateTime(claim.created_at)}</span>
              </div>
              {claim.status !== 'PENDING' ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>
                    Status updated to {claim.status} on {formatDateTime(claim.updated_at)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Awaiting administration review</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Right Column: Claimed Item Card */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Associated Found Item
            </h3>

            {item ? (
              <div className="space-y-3">
                <div className="h-36 rounded-xl bg-slate-100 overflow-hidden relative">
                  {item.image_url ? (
                    <img
                      src={getImageUrl(item.image_url)}
                      alt={item.item_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                      <span className="text-3xl mb-1">📦</span>
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant={item.type === 'LOST' ? 'lost' : 'found'}>
                      {item.type}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                    {item.item_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-medium">{item.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Found Date:</span>
                    <span className="font-medium">{formatDate(item.item_date)}</span>
                  </div>
                </div>

                <Link to={`/items/${item.id}`} className="block pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    View Item Page
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-xs text-slate-500 p-4 bg-slate-50 rounded-xl text-center">
                <span className="font-semibold text-slate-800 block text-sm mb-1">
                  {claim.item_name || `Item ID #${claim.item_id}`}
                </span>
                {claim.item_category && (
                  <span className="text-slate-500 block text-xs mb-2">{claim.item_category}</span>
                )}
                <Link to={`/items/${claim.item_id}`} className="block mt-2">
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    Inspect Item #{claim.item_id}
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
