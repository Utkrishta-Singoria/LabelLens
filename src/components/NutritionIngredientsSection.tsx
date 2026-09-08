import React, { useState } from 'react';
import {
  Apple,
  Salad,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
  Flame,
  Leaf,
  Beef,
  Ban,
} from 'lucide-react';
import { NutrientItem, NutritionAndIngredientsData } from '../types';

interface NutritionIngredientsSectionProps {
  nutritionData?: NutritionAndIngredientsData;
  isEditing?: boolean;
  onChange?: (updated: NutritionAndIngredientsData) => void;
  productName?: string;
  category?: string;
}

export const NutritionIngredientsSection: React.FC<NutritionIngredientsSectionProps> = ({
  nutritionData,
  isEditing = false,
  onChange,
  productName = 'Packaged Commodity',
  category = 'Food / Packaged Commodity',
}) => {
  const [copiedRawText, setCopiedRawText] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'nutrition' | 'ingredients'>('all');
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [newAllergenInput, setNewAllergenInput] = useState('');

  // Fallback defaults
  const data: NutritionAndIngredientsData = nutritionData || {
    isFoodOrBeverage: true,
    servingSize: 'Per 100g',
    servingsPerContainer: '1',
    energyKcal: 'N/A',
    nutrients: [],
    ingredientsList: [],
    rawIngredientsText: 'Statutory ingredients declaration not visible on scanned panel(s).',
    allergenDeclarations: [],
    vegNonVegStatus: 'UNKNOWN',
  };

  const isFood = data.isFoodOrBeverage !== false;

  const handleUpdate = (partial: Partial<NutritionAndIngredientsData>) => {
    if (onChange) {
      onChange({
        ...data,
        ...partial,
      });
    }
  };

  const handleNutrientChange = (
    index: number,
    field: keyof NutrientItem,
    value: string
  ) => {
    const updated = [...(data.nutrients || [])];
    if (updated[index]) {
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      handleUpdate({ nutrients: updated });
    }
  };

  const handleAddNutrient = () => {
    const updated = [
      ...(data.nutrients || []),
      {
        name: 'New Nutrient',
        amountPerServing: '0 g',
        amountPer100g: '0 g',
        percentDailyValue: '0%',
      },
    ];
    handleUpdate({ nutrients: updated });
  };

  const handleRemoveNutrient = (index: number) => {
    const updated = (data.nutrients || []).filter((_, i) => i !== index);
    handleUpdate({ nutrients: updated });
  };

  const handleAddIngredient = () => {
    if (!newIngredientInput.trim()) return;
    const updated = [...(data.ingredientsList || []), newIngredientInput.trim()];
    handleUpdate({ ingredientsList: updated });
    setNewIngredientInput('');
  };

  const handleRemoveIngredient = (index: number) => {
    const updated = (data.ingredientsList || []).filter((_, i) => i !== index);
    handleUpdate({ ingredientsList: updated });
  };

  const handleAddAllergen = () => {
    if (!newAllergenInput.trim()) return;
    const updated = [...(data.allergenDeclarations || []), newAllergenInput.trim()];
    handleUpdate({ allergenDeclarations: updated });
    setNewAllergenInput('');
  };

  const handleRemoveAllergen = (index: number) => {
    const updated = (data.allergenDeclarations || []).filter((_, i) => i !== index);
    handleUpdate({ allergenDeclarations: updated });
  };

  const handleCopyRawText = () => {
    if (!data.rawIngredientsText) return;
    navigator.clipboard.writeText(data.rawIngredientsText);
    setCopiedRawText(true);
    setTimeout(() => setCopiedRawText(false), 2500);
  };

  // Render Veg/Non-Veg statutory logo
  const renderVegIndicator = () => {
    const status = data.vegNonVegStatus || (isFood ? 'VEG' : 'NOT_APPLICABLE');

    if (isEditing) {
      return (
        <select
          value={status}
          onChange={(e) => handleUpdate({ vegNonVegStatus: e.target.value as any })}
          className="bg-slate-900 border border-slate-700 text-xs font-mono rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="VEG">Vegetarian (Green Logo)</option>
          <option value="NON_VEG">Non-Vegetarian (Brown Logo)</option>
          <option value="NOT_APPLICABLE">Not Applicable (Non-Food)</option>
          <option value="UNKNOWN">Unspecified / Unknown</option>
        </select>
      );
    }

    if (status === 'VEG') {
      return (
        <div
          title="Vegetarian Commodity (FSSAI Rule 2.2.2)"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-700/70 text-emerald-400 font-mono text-[11px] font-bold"
        >
          <div className="w-3.5 h-3.5 border-2 border-emerald-500 rounded-sm flex items-center justify-center p-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          </div>
          <span>100% VEGETARIAN</span>
        </div>
      );
    }

    if (status === 'NON_VEG') {
      return (
        <div
          title="Non-Vegetarian Commodity (FSSAI Rule 2.2.2)"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-rose-950/60 border border-rose-700/70 text-rose-400 font-mono text-[11px] font-bold"
        >
          <div className="w-3.5 h-3.5 border-2 border-rose-500 rounded-sm flex items-center justify-center p-0.5">
            <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-rose-500"></div>
          </div>
          <span>NON-VEGETARIAN</span>
        </div>
      );
    }

    return (
      <div
        title="Non-Food Packaged Commodity (Formulation breakdown)"
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-[11px] font-medium"
      >
        <Ban className="w-3 h-3 text-slate-400" />
        <span>NON-FOOD COMMODITY</span>
      </div>
    );
  };

  return (
    <div
      id="nutrients-and-ingredients-section"
      className="bg-[#0A0C10] border border-slate-800 rounded-lg p-4 space-y-4 shadow-sm"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 font-mono flex items-center gap-2">
              <Salad className="w-4 h-4 text-emerald-400" />
              Nutritional Facts & Ingredients Specification
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60">
              FSSAI & METROLOGY SCHEDULE II
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Statutory dietary declarations, quantitative ingredient declaration (QUID), allergen advice, and chemical formulation.
          </p>
        </div>

        {/* Veg/Non-Veg & View Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {renderVegIndicator()}

          {/* Quick Tab Switcher for mobile/compact views */}
          <div className="inline-flex bg-[#0F1117] border border-slate-800 rounded p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-1 rounded transition-colors ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Combined
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-2 py-1 rounded transition-colors ${
                activeTab === 'nutrition'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Nutrients Table
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-2 py-1 rounded transition-colors ${
                activeTab === 'ingredients'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ingredients & Allergens
            </button>
          </div>
        </div>
      </div>

      {/* Serving & Caloric Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#0F1117] border border-slate-800/80 rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
            <Apple className="w-3 h-3 text-emerald-400" />
            Serving Size
          </div>
          {isEditing ? (
            <input
              type="text"
              value={data.servingSize || ''}
              onChange={(e) => handleUpdate({ servingSize: e.target.value })}
              className="w-full bg-[#0A0C10] border border-slate-700 text-slate-100 text-xs font-mono p-1 rounded focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. 30 g (15 Chips)"
            />
          ) : (
            <div className="text-xs font-mono font-bold text-slate-200 truncate">
              {data.servingSize || 'Per 100g / 100ml'}
            </div>
          )}
        </div>

        <div className="bg-[#0F1117] border border-slate-800/80 rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3 text-sky-400" />
            Servings Per Pack
          </div>
          {isEditing ? (
            <input
              type="text"
              value={data.servingsPerContainer || ''}
              onChange={(e) => handleUpdate({ servingsPerContainer: e.target.value })}
              className="w-full bg-[#0A0C10] border border-slate-700 text-slate-100 text-xs font-mono p-1 rounded focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. Approx. 2"
            />
          ) : (
            <div className="text-xs font-mono font-bold text-slate-200 truncate">
              {data.servingsPerContainer || 'Approx. 1'}
            </div>
          )}
        </div>

        <div className="bg-[#0F1117] border border-slate-800/80 rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            Energy Declared
          </div>
          {isEditing ? (
            <input
              type="text"
              value={data.energyKcal || ''}
              onChange={(e) => handleUpdate({ energyKcal: e.target.value })}
              className="w-full bg-[#0A0C10] border border-slate-700 text-slate-100 text-xs font-mono p-1 rounded focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. 538 kcal / 100g"
            />
          ) : (
            <div className="text-xs font-mono font-bold text-amber-400 truncate">
              {data.energyKcal || 'See Table Below'}
            </div>
          )}
        </div>

        <div className="bg-[#0F1117] border border-slate-800/80 rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Ingredient Items
          </div>
          <div className="text-xs font-mono font-bold text-slate-200">
            {data.ingredientsList?.length || 0} Declared Components
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Nutrients Table (Left/Top) & Ingredients (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* NUTRITION TABLE (7 cols on large) */}
        {(activeTab === 'all' || activeTab === 'nutrition') && (
          <div
            className={`space-y-2.5 ${
              activeTab === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-emerald-400" />
                Statutory Nutrition Profile
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {isFood ? 'Values per 100g / per Serving' : 'Chemical Formulation'}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-[#0F1117]">
                    <th className="py-2 px-3">Nutrient Parameter</th>
                    <th className="py-2 px-3">Per Serving</th>
                    <th className="py-2 px-3">Per 100g / 100ml</th>
                    <th className="py-2 px-3">% RDA / DV</th>
                    {isEditing && <th className="py-2 px-2 text-center w-8">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#0A0C10]">
                  {data.nutrients && data.nutrients.length > 0 ? (
                    data.nutrients.map((nutrient, idx) => {
                      const isEnergy =
                        nutrient.name.toLowerCase().includes('energy') ||
                        nutrient.name.toLowerCase().includes('calorie');
                      const isTransFat = nutrient.name.toLowerCase().includes('trans fat');
                      const isSugar =
                        nutrient.name.toLowerCase().includes('sugar') ||
                        nutrient.name.toLowerCase().includes('added sugar');

                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-900/40 transition-colors ${
                            isEnergy ? 'bg-slate-900/30 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-slate-200">
                            {isEditing ? (
                              <input
                                type="text"
                                value={nutrient.name}
                                onChange={(e) =>
                                  handleNutrientChange(idx, 'name', e.target.value)
                                }
                                className="w-full bg-[#0F1117] border border-slate-700 text-slate-100 text-xs font-mono p-1 rounded focus:border-emerald-500 focus:outline-none"
                              />
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className={isEnergy ? 'text-amber-300 font-bold' : ''}>
                                  {nutrient.name}
                                </span>
                                {isTransFat && (
                                  <span className="text-[9px] px-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                    Zero Trans Fat
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-300">
                            {isEditing ? (
                              <input
                                type="text"
                                value={nutrient.amountPerServing || ''}
                                onChange={(e) =>
                                  handleNutrientChange(idx, 'amountPerServing', e.target.value)
                                }
                                className="w-full bg-[#0F1117] border border-slate-700 text-slate-100 text-xs font-mono p-1 rounded focus:border-emerald-500 focus:outline-none"
                              />
                            ) : (
                              nutrient.amountPerServing || '-'
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-300 font-medium">
                            {isEditing ? (
                              <input
                                type="text"
                                value={nutrient.amountPer100g || ''}
                                onChange={(e) =>
                                  handleNutrientChange(idx, 'amountPer100g', e.target.value)
                                }
                                className="w-full bg-[#0F1117] border border-slate-700 text-slate-100 text-xs font-mono p-1 rounded focus:border-emerald-500 focus:outline-none"
                              />
                            ) : (
                              nutrient.amountPer100g || '-'
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={nutrient.percentDailyValue || ''}
                                onChange={(e) =>
                                  handleNutrientChange(idx, 'percentDailyValue', e.target.value)
                                }
                                className="w-full bg-[#0F1117] border border-slate-700 text-slate-100 text-xs font-mono p-1 rounded focus:border-emerald-500 focus:outline-none"
                              />
                            ) : nutrient.percentDailyValue ? (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                {nutrient.percentDailyValue}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                          {isEditing && (
                            <td className="py-2 px-2 text-center">
                              <button
                                onClick={() => handleRemoveNutrient(idx)}
                                className="text-rose-400 hover:text-rose-300 p-1"
                                title="Delete nutrient row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={isEditing ? 5 : 4} className="py-4 px-3 text-center text-slate-500 italic">
                        No nutritional values detected or declared on packaging panels.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {isEditing && (
              <button
                onClick={handleAddNutrient}
                className="flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded px-2.5 py-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Nutrient Row
              </button>
            )}
          </div>
        )}

        {/* INGREDIENTS & ALLERGENS PANEL (5 cols on large) */}
        {(activeTab === 'all' || activeTab === 'ingredients') && (
          <div
            className={`space-y-3 ${
              activeTab === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'
            }`}
          >
            {/* Verbatim Ingredients Box */}
            <div className="bg-[#0F1117] border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  Verbatim Ingredients Statement
                </span>
                <button
                  onClick={handleCopyRawText}
                  className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-emerald-400 transition-colors bg-slate-900 border border-slate-800 px-2 py-0.5 rounded"
                  title="Copy ingredients statement"
                >
                  {copiedRawText ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Text
                    </>
                  )}
                </button>
              </div>

              {isEditing ? (
                <textarea
                  rows={4}
                  value={data.rawIngredientsText || ''}
                  onChange={(e) => handleUpdate({ rawIngredientsText: e.target.value })}
                  className="w-full bg-[#0A0C10] border border-slate-700 text-slate-200 text-xs font-mono p-2 rounded focus:border-emerald-500 focus:outline-none resize-y"
                  placeholder="Enter full raw ingredients declaration printed on packaging"
                />
              ) : (
                <div className="bg-[#0A0C10] border border-slate-800/80 rounded p-2.5 text-[11px] font-sans text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                  {data.rawIngredientsText ||
                    'Ingredients list not detected on scanned packaging panel(s).'}
                </div>
              )}
            </div>

            {/* Parsed Ingredients Sequence */}
            <div className="bg-[#0F1117] border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  Itemized Ingredients (Descending Order)
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {data.ingredientsList?.length || 0} items
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1">
                {data.ingredientsList && data.ingredientsList.length > 0 ? (
                  data.ingredientsList.map((ing, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/90 text-slate-200 border border-slate-700/80 text-[11px] font-sans"
                    >
                      <span className="text-emerald-400 font-mono text-[9px] font-bold">
                        #{idx + 1}
                      </span>
                      {ing}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveIngredient(idx)}
                          className="text-rose-400 hover:text-rose-300 ml-0.5"
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">
                    No discrete ingredients identified.
                  </span>
                )}
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newIngredientInput}
                    onChange={(e) => setNewIngredientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                    placeholder="Add ingredient..."
                    className="flex-1 bg-[#0A0C10] border border-slate-700 text-slate-100 text-xs font-mono p-1 rounded focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddIngredient}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Allergen & Statutory Safety Warnings */}
            <div className="bg-amber-950/20 border border-amber-900/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                Allergen Advice & Statutory Cautions
              </div>

              <div className="space-y-1.5">
                {data.allergenDeclarations && data.allergenDeclarations.length > 0 ? (
                  data.allergenDeclarations.map((allergen, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-2 text-xs font-sans text-amber-200/90 bg-amber-950/40 border border-amber-800/40 px-2 py-1 rounded"
                    >
                      <span className="leading-snug">&bull; {allergen}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveAllergen(idx)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs font-sans text-slate-400 italic">
                    No specific allergen warnings or cross-contamination cautions detected.
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newAllergenInput}
                    onChange={(e) => setNewAllergenInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAllergen();
                      }
                    }}
                    placeholder="Add allergen / warning..."
                    className="flex-1 bg-[#0A0C10] border border-amber-800/60 text-slate-100 text-xs font-mono p-1 rounded focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    onClick={handleAddAllergen}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-mono font-bold px-2 py-1 rounded"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
