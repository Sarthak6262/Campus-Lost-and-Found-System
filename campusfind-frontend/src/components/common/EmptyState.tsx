import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'Try adjusting your search criteria or check back later.',
  icon,
  actionText,
  onAction,
  action,
  className = '',
}) => {
  const btnLabel = action?.label || actionText;
  const btnAction = action?.onClick || onAction;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-dashed border-slate-200/90 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center mb-4">
        {icon || <PackageSearch className="w-7 h-7" />}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {btnLabel && btnAction && (
        <Button variant="primary" onClick={btnAction}>
          {btnLabel}
        </Button>
      )}
    </div>
  );
};
