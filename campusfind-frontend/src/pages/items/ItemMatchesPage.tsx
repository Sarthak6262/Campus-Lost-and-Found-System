import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { itemService } from '../../services/itemService';
import { Item, MatchResult } from '../../types/item';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const ItemMatchesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [sourceItem, setSourceItem] = useState<Item | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [itemData, matchData] = await Promise.all([
        itemService.getItemById(Number(id)),
        itemService.getMatches(Number(id)),
      ]);
      setSourceItem(itemData);
      setMatches(matchData.matches);
    } catch (err: any) {
      setError(err.message || 'Could not load smart item matches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Item</span>
        </button>
      </div>

      {/* Target Item Reference Banner */}
      {sourceItem && (
        <Card className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-400/20 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>AI & Rule-Based Match Engine</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Searching Matches for: {sourceItem.item_name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                <span>
                  Type: <strong>{sourceItem.type}</strong>
                </span>
                <span>•</span>
                <span>
                  Category: <strong>{sourceItem.category}</strong>
                </span>
                <span>•</span>
                <span>
                  Location: <strong>{sourceItem.location}</strong>
                </span>
                {sourceItem.color && (
                  <>
                    <span>•</span>
                    <span>
                      Color: <strong>{sourceItem.color}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>

            <Link to={`/items/${sourceItem.id}`}>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/10 text-white hover:bg-white/20 border-white/20 text-xs shrink-0"
              >
                View Source Details
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Possible Matches ({matches.length})
          </h3>
          <p className="text-xs text-slate-500">
            Sorted by relevance based on Category, Keywords, Location, and Color matching
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500">Analyzing campus catalog for potential matches...</p>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-12 h-12 text-blue-300" />}
          title="No confident matches found yet"
          description="We couldn't locate any items with overlapping traits at this moment. You will be notified when new matching reports are submitted."
          action={{
            label: 'Browse All Items',
            onClick: () => navigate('/items'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card
              key={match.matched_item_id}
              className="p-5 md:p-6 transition-all hover:shadow-md hover:border-blue-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    {/* Score Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(
                        match.match_score
                      )}`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{Math.round(match.match_score)}% Match</span>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      Ref #{match.matched_item_id}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">
                    {match.matched_item_name}
                  </h4>

                  {/* Progress Bar */}
                  <div className="w-full max-w-md bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                        match.match_score
                      )}`}
                      style={{ width: `${Math.min(100, Math.max(5, match.match_score))}%` }}
                    />
                  </div>

                  {/* Reasons list */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Match Factors:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {match.reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{reason}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 flex items-center sm:self-center">
                  <Link to={`/items/${match.matched_item_id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                    >
                      Inspect Item
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
