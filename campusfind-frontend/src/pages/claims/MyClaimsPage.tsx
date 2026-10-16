import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  Inbox,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import { claimService } from '../../services/claimService';
import { Claim } from '../../types/claim';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatters';

export const MyClaimsPage: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClaims = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await claimService.getMyClaims();
      setClaims(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your claims');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Ownership Claims</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track verification progress, finder contact details, and handover receipts
          </p>
        </div>

        <Link to="/items">
          <Button variant="outline" size="sm" leftIcon={<ShieldCheck className="w-4 h-4" />}>
            Browse Found Items
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500">Retrieving your claim records...</p>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchClaims} />
      ) : claims.length === 0 ? (
        <EmptyState
          icon={<Inbox className="w-12 h-12 text-slate-300" />}
          title="No claims filed yet"
          description="When you spot an item in the Campus Found catalog that belongs to you, submit a claim with verifying evidence."
          action={{
            label: 'Search Found Items',
            onClick: () => navigate('/items?type=FOUND'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="p-5 md:p-6 transition hover:border-blue-200">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Claim #{claim.id}</span>
                    <span className="text-slate-300">•</span>
                    <Badge
                      variant={claim.status.toLowerCase() as any}
                      className="inline-flex items-center gap-1.5"
                    >
                      {getStatusIcon(claim.status)}
                      <span>{claim.status}</span>
                    </Badge>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">
                      Filed on {formatDate(claim.created_at)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {claim.item_name || `Item Reference #${claim.item_id}`}
                    </h3>
                    {claim.item_category && (
                      <Badge variant="secondary" className="text-[11px] font-normal">
                        {claim.item_category}
                      </Badge>
                    )}
                  </div>

                  {/* Approved Handover Coordination Banner */}
                  {claim.status === 'APPROVED' && (
                    <div className="p-3.5 rounded-xl text-xs bg-emerald-50 border border-emerald-200/90 text-emerald-950 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Ownership Verified — Ready for Handover!</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-0.5">
                        {claim.finder_name && (
                          <div className="flex items-center gap-1.5 text-slate-700 bg-white/90 p-2 rounded-lg border border-emerald-100">
                            <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>
                              Finder: <strong>{claim.finder_name}</strong>{' '}
                              {claim.finder_phone ? `(${claim.finder_phone})` : ''}
                            </span>
                          </div>
                        )}
                        {claim.collection_location && (
                          <div className="flex items-center gap-1.5 text-slate-700 bg-white/90 p-2 rounded-lg border border-emerald-100">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>
                              Pickup: <strong>{claim.collection_location}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">
                        Your Reason:
                      </span>
                      <p className="text-slate-700 line-clamp-2">{claim.reason}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500 block mb-0.5">
                        Proof Provided:
                      </span>
                      <p className="text-slate-700 line-clamp-2">
                        {claim.identification_details}
                      </p>
                    </div>
                  </div>

                  {/* Admin feedback if processed */}
                  {claim.admin_remark && (
                    <div
                      className={`p-3 rounded-xl text-xs border ${
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <strong className="font-semibold">Administrator Remark:</strong>{' '}
                      {claim.admin_remark}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 shrink-0 pt-2 md:pt-0">
                  <Link to={`/claims/${claim.id}`}>
                    <Button
                      size="sm"
                      variant={claim.status === 'APPROVED' ? 'primary' : 'outline'}
                      className={
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-600 hover:bg-emerald-500 w-full'
                          : 'w-full'
                      }
                      leftIcon={
                        claim.status === 'APPROVED' ? (
                          <FileText className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {claim.status === 'APPROVED' ? 'Handover Receipt' : 'Claim Details'}
                    </Button>
                  </Link>

                  <Link to={`/items/${claim.item_id}`}>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      View Item
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
