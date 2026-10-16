import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileQuestion,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Archive,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { adminService, DashboardStats } from '../../services/adminService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/admin/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Loading campus management metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Dashboard Unavailable"
          message={error || 'Could not fetch admin statistics'}
          onRetry={fetchStats}
        />
      </div>
    );
  }

  const recoveryRate =
    stats.total_lost_items + stats.total_found_items > 0
      ? Math.round(
          (stats.returned_items / (stats.total_lost_items + stats.total_found_items)) * 100
        )
      : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Campus Administrative Control</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            System Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time overview of users, reports, verifications, and campus recovery efficiency
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Metrics
          </Button>
        </div>
      </div>

      {/* Main 9 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Registered Users"
          value={stats.total_users}
          icon={<Users className="w-5 h-5" />}
          description="Enrolled students & staff"
          trend={{ label: 'Manage Accounts', href: '/admin/users' }}
        />

        <StatCard
          title="Total Lost Items"
          value={stats.total_lost_items}
          icon={<FileQuestion className="w-5 h-5 text-rose-600" />}
          description="Reports of misplaced belongings"
          trend={{ label: 'View Reports', href: '/admin/items' }}
        />

        <StatCard
          title="Total Found Items"
          value={stats.total_found_items}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          description="Items submitted to lost & found"
          trend={{ label: 'View Catalog', href: '/admin/items' }}
        />

        <StatCard
          title="Active Items"
          value={stats.active_items}
          icon={<FolderOpen className="w-5 h-5 text-blue-600" />}
          description="Currently open for matching/claims"
        />

        <StatCard
          title="Pending Claims"
          value={stats.pending_claims}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          description="Awaiting admin proof verification"
          trend={{ label: 'Review Claims Now', href: '/admin/claims' }}
        />

        <StatCard
          title="Claimed Items"
          value={stats.claimed_items}
          icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
          description="Ownership verified & locked"
        />

        <StatCard
          title="Returned to Owner"
          value={stats.returned_items}
          icon={<Archive className="w-5 h-5 text-purple-600" />}
          description="Successfully handed back to student"
        />

        <StatCard
          title="Approved Claims"
          value={stats.approved_claims}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          description="Verified valid claims"
        />

        <StatCard
          title="Rejected Claims"
          value={stats.rejected_claims}
          icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
          description="Unverified or invalid claims"
        />
      </div>

      {/* Operational Highlights & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recovery Analytics Card */}
        <Card className="p-6 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Campus Recovery Rate</h3>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="text-center py-4">
            <div className="text-4xl font-extrabold text-slate-900">{recoveryRate}%</div>
            <p className="text-xs text-slate-500 mt-1">
              Of total recorded items have been restored to students
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, recoveryRate))}%` }}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
            <div className="flex justify-between">
              <span>Total Catalogued:</span>
              <span className="font-semibold text-slate-700">
                {stats.total_lost_items + stats.total_found_items} items
              </span>
            </div>
            <div className="flex justify-between">
              <span>Successfully Returned:</span>
              <span className="font-semibold text-slate-700">{stats.returned_items} items</span>
            </div>
          </div>
        </Card>

        {/* Action Shortcuts */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Administrative Tasks & Queues</h3>
            <p className="text-xs text-slate-500">Quickly triage pending requests and records</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Link
              to="/admin/claims"
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-amber-50/50 hover:border-amber-300 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-lg bg-amber-100 text-amber-700">
                    <Clock className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-amber-700 px-2 py-0.5 rounded-full bg-amber-100">
                    {stats.pending_claims} Pending
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Verify Claims</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect student proof and approve or reject claims.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-800 group-hover:translate-x-1 transition-transform">
                <span>Open Claims Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/admin/items"
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <FolderOpen className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-blue-700 px-2 py-0.5 rounded-full bg-blue-100">
                    {stats.active_items} Active
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Manage Items</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Update item status, remove improper reports, or mark returned.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-800 group-hover:translate-x-1 transition-transform">
                <span>Inspect Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-300 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                    <Users className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-indigo-700 px-2 py-0.5 rounded-full bg-indigo-100">
                    {stats.total_users} Users
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Student Directory</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Review student credentials, toggle active status, or manage access.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-800 group-hover:translate-x-1 transition-transform">
                <span>View Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
