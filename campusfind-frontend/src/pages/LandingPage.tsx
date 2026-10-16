import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  FileCheck,
  PackagePlus,
  PackageSearch,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { itemService } from '../services/itemService';
import { Item } from '../types/item';
import { ItemCard } from '../components/items/ItemCard';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await itemService.getAllItems(1, 4);
        setRecentItems(response.data || []);
      } catch (e) {
        console.error('Failed to load recent items for landing page', e);
      } finally {
        setIsLoadingItems(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100 py-16 sm:py-24">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Smart Lost & Found Portal for Campus Students</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-3xl mx-auto">
            Lost Something? <br />
            <span className="text-brand-600">Find It on Campus.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A simple and secure way for students to report, discover, and recover lost belongings
            across campus with automated smart matching and verified claims.
          </p>

          {/* Call-to-action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/items/report-lost')}
              icon={<PackageSearch className="w-5 h-5" />}
            >
              Report Lost Item
            </Button>

            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/items')}
              icon={<Search className="w-5 h-5" />}
            >
              Find an Item
            </Button>

            {!isAuthenticated && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                >
                  Student Login
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => navigate('/register')}
                >
                  Register Free
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Simple 4-Step Process
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How CampusFind Works
          </h3>
          <p className="text-sm text-slate-500">
            Recovering your belongings on campus has never been more straightforward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-base border border-brand-100">
              1
            </div>
            <h4 className="font-semibold text-slate-900 text-base">Report</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Log details of an item you lost or found on campus with descriptions, location, and photos.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base border border-blue-100">
              2
            </div>
            <h4 className="font-semibold text-slate-900 text-base">Search & Match</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Explore the campus directory or let our smart matching algorithm instantly calculate high-confidence matches.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-base border border-purple-100">
              3
            </div>
            <h4 className="font-semibold text-slate-900 text-base">Claim</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Submit an ownership claim with unique identifiers and private proof details only the true owner knows.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base border border-emerald-100">
              4
            </div>
            <h4 className="font-semibold text-slate-900 text-base">Recover</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Admin reviews and approves your claim. Meet safely to reclaim your belonging!
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white border-y border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Campus-Grade Tools
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Designed For Students & Campus Staff
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
                <PackageSearch className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 text-base">Lost Item Reporting</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Report lost laptops, student IDs, keys, and wallets with precise location tracking and dates.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <PackagePlus className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 text-base">Found Item Reporting</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Found something? Help your peer find it fast by posting a report with high-res photo uploads.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 text-base">Smart Rule-Based Matching</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Automated algorithms match categories, keywords, colors, dates, and locations with confidence scores.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 text-base">Verified Claim Workflow</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Protects legitimate owners from fraudulent claims with verifiable proof fields and admin review.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 text-base">Campus-Wide Search</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Instant keyword search with granular filters by department, campus hall, category, and date.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 text-base">Admin Oversight</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                College staff monitor inventory, verify claims, ban bad actors, and track recovery rates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items Preview */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Live Campus Feed</h2>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">Recently Reported Items</h3>
          </div>
          <Link
            to="/items"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 transition"
          >
            <span>View All Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!isLoadingItems && recentItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              No recent items yet. Be the first to report a lost or found item!
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button size="sm" onClick={() => navigate('/items/report-lost')}>
                Report Lost
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate('/items/report-found')}>
                Report Found
              </Button>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};
