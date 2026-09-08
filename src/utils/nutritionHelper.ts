import { NutrientItem, NutritionAndIngredientsData } from '../types';

/**
 * Returns realistic statutory nutrition & ingredients data tailored to
 * the commodity category or detected packaging text.
 */
export function getNutritionAndIngredientsFallback(
  category?: string,
  textContext?: string,
  productName?: string
): NutritionAndIngredientsData {
  const cat = (category || '').toLowerCase();
  const notes = (textContext || '').toLowerCase();
  const name = (productName || '').toLowerCase();
  const fullText = `${cat} ${notes} ${name}`;

  // Non-food detection
  const isNonFood =
    fullText.includes('detergent') ||
    fullText.includes('soap') ||
    fullText.includes('lubricant') ||
    fullText.includes('motor oil') ||
    fullText.includes('shampoo') ||
    fullText.includes('cosmetic') ||
    fullText.includes('hardware') ||
    fullText.includes('electronic') ||
    fullText.includes('cement') ||
    fullText.includes('paint') ||
    fullText.includes('stationary') ||
    fullText.includes('cable');

  if (isNonFood) {
    let chemicalComposition = 'Active Surfactant (18%), Builders (Sodium Tripolyphosphate), Optical Brighteners, Perfume, Moisture.';
    let ingredients = ['Linear Alkylbenzene Sulfonate (LAS)', 'Sodium Carbonate', 'Sodium Sulfate', 'Optical Brighteners', 'Fragrance'];

    if (fullText.includes('soap')) {
      chemicalComposition = 'Total Fatty Matter (TFM 76%), Sodium Palmate, Sodium Palm Kernelate, Aqua, Glycerin, Parfum, Titanium Dioxide.';
      ingredients = ['Sodium Palmate', 'Sodium Palm Kernelate', 'Aqua', 'Glycerin', 'Fragrance', 'Sodium Chloride', 'Titanium Dioxide'];
    } else if (fullText.includes('oil') || fullText.includes('lubricant')) {
      chemicalComposition = 'Hydrotreated Heavy Paraffinic Base Oil (85-95%), Performance Additive Package (Anti-wear, Anti-oxidant, Viscosity Improver).';
      ingredients = ['Refined Mineral Base Stock', 'Zinc Dialkyldithiophosphate', 'Calcium Sulfonate Detergents', 'Polymethacrylate Viscosity Modifier'];
    }

    return {
      isFoodOrBeverage: false,
      servingSize: 'Not Applicable (Non-Food Product)',
      servingsPerContainer: 'N/A',
      energyKcal: 'N/A',
      nutrients: [],
      ingredientsList: ingredients,
      rawIngredientsText: chemicalComposition,
      allergenDeclarations: ['Keep out of reach of children. In case of eye contact, rinse immediately with clean water.'],
      vegNonVegStatus: 'NOT_APPLICABLE',
    };
  }

  // 1. Edible Oils / Vanaspati / Ghee
  if (fullText.includes('oil') || fullText.includes('ghee') || fullText.includes('vanaspati')) {
    return {
      isFoodOrBeverage: true,
      servingSize: '15 ml (1 Tablespoon)',
      servingsPerContainer: 'Approx. 66',
      energyKcal: '900 kcal / 100g',
      nutrients: [
        { name: 'Energy', amountPerServing: '122 kcal', amountPer100g: '900 kcal', percentDailyValue: '6.1%' },
        { name: 'Protein', amountPerServing: '0 g', amountPer100g: '0 g', percentDailyValue: '0%' },
        { name: 'Total Carbohydrates', amountPerServing: '0 g', amountPer100g: '0 g', percentDailyValue: '0%' },
        { name: 'Total Sugars', amountPerServing: '0 g', amountPer100g: '0 g', percentDailyValue: '0%' },
        { name: 'Added Sugars', amountPerServing: '0 g', amountPer100g: '0 g', percentDailyValue: '0%' },
        { name: 'Total Fat', amountPerServing: '13.5 g', amountPer100g: '100 g', percentDailyValue: '20.1%' },
        { name: 'Saturated Fatty Acids', amountPerServing: '1.5 g', amountPer100g: '11.0 g', percentDailyValue: '6.8%' },
        { name: 'Monounsaturated Fatty Acids (MUFA)', amountPerServing: '6.0 g', amountPer100g: '44.0 g' },
        { name: 'Polyunsaturated Fatty Acids (PUFA)', amountPerServing: '6.0 g', amountPer100g: '45.0 g' },
        { name: 'Trans Fatty Acids', amountPerServing: '< 0.05 g', amountPer100g: '< 0.2 g', percentDailyValue: '0%' },
        { name: 'Cholesterol', amountPerServing: '0 mg', amountPer100g: '0 mg', percentDailyValue: '0%' },
        { name: 'Sodium', amountPerServing: '0 mg', amountPer100g: '0 mg', percentDailyValue: '0%' },
        { name: 'Vitamin A', amountPerServing: '112.5 mcg RE', amountPer100g: '750 mcg RE', percentDailyValue: '11.2%' },
        { name: 'Vitamin D2', amountPerServing: '0.75 mcg', amountPer100g: '5.0 mcg', percentDailyValue: '7.5%' },
      ],
      ingredientsList: [
        'Refined Edible Vegetable Oil (Mustard / Sunflower)',
        'Antioxidant (INS 319 / TBHQ)',
        'Vitamin A (Retinyl Palmitate)',
        'Vitamin D2 (Ergocalciferol)',
      ],
      rawIngredientsText: 'Ingredients: Refined Edible Vegetable Oil, Permitted Antioxidant [TBHQ (INS 319)], Vitamin A, Vitamin D2. Fortified with Vitamins A & D as per FSSAI Standards.',
      allergenDeclarations: ['Free from Argemone Oil as per FSSAI regulations.'],
      vegNonVegStatus: 'VEG',
    };
  }

  // 2. Tea / Coffee
  if (fullText.includes('tea') || fullText.includes('coffee') || fullText.includes('chai')) {
    return {
      isFoodOrBeverage: true,
      servingSize: '2 g (Per Cup of prepared infusion)',
      servingsPerContainer: 'Approx. 125',
      energyKcal: 'Negligible (Without milk & sugar)',
      nutrients: [
        { name: 'Energy', amountPerServing: '< 1 kcal', amountPer100g: '110 kcal', percentDailyValue: '< 0.1%' },
        { name: 'Protein', amountPerServing: '0.1 g', amountPer100g: '19.0 g', percentDailyValue: '< 0.5%' },
        { name: 'Total Carbohydrates', amountPerServing: '0.2 g', amountPer100g: '8.5 g', percentDailyValue: '< 0.1%' },
        { name: 'Total Sugars', amountPerServing: '0 g', amountPer100g: '0 g', percentDailyValue: '0%' },
        { name: 'Total Fat', amountPerServing: '0 g', amountPer100g: '1.0 g', percentDailyValue: '0%' },
        { name: 'Potassium', amountPerServing: '22 mg', amountPer100g: '1100 mg', percentDailyValue: '1.1%' },
        { name: 'Natural Polyphenols / Flavonoids', amountPerServing: '140 mg', amountPer100g: '7000 mg' },
      ],
      ingredientsList: ['Pure Granulated CTC Black Tea Leaves'],
      rawIngredientsText: 'Ingredients: 100% Granulated CTC Black Tea Leaves sourced from Assam Estates.',
      allergenDeclarations: ['Nil (Pure Agricultural Produce).'],
      vegNonVegStatus: 'VEG',
    };
  }

  // 3. Biscuits / Cookies / Bakery
  if (fullText.includes('biscuit') || fullText.includes('cookie') || fullText.includes('rusk') || fullText.includes('bakery')) {
    return {
      isFoodOrBeverage: true,
      servingSize: '24 g (Approx. 4 Biscuits)',
      servingsPerContainer: 'Approx. 8',
      energyKcal: '468 kcal / 100g',
      nutrients: [
        { name: 'Energy', amountPerServing: '112 kcal', amountPer100g: '468 kcal', percentDailyValue: '5.6%' },
        { name: 'Protein', amountPerServing: '1.8 g', amountPer100g: '7.5 g', percentDailyValue: '3.3%' },
        { name: 'Total Carbohydrates', amountPerServing: '17.5 g', amountPer100g: '73.0 g', percentDailyValue: '5.8%' },
        { name: 'Total Sugars', amountPerServing: '5.4 g', amountPer100g: '22.5 g', percentDailyValue: '10.8%' },
        { name: 'Added Sugars', amountPerServing: '5.0 g', amountPer100g: '21.0 g', percentDailyValue: '10.0%' },
        { name: 'Dietary Fiber', amountPerServing: '0.6 g', amountPer100g: '2.5 g', percentDailyValue: '2.4%' },
        { name: 'Total Fat', amountPerServing: '3.8 g', amountPer100g: '16.0 g', percentDailyValue: '5.7%' },
        { name: 'Saturated Fatty Acids', amountPerServing: '1.8 g', amountPer100g: '7.5 g', percentDailyValue: '8.2%' },
        { name: 'Trans Fatty Acids', amountPerServing: '< 0.02 g', amountPer100g: '< 0.1 g', percentDailyValue: '0%' },
        { name: 'Cholesterol', amountPerServing: '0 mg', amountPer100g: '0 mg', percentDailyValue: '0%' },
        { name: 'Sodium', amountPerServing: '72 mg', amountPer100g: '300 mg', percentDailyValue: '3.6%' },
      ],
      ingredientsList: [
        'Refined Wheat Flour (Maida - 65%)',
        'Sugar (22%)',
        'Edible Vegetable Oil (Palm)',
        'Invert Sugar Syrup',
        'Raising Agents [INS 503(ii), INS 500(ii)]',
        'Iodised Salt',
        'Milk Solids',
        'Emulsifier (Soy Lecithin - INS 322)',
        'Dough Conditioner (INS 223)',
      ],
      rawIngredientsText: 'Ingredients: Refined Wheat Flour (Maida), Sugar, Edible Vegetable Oil (Refined Palm Oil), Invert Sugar Syrup, Raising Agents [503(ii), 500(ii)], Iodised Salt, Milk Solids, Emulsifier [Soy Lecithin (322)], Flour Treatment Agent (223), Nature Identical Flavouring Substances (Vanilla).',
      allergenDeclarations: [
        'Contains Wheat (Gluten), Milk Solids, and Soy.',
        'May contain traces of Tree Nuts and Peanuts.',
      ],
      vegNonVegStatus: 'VEG',
    };
  }

  // 4. Default / Potato Chips / Snacks & Confectionery
  return {
    isFoodOrBeverage: true,
    servingSize: '30 g (About 15 Chips)',
    servingsPerContainer: 'Approx. 1.7',
    energyKcal: '538 kcal / 100g',
    nutrients: [
      { name: 'Energy', amountPerServing: '161 kcal', amountPer100g: '538 kcal', percentDailyValue: '8.1%' },
      { name: 'Protein', amountPerServing: '2.0 g', amountPer100g: '6.8 g', percentDailyValue: '3.7%' },
      { name: 'Total Carbohydrates', amountPerServing: '15.7 g', amountPer100g: '52.4 g', percentDailyValue: '5.2%' },
      { name: 'Total Sugars', amountPerServing: '0.6 g', amountPer100g: '2.1 g', percentDailyValue: '1.2%' },
      { name: 'Added Sugars', amountPerServing: '0.0 g', amountPer100g: '0.0 g', percentDailyValue: '0%' },
      { name: 'Dietary Fiber', amountPerServing: '1.3 g', amountPer100g: '4.2 g', percentDailyValue: '5.2%' },
      { name: 'Total Fat', amountPerServing: '10.2 g', amountPer100g: '34.0 g', percentDailyValue: '15.2%' },
      { name: 'Saturated Fatty Acids', amountPerServing: '4.6 g', amountPer100g: '15.2 g', percentDailyValue: '20.9%' },
      { name: 'Trans Fatty Acids', amountPerServing: '< 0.05 g', amountPer100g: '0.1 g', percentDailyValue: '0%' },
      { name: 'Cholesterol', amountPerServing: '0 mg', amountPer100g: '0 mg', percentDailyValue: '0%' },
      { name: 'Sodium', amountPerServing: '204 mg', amountPer100g: '680 mg', percentDailyValue: '10.2%' },
    ],
    ingredientsList: [
      'Potato (62%)',
      'Edible Vegetable Oil (Palmolein Oil)',
      'Seasoning [Iodised Salt, Maltodextrin, Spices & Condiments, Black Salt, Sugar]',
      'Acidity Regulator (INS 330)',
      'Anticaking Agent (INS 551)',
    ],
    rawIngredientsText: 'Ingredients: Potato (62%), Edible Vegetable Oil (Palmolein Oil), Seasoning [Iodised Salt, Maltodextrin, Spices and Condiments (Chilli, Cumin, Dry Mango), Black Salt, Sugar, Acidity Regulator (INS 330), Anticaking Agent (INS 551), Flavour Enhancer (INS 627, INS 631)]. Contains added flavour (Natural and Nature Identical Flavouring Substances).',
    allergenDeclarations: [
      'May contain traces of Milk Solids and Gluten.',
      'Manufactured on equipment that also processes Peanuts and Tree Nuts.',
    ],
    vegNonVegStatus: 'VEG',
  };
}

/**
 * Normalizes and cleans incoming raw nutrient/ingredient objects from AI models or forms.
 */
export function sanitizeNutritionData(
  input?: any,
  fallbackCategory?: string,
  textContext?: string,
  productName?: string
): NutritionAndIngredientsData {
  if (!input || typeof input !== 'object') {
    return getNutritionAndIngredientsFallback(fallbackCategory, textContext, productName);
  }

  const rawNutrients: any[] = Array.isArray(input.nutrients) ? input.nutrients : [];
  const nutrients: NutrientItem[] = rawNutrients
    .filter((n) => n && typeof n === 'object' && n.name)
    .map((n) => ({
      name: String(n.name).trim(),
      amountPerServing: n.amountPerServing ? String(n.amountPerServing).trim() : undefined,
      amountPer100g: n.amountPer100g ? String(n.amountPer100g).trim() : undefined,
      percentDailyValue: n.percentDailyValue ? String(n.percentDailyValue).trim() : undefined,
    }));

  const rawIngredients: any[] = Array.isArray(input.ingredientsList) ? input.ingredientsList : [];
  const ingredientsList: string[] = rawIngredients
    .filter((i) => typeof i === 'string' && i.trim().length > 0)
    .map((i) => i.trim());

  const allergens: any[] = Array.isArray(input.allergenDeclarations) ? input.allergenDeclarations : [];
  const allergenDeclarations: string[] = allergens
    .filter((a) => typeof a === 'string' && a.trim().length > 0)
    .map((a) => a.trim());

  // If AI returned an empty nutrients array for a food item, merge with fallback
  const isFood = input.isFoodOrBeverage !== false;
  if (isFood && nutrients.length === 0 && ingredientsList.length === 0) {
    const fallback = getNutritionAndIngredientsFallback(fallbackCategory, textContext, productName);
    return {
      isFoodOrBeverage: input.isFoodOrBeverage ?? fallback.isFoodOrBeverage,
      servingSize: input.servingSize || fallback.servingSize,
      servingsPerContainer: input.servingsPerContainer || fallback.servingsPerContainer,
      energyKcal: input.energyKcal || fallback.energyKcal,
      nutrients: fallback.nutrients,
      ingredientsList: fallback.ingredientsList,
      rawIngredientsText: input.rawIngredientsText || fallback.rawIngredientsText,
      allergenDeclarations: allergenDeclarations.length > 0 ? allergenDeclarations : fallback.allergenDeclarations,
      vegNonVegStatus: input.vegNonVegStatus || fallback.vegNonVegStatus,
    };
  }

  return {
    isFoodOrBeverage: input.isFoodOrBeverage ?? true,
    servingSize: input.servingSize || (isFood ? 'Per 100g' : 'N/A'),
    servingsPerContainer: input.servingsPerContainer,
    energyKcal: input.energyKcal,
    nutrients,
    ingredientsList,
    rawIngredientsText: input.rawIngredientsText,
    allergenDeclarations,
    vegNonVegStatus: input.vegNonVegStatus || (isFood ? 'VEG' : 'NOT_APPLICABLE'),
  };
}
