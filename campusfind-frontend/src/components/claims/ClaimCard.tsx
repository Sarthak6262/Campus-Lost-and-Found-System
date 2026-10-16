import React from 'react';
import { Calendar, ChevronRight, FileText, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Claim } from '../../types/claim';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface ClaimCardProps {
  claim: Claim;
  itemName?: string;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({ claim, itemName }) => {
  const navigate = useNavigate();

  return (
    <Card
      hover
      onClick={() => navigate(`/claims/${claim.id}`)}
      className="p-5 flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-400">Claim #{claim.id}</span>
            <h4 className="text-base font-semibold text-slate-900 mt-0.5 line-clamp-1">
              {itemName || `Item #${claim.item_id}`}
            </h4>
          </div>
          <Badge status={claim.status} />
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 text-slate-600">{claim.reason}</p>
          </div>
          <div className="flex items-center gap-2 text-slate-400 pt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Submitted {formatDate(claim.created_at)}</span>
          </div>
        </div>

        {claim.admin_remark && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700">Admin Remark: </span>
              <span>{claim.admin_remark}</span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-medium">
        <span>View Claim Details</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </Card>
  );
};
