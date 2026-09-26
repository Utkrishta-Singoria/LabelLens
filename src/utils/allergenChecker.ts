import { InspectionReport } from '../types';

export const COMMON_ALLERGEN_PRESETS: string[] = [
  'Peanut',
  'Gluten',
  'Wheat',
  'Milk / Dairy',
  'Soy',
  'Egg',
  'Tree Nuts',
  'Fish',
  'Shellfish',
  'Sesame',
  'Mustard',
  'Sulphites',
];

const ALLERGEN_SYNONYMS: Record<string, string[]> = {
  peanut: ['peanut', 'peanuts', 'arachis', 'groundnut', 'groundnuts'],
  gluten: ['gluten', 'wheat', 'barley', 'rye', 'spelt', 'oat', 'oats', 'maida', 'suji', 'semolina', 'atta'],
  wheat: ['wheat', 'maida', 'atta', 'semolina', 'suji', 'gluten'],
  milk: ['milk', 'dairy', 'cheese', 'butter', 'cream', 'whey', 'casein', 'lactose', 'curd', 'ghee', 'paneer', 'milk solids', 'milk fat'],
  dairy: ['milk', 'dairy', 'cheese', 'butter', 'cream', 'whey', 'casein', 'lactose', 'curd', 'ghee', 'paneer', 'milk solids', 'milk fat'],
  'milk / dairy': ['milk', 'dairy', 'cheese', 'butter', 'cream', 'whey', 'casein', 'lactose', 'curd', 'ghee', 'paneer', 'milk solids', 'milk fat'],
  soy: ['soy', 'soya', 'soybean', 'soybeans', 'edamame', 'soy lecithin', 'soya lecithin'],
  egg: ['egg', 'eggs', 'albumin', 'ovalbumin', 'yolk', 'egg powder', 'egg solids'],
  'tree nuts': ['tree nut', 'tree nuts', 'almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 'pistachio', 'pistachios', 'hazelnut', 'hazelnuts', 'pecan', 'pecans', 'macadamia', 'kaju', 'badam'],
  almond: ['almond', 'almonds', 'badam'],
  cashew: ['cashew', 'cashews', 'kaju'],
  walnut: ['walnut', 'walnuts', 'akhrot'],
  pistachio: ['pistachio', 'pistachios', 'pista'],
  fish: ['fish', 'cod', 'salmon', 'tuna', 'anchovy', 'mackerel', 'tilapia'],
  shellfish: ['shellfish', 'crustacean', 'crustaceans', 'prawn', 'prawns', 'shrimp', 'shrimps', 'crab', 'crabs', 'lobster', 'lobsters', 'mollusc', 'molluscs'],
  sesame: ['sesame', 'til', 'tahini', 'gingelly'],
  mustard: ['mustard', 'sarson', 'rai'],
  sulphites: ['sulphite', 'sulphites', 'sulfite', 'sulfites', 'sulphur dioxide', 'sulfur dioxide', 'e220', 'e221', 'e222', 'e223', 'e224', 'e226', 'e227', 'e228'],
};

export interface AllergenMatchResult {
  allergen: string;
  matchedTerms: string[];
  foundInDeclarations: string[];
  foundInIngredients: string[];
  foundInRawText: string[];
}

/**
 * Retrieve saved allergens for user from local storage
 */
export function getUserAllergens(userId?: string): string[] {
  try {
    const userKey = userId ? `labellens_allergens_${userId}` : 'labellens_user_allergens';
    const saved = localStorage.getItem(userKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    // Fallback to shared key if user-specific key not yet set
    const shared = localStorage.getItem('labellens_user_allergens');
    if (shared) {
      const parsed = JSON.parse(shared);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read user allergens from localStorage:', e);
  }
  return [];
}

/**
 * Save user allergens to local storage and dispatch cross-component sync event
 */
export function saveUserAllergens(allergens: string[], userId?: string): void {
  try {
    const cleaned = Array.from(new Set(allergens.map((a) => a.trim()).filter(Boolean)));
    const json = JSON.stringify(cleaned);
    if (userId) {
      localStorage.setItem(`labellens_allergens_${userId}`, json);
    }
    localStorage.setItem('labellens_user_allergens', json);

    // Notify other components (ReportView, Dashboard, etc.)
    window.dispatchEvent(
      new CustomEvent('labellens_allergens_changed', {
        detail: { allergens: cleaned, userId },
      })
    );
  } catch (e) {
    console.error('Failed to save user allergens:', e);
  }
}

/**
 * Check an InspectionReport against a list of user allergens and return matches
 */
export function checkReportForAllergens(
  report: InspectionReport,
  userAllergens: string[]
): AllergenMatchResult[] {
  if (!userAllergens || userAllergens.length === 0 || !report) {
    return [];
  }

  const results: AllergenMatchResult[] = [];

  const nutri = report.nutritionAndIngredients || report.extractedData?.nutritionAndIngredients;
  const declarations = nutri?.allergenDeclarations || [];
  const ingredients = nutri?.ingredientsList || [];
  const rawIngredients = nutri?.rawIngredientsText || '';
  const productName = report.productName || '';

  userAllergens.forEach((userAllergen) => {
    const cleanAllergen = userAllergen.trim();
    if (!cleanAllergen) return;

    const lowerAllergen = cleanAllergen.toLowerCase();
    // Gather lookup keywords (the allergen itself plus any synonyms)
    const keywordsToSearch = new Set<string>();
    keywordsToSearch.add(lowerAllergen);

    if (ALLERGEN_SYNONYMS[lowerAllergen]) {
      ALLERGEN_SYNONYMS[lowerAllergen].forEach((s) => keywordsToSearch.add(s.toLowerCase()));
    } else {
      // Check partial key matches
      Object.keys(ALLERGEN_SYNONYMS).forEach((key) => {
        if (lowerAllergen.includes(key) || key.includes(lowerAllergen)) {
          ALLERGEN_SYNONYMS[key].forEach((s) => keywordsToSearch.add(s.toLowerCase()));
        }
      });
    }

    const matchedTerms = new Set<string>();
    const foundInDeclarations: string[] = [];
    const foundInIngredients: string[] = [];
    const foundInRawText: string[] = [];

    // Helper regex to test for keyword with word boundaries
    const matchesText = (targetText: string, keyword: string): boolean => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}`, 'i');
      return regex.test(targetText);
    };

    keywordsToSearch.forEach((kw) => {
      // 1. Check allergenDeclarations
      declarations.forEach((decl) => {
        if (matchesText(decl, kw) || decl.toLowerCase().includes(kw)) {
          matchedTerms.add(kw);
          if (!foundInDeclarations.includes(decl)) {
            foundInDeclarations.push(decl);
          }
        }
      });

      // 2. Check ingredientsList
      ingredients.forEach((ing) => {
        if (matchesText(ing, kw) || ing.toLowerCase().includes(kw)) {
          matchedTerms.add(kw);
          if (!foundInIngredients.includes(ing)) {
            foundInIngredients.push(ing);
          }
        }
      });

      // 3. Check rawIngredientsText
      if (rawIngredients && (matchesText(rawIngredients, kw) || rawIngredients.toLowerCase().includes(kw))) {
        matchedTerms.add(kw);
        if (!foundInRawText.includes(rawIngredients)) {
          foundInRawText.push(rawIngredients);
        }
      }

      // 4. Also check productName for blatant matches (e.g. "Peanut Chikki", "Soy Milk")
      if (productName && (matchesText(productName, kw) || productName.toLowerCase().includes(kw))) {
        matchedTerms.add(kw);
        if (!foundInRawText.includes(`Product Title: "${productName}"`)) {
          foundInRawText.push(`Product Title: "${productName}"`);
        }
      }
    });

    if (foundInDeclarations.length > 0 || foundInIngredients.length > 0 || foundInRawText.length > 0) {
      results.push({
        allergen: cleanAllergen,
        matchedTerms: Array.from(matchedTerms),
        foundInDeclarations,
        foundInIngredients,
        foundInRawText,
      });
    }
  });

  return results;
}
