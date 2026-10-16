import React from 'react';
import { Calendar, MapPin, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Item } from '../../types/item';
import { formatDate, getImageUrl } from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';

interface ItemCardProps {
  item: Item;
  showActions?: boolean;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
  isOwner?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  showActions = false,
  onEdit,
  onDelete,
  isOwner = false,
}) => {
  const navigate = useNavigate();
  const imageUrl = getImageUrl(item.image_url);

  return (
    <Card
      hover
      onClick={() => navigate(`/items/${item.id}`)}
      className="flex flex-col h-full overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.item_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300 group-hover:text-slate-400 transition">
            <Tag className="w-12 h-12 stroke-[1.2] mb-1" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {item.category}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge type={item.type} />
        </div>
        <div className="absolute top-3 right-3">
          <Badge status={item.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition text-base">
              {item.item_name}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="space-y-1.5 pt-1 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDate(item.item_date)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {item.category}
          </span>

          {showActions && isOwner ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <button
                  onClick={() => onEdit(item)}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 transition"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(item)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 transition"
                >
                  Delete
                </button>
              )}
            </div>
          ) : (
            <span className="text-xs font-medium text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              Details &rarr;
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
