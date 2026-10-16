import React from 'react';
import { ItemCategory, ItemStatus, ItemType } from '../../types/item';
import { ClaimStatus } from '../../types/claim';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?:
    | 'lost'
    | 'found'
    | 'status'
    | 'category'
    | 'claim'
    | 'active'
    | 'claimed'
    | 'returned'
    | 'closed'
    | 'default'
    | string;
  size?: 'sm' | 'md';
  type?: ItemType;
  status?: ItemStatus | ClaimStatus | string;
  category?: ItemCategory | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  type,
  status,
  category,
  className = '',
}) => {
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]';

  // Lost/Found Type badge
  if (type || variant === 'lost' || variant === 'found') {
    const isLost = type === 'LOST' || variant === 'lost';
    return (
      <span
        className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider ${sizeClasses} ${
          isLost
            ? 'bg-rose-50 text-rose-700 border border-rose-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        } ${className}`}
      >
        {children || type || (isLost ? 'LOST' : 'FOUND')}
      </span>
    );
  }

  // Active / Claimed / Returned / Closed variants
  if (variant === 'active' || status === 'ACTIVE') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 ${sizeClasses} ${className}`}
      >
        {children || status || 'Active'}
      </span>
    );
  }

  if (variant === 'claimed' || status === 'CLAIMED') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium border bg-blue-50 text-blue-700 border-blue-200 ${sizeClasses} ${className}`}
      >
        {children || status || 'Claimed'}
      </span>
    );
  }

  if (variant === 'returned' || status === 'RETURNED' || status === 'APPROVED') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium border bg-purple-50 text-purple-700 border-purple-200 ${sizeClasses} ${className}`}
      >
        {children || status || 'Returned'}
      </span>
    );
  }

  if (variant === 'closed' || status === 'CLOSED') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium border bg-slate-100 text-slate-600 border-slate-200 ${sizeClasses} ${className}`}
      >
        {children || status || 'Closed'}
      </span>
    );
  }

  if (variant === 'pending' || status === 'PENDING') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium border bg-amber-50 text-amber-700 border-amber-200 ${sizeClasses} ${className}`}
      >
        {children || status || 'Pending'}
      </span>
    );
  }

  if (variant === 'rejected' || status === 'REJECTED') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-medium border bg-rose-50 text-rose-700 border-rose-200 ${sizeClasses} ${className}`}
      >
        {children || status || 'Rejected'}
      </span>
    );
  }

  // Category badge
  if (category || variant === 'category') {
    return (
      <span
        className={`inline-flex items-center rounded-md font-medium bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}
      >
        {children || category}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
