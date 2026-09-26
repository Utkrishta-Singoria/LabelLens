import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  X,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';
import { COMMON_ALLERGEN_PRESETS } from '../utils/allergenChecker';

interface AllergenWatchlistSectionProps {
  allergens: string[];
  onAddAllergen: (allergen: string) => void;
  onRemoveAllergen: (allergen: string) => void;
  onClearAll?: () => void;
}

export const AllergenWatchlistSection: React.FC<AllergenWatchlistSectionProps> = ({
  allergens,
  onAddAllergen,
  onRemoveAllergen,
  onClearAll,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;

    // Check if already in list (case insensitive)
    const exists = allergens.some(
      (a) => a.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setInputError(`"${trimmed}" is already in your allergen watchlist.`);
      setTimeout(() => setInputError(null), 3000);
      return;
    }

    onAddAllergen(trimmed);
    setCustomInput('');
    setInputError(null);
  };

  const handleQuickAdd = (preset: string) => {
    const exists = allergens.some(
      (a) => a.toLowerCase() === preset.toLowerCase()
    );
    if (exists) {
      onRemoveAllergen(preset);
    } else {
      onAddAllergen(preset);
    }
  };

  return (
    <div className="bg-[#FAF7F2] dark:bg-slate-900/70 border border-[#D8CCC0] dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2D7C7] dark:border-slate-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[#332421] dark:text-slate-100">
                Personal Allergen Watchlist
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300">
                {allergens.length} Monitored
              </span>
            </div>
            <p className="text-xs text-[#332421]/70 dark:text-slate-400 mt-0.5">
              Add your specific food sensitivities. When auditing products, LabelLens will cross-reference all extracted ingredients and explicitly flag matching allergens in the inspection report.
            </p>
          </div>
        </div>

        {allergens.length > 0 && onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer self-start sm:self-auto shrink-0 font-mono"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Quick Add Preset Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#332421]/80 dark:text-slate-400">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Select Common Allergens:
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Click to toggle</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {COMMON_ALLERGEN_PRESETS.map((preset) => {
            const isSelected = allergens.some(
              (a) => a.toLowerCase() === preset.toLowerCase()
            );
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickAdd(preset)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-700 dark:text-rose-300 shadow-2xs'
                    : 'bg-white dark:bg-slate-950/80 border-[#D8CCC0] dark:border-slate-800 text-[#332421] dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{preset}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Allergen Input */}
      <form onSubmit={handleAddCustom} className="space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Type custom allergy or ingredient (e.g., Cashew, Strawberry, Tartrazine, MSG)..."
              className="w-full bg-white dark:bg-slate-950 border border-[#D8CCC0] dark:border-slate-800 rounded-lg px-3.5 py-2 text-xs text-[#332421] dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 dark:focus:border-rose-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Watchlist</span>
          </button>
        </div>
        {inputError && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
            {inputError}
          </p>
        )}
      </form>

      {/* Active Monitored Allergens List */}
      <div className="space-y-2 pt-2">
        <div className="text-xs font-semibold text-[#332421]/80 dark:text-slate-300 flex items-center justify-between">
          <span>Active Watchlist ({allergens.length}):</span>
          {allergens.length === 0 && (
            <span className="text-[11px] text-slate-500 font-normal">
              No allergens registered yet.
            </span>
          )}
        </div>

        {allergens.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-3 bg-white/70 dark:bg-slate-950/60 rounded-xl border border-[#D8CCC0] dark:border-slate-800/80">
            {allergens.map((allergen) => (
              <span
                key={allergen}
                className="inline-flex items-center gap-1.5 bg-rose-500/10 dark:bg-rose-950/60 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium px-3 py-1.5 rounded-lg group animate-in fade-in duration-150"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>{allergen}</span>
                <button
                  type="button"
                  onClick={() => onRemoveAllergen(allergen)}
                  className="p-0.5 hover:bg-rose-500/20 rounded text-rose-500 hover:text-rose-700 dark:hover:text-rose-100 transition-colors cursor-pointer ml-0.5"
                  title={`Remove ${allergen}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-[#D8CCC0] dark:border-slate-800 text-center space-y-1 bg-white/40 dark:bg-slate-950/40">
            <Info className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-xs font-medium text-[#332421]/70 dark:text-slate-400">
              No specific allergies monitored yet.
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Select common allergens above or type your own to activate automatic warnings across all product inspections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
