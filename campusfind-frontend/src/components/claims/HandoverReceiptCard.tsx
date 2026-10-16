import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  Printer,
  Copy,
  Check,
  User as UserIcon,
} from 'lucide-react';
import { Claim } from '../../types/claim';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatDateTime } from '../../utils/formatters';

interface HandoverReceiptCardProps {
  claim: Claim;
  viewingRole?: 'OWNER' | 'FINDER' | 'ADMIN';
  className?: string;
}

export const HandoverReceiptCard: React.FC<HandoverReceiptCardProps> = ({
  claim,
  viewingRole = 'OWNER',
  className = '',
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = `REC-CF-${claim.id.toString().padStart(5, '0')}`;
  const isOwnerViewing = viewingRole === 'OWNER';

  return (
    <div
      className={`bg-white rounded-2xl border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/5 overflow-hidden print:border print:shadow-none ${className}`}
    >
      {/* Receipt Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 md:p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Campus Handover Receipt</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">
              Ownership Verified & Approved
            </h2>
            <p className="text-xs text-emerald-100">
              Authorized custody transfer documentation • Receipt #{receiptNumber}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              className="bg-white/90 hover:bg-white text-slate-800 text-xs shadow-sm font-semibold"
            >
              Print Receipt
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Coordination Notice */}
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-emerald-950 text-sm">
              {isOwnerViewing
                ? 'Your claim was verified! Connect with the finder below to receive your item.'
                : 'Ownership has been verified! Coordinate with the rightful owner below to return the item.'}
            </p>
            <p className="text-emerald-800 leading-relaxed">
              Campus administration has verified this claim. The contact details of both parties are
              shared below so you can schedule a secure handover on campus.
            </p>
          </div>
        </div>

        {/* Mutual Parties Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Finder Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isOwnerViewing
                ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/20'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    {isOwnerViewing ? 'Item Finder (Custodian)' : 'Item Finder (You)'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {claim.finder_name || 'Campus Student Finder'}
                  </h3>
                </div>
              </div>
              <Badge variant="found" size="sm">Finder</Badge>
            </div>

            <div className="mt-3.5 space-y-2.5 text-xs">
              {claim.finder_phone && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-semibold">{claim.finder_phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${claim.finder_phone}`}
                      className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition"
                    >
                      Call
                    </a>
                    <button
                      onClick={() => copyToClipboard(claim.finder_phone!, 'finder_phone')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                      title="Copy phone"
                    >
                      {copiedField === 'finder_phone' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {claim.finder_email && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-700 truncate pr-2">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{claim.finder_email}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`mailto:${claim.finder_email}?subject=Campus Lost %26 Found Handover for ${claim.item_name || 'Item'}`}
                      className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition"
                    >
                      Email
                    </a>
                    <button
                      onClick={() => copyToClipboard(claim.finder_email!, 'finder_email')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                      title="Copy email"
                    >
                      {copiedField === 'finder_email' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {claim.finder_department && (
                <div className="flex items-center gap-2 text-slate-600 px-1 pt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dept: {claim.finder_department}</span>
                </div>
              )}

              {claim.finder_student_id && (
                <div className="text-[11px] text-slate-400 font-mono px-1">
                  Student ID: {claim.finder_student_id}
                </div>
              )}
            </div>
          </div>

          {/* Verified Owner Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              !isOwnerViewing
                ? 'bg-emerald-50/50 border-emerald-200 ring-2 ring-emerald-500/20'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                    {!isOwnerViewing ? 'Verified Owner (Claimant)' : 'Verified Owner (You)'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {claim.claimant_name || 'Verified Student Owner'}
                  </h3>
                </div>
              </div>
              <Badge variant="lost" size="sm">Owner</Badge>
            </div>

            <div className="mt-3.5 space-y-2.5 text-xs">
              {claim.claimant_phone && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{claim.claimant_phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${claim.claimant_phone}`}
                      className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition"
                    >
                      Call
                    </a>
                    <button
                      onClick={() => copyToClipboard(claim.claimant_phone!, 'claimant_phone')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                      title="Copy phone"
                    >
                      {copiedField === 'claimant_phone' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {claim.claimant_email && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                  <div className="flex items-center gap-2 text-slate-700 truncate pr-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{claim.claimant_email}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`mailto:${claim.claimant_email}?subject=Campus Lost %26 Found Handover for ${claim.item_name || 'Item'}`}
                      className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] transition"
                    >
                      Email
                    </a>
                    <button
                      onClick={() => copyToClipboard(claim.claimant_email!, 'claimant_email')}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                      title="Copy email"
                    >
                      {copiedField === 'claimant_email' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {claim.claimant_department && (
                <div className="flex items-center gap-2 text-slate-600 px-1 pt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dept: {claim.claimant_department}</span>
                </div>
              )}

              {claim.claimant_student_id && (
                <div className="text-[11px] text-slate-400 font-mono px-1">
                  Student ID: {claim.claimant_student_id}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Handover & Collection Point Details */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Designated Collection / Handover Point</span>
          </h4>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm block">
                {claim.collection_location || 'Campus Central Security Lost & Found Desk'}
              </span>
              <span className="text-slate-500 text-[11px]">
                Item Target: <strong>{claim.item_name || `Item #${claim.item_id}`}</strong>{' '}
                {claim.item_category ? `(${claim.item_category})` : ''}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shrink-0">
              Item Ref: <strong>#{claim.item_id}</strong>
            </div>
          </div>
        </div>

        {/* Official Administrator Remark */}
        {claim.admin_remark && (
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs space-y-1">
            <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px] block">
              Official Administrator Instructions
            </span>
            <p className="text-blue-950 font-medium leading-relaxed">{claim.admin_remark}</p>
          </div>
        )}

        {/* Official Verification Stamp & Timestamp Footer */}
        <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Decision Recorded: <strong>{formatDateTime(claim.updated_at)}</strong>
            </span>
          </div>

          <div className="font-mono text-[11px] text-slate-400">
            Receipt Verification ID: {receiptNumber}
          </div>
        </div>
      </div>
    </div>
  );
};
