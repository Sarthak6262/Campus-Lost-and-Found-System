import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Eye,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Claim, ClaimStatus } from '../../types/claim';
import { useToast } from '../../components/common/Toast';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Textarea } from '../../components/common/Textarea';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatters';

export const AdminClaimsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [claims, setClaims] = useState<Claim[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClaims, setTotalClaims] = useState(0);
  const [filterStatus, setFilterStatus] = useState<ClaimStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Modal State
  const [claimToReview, setClaimToReview] = useState<Claim | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [adminRemark, setAdminRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClaims = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllClaims(currentPage, 10, filterStatus || undefined);
      setClaims(response.data || response.items || []);
      setTotalPages(response.pages || response.total_pages || 1);
      setTotalClaims(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load claims queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [currentPage, filterStatus]);

  const handleFilterChange = (status: ClaimStatus | '') => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleOpenReview = (claim: Claim, action: 'APPROVE' | 'REJECT') => {
    setClaimToReview(claim);
    setReviewAction(action);
    setAdminRemark(
      action === 'APPROVE'
        ? 'Verified ownership against physical serial/marks. Item ready for pickup at security desk.'
        : 'Evidence provided did not sufficiently match the recovered item traits.'
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimToReview || !adminRemark.trim()) {
      showError('An administrative remark is required to record the decision.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (reviewAction === 'APPROVE') {
        await adminService.approveClaim(claimToReview.id, { admin_remark: adminRemark.trim() });
        showSuccess(`Claim #${claimToReview.id} approved successfully!`);
      } else {
        await adminService.rejectClaim(claimToReview.id, { admin_remark: adminRemark.trim() });
        showSuccess(`Claim #${claimToReview.id} rejected.`);
      }
      setClaimToReview(null);
      await fetchClaims();
    } catch (err: any) {
      showError(err.message || 'Failed to complete claim review action.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClaims = claims;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Claim Verification Queue
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Inspect proof of ownership submitted by students and approve custody transfers
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchClaims}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Filter Tabs */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => handleFilterChange('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === ''
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Claims
            </button>
            <button
              onClick={() => handleFilterChange('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'PENDING'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => handleFilterChange('APPROVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'APPROVED'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => handleFilterChange('REJECTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'REJECTED'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Rejected
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Total Claims Found: <strong>{totalClaims}</strong>
          </span>
        </div>
      </Card>

      {/* Table Content */}
      <Card className="overflow-hidden border border-slate-200/80 shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-slate-500">Loading claim records...</p>
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchClaims} />
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Clock className="w-12 h-12 text-slate-300" />}
              title="No claims in this category"
              description="There are currently no claims matching the selected filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Claim ID</th>
                  <th className="py-3.5 px-4">Target Item</th>
                  <th className="py-3.5 px-4">Claimant (User)</th>
                  <th className="py-3.5 px-4">Proof & Remarks</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                      #{claim.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        to={`/items/${claim.item_id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 group"
                        title="View item"
                      >
                        <span className="group-hover:underline">
                          {claim.item_name || `Item #${claim.item_id}`}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                      </Link>
                      {claim.item_category && (
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {claim.item_category}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold text-slate-900">
                        {claim.claimant_name || `User #${claim.user_id}`}
                      </div>
                      {claim.claimant_student_id && (
                        <div className="text-[11px] font-mono text-slate-500">
                          ID: {claim.claimant_student_id}
                        </div>
                      )}
                      {claim.claimant_email && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {claim.claimant_email}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="line-clamp-2 text-slate-700">
                        <strong>Reason:</strong> {claim.reason}
                      </div>
                      <div className="line-clamp-1 text-slate-500 text-[11px] mt-0.5">
                        <strong>Proof:</strong> {claim.identification_details}
                      </div>
                      {claim.admin_remark && (
                        <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                          Admin: {claim.admin_remark}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={claim.status.toLowerCase() as any}>
                        {claim.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">{formatDate(claim.created_at)}</td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Link to={`/claims/${claim.id}`}>
                        <button
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                          title="View Full Claim"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>

                      {claim.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            className="bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-2.5"
                            onClick={() => handleOpenReview(claim, 'APPROVE')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="text-xs py-1 px-2.5"
                            onClick={() => handleOpenReview(claim, 'REJECT')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
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

      {/* Review Modal */}
      {claimToReview && (
        <Modal
          isOpen={!!claimToReview}
          onClose={() => setClaimToReview(null)}
          title={
            reviewAction === 'APPROVE'
              ? `Approve Claim #${claimToReview.id}`
              : `Reject Claim #${claimToReview.id}`
          }
          description={`Record an official administrator decision for ${claimToReview.item_name || `Item #${claimToReview.item_id}`}.`}
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-200/80">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200/60">
                <div>
                  <span className="font-semibold text-slate-500 block">Claimant:</span>
                  <span className="text-slate-900 font-medium">
                    {claimToReview.claimant_name || `User #${claimToReview.user_id}`}
                  </span>
                  {claimToReview.claimant_student_id && (
                    <span className="text-slate-500 block text-[11px] font-mono">
                      ID: {claimToReview.claimant_student_id}
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Target Item:</span>
                  <span className="text-slate-900 font-medium">
                    {claimToReview.item_name || `Item #${claimToReview.item_id}`}
                  </span>
                  {claimToReview.item_category && (
                    <span className="text-slate-500 block text-[11px]">
                      {claimToReview.item_category}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-600">Claimant Reason:</span>
                <p className="text-slate-800 mt-0.5">{claimToReview.reason}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-600">Proof Provided:</span>
                <p className="text-slate-800 mt-0.5">{claimToReview.identification_details}</p>
              </div>
            </div>

            <Textarea
              label="Official Administrator Remark"
              rows={3}
              placeholder="Provide instructions for pickup, or specific reason for rejection..."
              value={adminRemark}
              onChange={(e) => setAdminRemark(e.target.value)}
              helperText="This explanation will be permanently recorded and visible to the claimant."
              required
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setClaimToReview(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={reviewAction === 'APPROVE' ? 'primary' : 'danger'}
                className={
                  reviewAction === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : undefined
                }
                isLoading={isSubmitting}
                loadingText="Submitting decision..."
              >
                Confirm {reviewAction === 'APPROVE' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
