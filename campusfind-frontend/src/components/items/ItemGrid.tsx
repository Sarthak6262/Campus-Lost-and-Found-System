import React from 'react';
import { Item } from '../../types/item';
import { CardSkeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { ItemCard } from './ItemCard';

export interface ItemGridProps {
  items: Item[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyMessage?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  showActions?: boolean;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  currentUserId?: number;
}

export const ItemGrid: React.FC<ItemGridProps> = ({
  items,
  isLoading = false,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyMessage,
  emptyActionText,
  onEmptyAction,
  showActions = false,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No items found'}
        description={emptyMessage || emptyDescription || 'Try adjusting your search criteria.'}
        actionText={emptyActionText}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          showActions={showActions}
          onEdit={onEdit}
          onDelete={onDelete}
          isOwner={currentUserId === item.reported_by}
        />
      ))}
    </div>
  );
};
