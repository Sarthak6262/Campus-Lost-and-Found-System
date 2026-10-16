import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  description?: string;
  trend?: string | { label: string; href?: string };
  color?: 'brand' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  description,
  trend,
  color = 'brand',
}) => {
  const colorMap = {
    brand: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const descText = description || subtitle;

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          {descText && <p className="text-xs text-slate-500 mt-1">{descText}</p>}
        </div>
        <div className={`p-3 rounded-2xl border ${colorMap[color]} shrink-0 shadow-xs`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-medium">
          {typeof trend === 'string' ? (
            <span className="text-blue-600">{trend}</span>
          ) : trend.href ? (
            <Link
              to={trend.href}
              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-semibold"
            >
              <span>{trend.label}</span>
              <span>→</span>
            </Link>
          ) : (
            <span className="text-slate-600">{trend.label}</span>
          )}
        </div>
      )}
    </Card>
  );
};
