import React, { useState } from 'react';
import {
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { AllergenMatchResult } from '../utils/allergenChecker';

interface AllergenAlertBannerProps {
  matches: AllergenMatchResult[];
  onScrollToNutrition?: () => void;
}

export const AllergenAlertBanner: React.FC<AllergenAlertBannerProps> = ({
  matches,
  onScrollToNutrition,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!matches || matches.length === 0) return null;

  return (
    <div
      className="bg-rose-950/40 dark:bg-rose-950/60 border-2 border-rose-500/80 rounded-xl p-4 sm:p-5 shadow-lg space-y-3.5 transition-all text-[#332421] dark:text-rose-100 animate-in fade-in slide-in-from-top-2 duration-300 ring-4 ring-rose-500/10"
      role="alert"
      aria-live="assertive"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
            <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded shadow-xs">
                ALLERGEN WATCHLIST ALERT
              </span>
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-300">
                {matches.length} Match{matches.length !== 1 ? 'es' : ''} Detected
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-rose-950 dark:text-rose-100 mt-1 leading-snug">
              Explicit Warning: Packaging data contains allergen(s) from your personal profile!
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {onScrollToNutrition && (
            <button
              type="button"
              onClick={onScrollToNutrition}
              className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg bg-rose-700/30 hover:bg-rose-700/50 text-rose-900 dark:text-rose-200 border border-rose-500/50 transition-colors cursor-pointer"
            >
              View in Ingredients &darr;
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Matched Allergen Badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        {matches.map((item) => (
          <span
            key={item.allergen}
            className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{item.allergen}</span>
          </span>
        ))}
      </div>

      {/* Expanded Breakdown */}
      {isExpanded && (
        <div className="space-y-2.5 pt-1 border-t border-rose-500/30">
          <p className="text-xs text-rose-900 dark:text-rose-200/90 leading-relaxed font-sans">
            The automated inspection detected direct mentions or synonyms of your monitored allergies in the extracted packaging declarations or ingredients list:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {matches.map((item) => (
              <div
                key={item.allergen}
                className="bg-white/80 dark:bg-slate-950/70 border border-rose-500/40 rounded-lg p-3 space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-rose-700 dark:text-rose-400">
                    Allergen: {item.allergen}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Matched Term: {item.matchedTerms.join(', ')}
                  </span>
                </div>

                {item.foundInDeclarations.length > 0 && (
                  <div className="text-[11px] text-[#332421]/90 dark:text-slate-300 bg-amber-500/10 border border-amber-500/30 rounded p-1.5">
                    <span className="font-bold text-amber-700 dark:text-amber-300">Packaging Declaration: </span>
                    <span>&ldquo;{item.foundInDeclarations.join('; ')}&rdquo;</span>
                  </div>
                )}

                {item.foundInIngredients.length > 0 && (
                  <div className="text-[11px] text-[#332421]/90 dark:text-slate-300 bg-rose-500/10 border border-rose-500/30 rounded p-1.5">
                    <span className="font-bold text-rose-700 dark:text-rose-300">Detected in Ingredients: </span>
                    <span>&ldquo;{item.foundInIngredients.join('; ')}&rdquo;</span>
                  </div>
                )}

                {item.foundInRawText.length > 0 && item.foundInDeclarations.length === 0 && item.foundInIngredients.length === 0 && (
                  <div className="text-[11px] text-[#332421]/90 dark:text-slate-300 bg-rose-500/10 border border-rose-500/30 rounded p-1.5">
                    <span className="font-bold text-rose-700 dark:text-rose-300">Found in Product Text: </span>
                    <span>&ldquo;{item.foundInRawText.join('; ')}&rdquo;</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-rose-800 dark:text-rose-300 font-mono bg-rose-500/15 border border-rose-500/30 p-2 rounded-lg">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>
              Always verify directly on the physical packaging label and allergen statutory strip before consumption or handling.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
