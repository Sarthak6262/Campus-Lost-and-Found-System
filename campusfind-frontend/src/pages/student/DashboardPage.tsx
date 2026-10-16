import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  FileQuestion,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Inbox,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { Item } from '../../types/item';
import { Claim } from '../../types/claim';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ItemCard } from '../../components/items/ItemCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userItems, userClaims] = await Promise.all([
        userService.getMyItems(),
        userService.getMyClaims(),
      ]);
      setItems(userItems);
      setClaims(userClaims);
    } catch (err: any) {
      setError(err.message || 'Failed to load your dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const lostCount = items.filter((i) => i.type === 'LOST').length;
  const foundCount = items.filter((i) => i.type === 'FOUND').length;
  const activeClaimsCount = claims.filter((c) => c.status === 'PENDING').length;
  const approvedClaims = claims.filter((c) => c.status === 'APPROVED');
  const returnedCount = items.filter((i) => i.status === 'RETURNED').length;
  const recentItems = items.slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 md:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Campus Lost & Found Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="mt-2 text-slate-300 text-sm md:text-base leading-relaxed">
            Report lost belongings, browse items found across campus, and manage your ownership
            claims in real-time.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/items/report-lost">
              <Button
                variant="primary"
                size="md"
                className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-900/40"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                Report Lost Item
              </Button>
            </Link>
            <Link to="/items/report-found">
              <Button
                variant="secondary"
                size="md"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                leftIcon={<PlusCircle className="w-4 h-4 text-emerald-400" />}
              >
                Report Found Item
              </Button>
            </Link>
            <Link to="/claims">
              <Button
                variant="outline"
                size="md"
                className="border-slate-600 text-slate-200 hover:bg-white/10"
                leftIcon={<FileCheck2 className="w-4 h-4 text-amber-400" />}
              >
                My Claims
              </Button>
            </Link>
            <Link to="/items">
              <Button
                variant="outline"
                size="md"
                className="border-slate-600 text-slate-200 hover:bg-white/10"
                leftIcon={<Search className="w-4 h-4" />}
              >
                Search Campus Items
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Lost Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <FileQuestion className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{lostCount}</div>
          <p className="mt-1 text-xs text-slate-500">Awaiting matching or return</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Found Reports
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{foundCount}</div>
          <p className="mt-1 text-xs text-slate-500">Reported to help fellow students</p>
        </Card>

        <Link to="/claims" className="block group">
          <Card className="p-5 border-l-4 border-l-amber-500 hover:border-amber-400 hover:shadow-md transition cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-amber-700 transition">
                Active Claims
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold text-slate-900">{activeClaimsCount}</div>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-slate-500">Pending admin review</p>
              <span className="text-[11px] font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View &rarr;
              </span>
            </div>
          </Card>
        </Link>

        <Card className="p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Returned Items
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{returnedCount}</div>
          <p className="mt-1 text-xs text-slate-500">Successfully restored</p>
        </Card>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Recent Reports</h2>
            <p className="text-sm text-slate-500">Latest items reported by your account</p>
          </div>
          {items.length > 0 && (
            <Link
              to="/student/items"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
            >
              <span>View all my items</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : recentItems.length === 0 ? (
          <EmptyState
            icon={<Inbox className="w-12 h-12 text-slate-300" />}
            title="No reports created yet"
            description="You haven't reported any lost or found items. Get started right away if you lost or found something on campus."
            action={{
              label: 'Report Lost Item',
              onClick: () => {},
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Approved Claims Handover Notification Banner */}
      {approvedClaims.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-200 text-emerald-800">
                  Claim Successful
                </span>
                <h4 className="text-sm font-semibold text-emerald-950">
                  {approvedClaims.length === 1
                    ? `Your claim for "${approvedClaims[0].item_name || 'item'}" was approved!`
                    : `${approvedClaims.length} of your claims have been approved!`}
                </h4>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                The finder's contact details, collection location, and your official handover receipt are now ready.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to={approvedClaims.length === 1 ? `/claims/${approvedClaims[0].id}` : '/claims'}>
              <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs">
                View Contact &amp; Receipt &rarr;
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Access Claim Notification & Information Banner */}
      {activeClaimsCount > 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                You have {activeClaimsCount} pending claim(s) under review
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Campus admin will review your proof of ownership soon. Check status and remarks anytime.
              </p>
            </div>
          </div>
          <Link to="/claims" className="shrink-0">
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 bg-white hover:bg-amber-50">
              View My Claims ({claims.length})
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900">
                Ownership Claims Portal
              </h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Found your lost belongings in the campus inventory? Submit a claim with proof of ownership for administrator verification.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/claims">
              <Button size="sm" variant="outline" className="border-blue-300 text-blue-900 bg-white hover:bg-blue-50">
                My Claims ({claims.length})
              </Button>
            </Link>
            <Link to="/items?type=FOUND">
              <Button size="sm" variant="primary" className="bg-blue-600 hover:bg-blue-500">
                Browse Found Items
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
