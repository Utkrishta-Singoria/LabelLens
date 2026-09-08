export type UserRole = 'official' | 'consumer' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  governmentId?: string;
  role: UserRole;
  department?: string;
  scannedHistoryTable?: string;
  createdAt?: string;
}

export type PackagedCommodityCategory =
  | 'Baby food / Weaning food'
  | 'Biscuits'
  | 'Bread'
  | 'Butter / Margarine'
  | 'Cereals & Pulses'
  | 'Coffee'
  | 'Tea'
  | 'Beverage mixes'
  | 'Edible oils / Vanaspati / Ghee'
  | 'Milk Powder'
  | 'Detergent powder'
  | 'Rice / Flour / Atta / Rawa / Suji'
  | 'Salt'
  | 'Laundry Soap'
  | 'Detergent cakes / bars'
  | 'Toilet / Bath Soap'
  | 'Aerated drinks / beverages'
  | 'Mineral / Drinking water'
  | 'Cement (bags)'
  | 'Paint / Varnish (liquid)'
  | 'Paste / Solid paint'
  | 'Base paint'
  | 'Cosmetics / Personal Care'
  | 'Snacks & Confectionery'
  | 'Textiles / Fabrics'
  | 'General Packaged Commodity';

export interface DeclarationFieldItem {
  field: string;
  label: string;
  extractedValue: string;
  isValid: boolean;
  status: 'CORRECT' | 'INCORRECT' | 'MISSING' | 'MISLEADING' | 'INACCURATE' | 'UNCLEAR' | 'NON_STANDARD';
  ruleCitation: string;
  notes: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  isUserEdited?: boolean;
}

export interface ComplianceViolation {
  id: string;
  field: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  legalSection: string; // e.g. Rule 6(1)(a), Rule 5, Rule 18(1), Section 36(1)
  recommendation: string;
}

export type ReferenceObjectType =
  | 'one_rupee_coin'
  | 'standard_id_card'
  | 'five_rupee_coin'
  | 'two_rupee_coin';

export interface CalibrationAnalysis {
  enabled: boolean;
  referenceObjectDetected: boolean;
  referenceObjectType: string;
  referenceObjectDimensions?: {
    widthMm?: number;
    heightMm?: number;
    diameterMm?: number;
  };
  scaleFactorPixelsPerMm?: number;
  detectionConfidencePercent?: number;
  
  // Package Dimensional Measurements
  measuredPackageDimensionsMm?: {
    width: number;
    height: number;
    depth?: number;
    pdpAreaSqCm?: number;
  };
  declaredPackageDimensionsMm?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  dimensionVariancePercent?: number;

  // Typographic & Font Size Measurements under Rule 9
  measuredFontHeightsMm?: {
    netQuantityNumeralMm?: number;
    mrpNumeralMm?: number;
    consumerCareTextMm?: number;
    mfgAddressTextMm?: number;
  };
  statutoryRequiredMinFontMm?: {
    netQuantityMinMm: number;
    generalDeclarationMinMm: number;
  };
  fontSizeVariancePercent?: number; // e.g. -45% if 1.1mm vs required 2.0mm
  
  hasLargeVariance: boolean;
  varianceSummary?: string;
}

export interface ExtractedProductData {
  productName: string;
  brandName: string;
  genericCommodityName: string;
  category: PackagedCommodityCategory;
  
  // Mandatory Declarations under Rule 6(1)
  manufacturerDetails: {
    name: string;
    address: string;
    isSpecified: boolean;
    isMarketerDifferent: boolean;
    marketerDetails?: string;
    packerDetails?: string;
    importerDetails?: string;
    countryOfOrigin?: string;
  };
  
  netQuantity: {
    declaredValue: string;
    numericValue: number;
    unit: string;
    isUnitValid: boolean;
    standardPackMatch: boolean;
    standardPackExpected?: string;
    misleadingTermsUsed: string[]; // e.g., 'approx', 'minimum', 'about'
    mpeErrorMarginPercent?: number;
    clearSpaceCompliant: boolean;
  };

  mrpDetails: {
    declaredMRP: string;
    numericMRP: number;
    hasInclAllTaxes: boolean;
    unitSalePrice?: string; // e.g. Rs. 0.50/g
    isStickerPasted: boolean; // Violation under Rule 18
    isAltered: boolean;
  };

  dates: {
    mfgDate: string; // Month & Year
    expiryDate?: string;
    bestBefore?: string;
    isOldPackagingUsed?: boolean;
  };

  consumerCare: {
    hasConsumerCare: boolean;
    nameOrDesignation: string;
    phoneOrTollFree: string;
    email: string;
    postalAddress: string;
    completeness: 'COMPLETE' | 'PARTIAL' | 'MISSING';
  };

  dimensions?: {
    requiredForCategory: boolean;
    declaredDimensions?: string;
    pieceCount?: number;
  };

  languageAndVisibility: {
    isHindiOrEnglish: boolean;
    languagesDetected: string[];
    isColorContrasting: boolean;
    fontSizeEstimatedPt: number;
    isFontSizeAdequate: boolean;
    isMoldedOrBlown: boolean;
  };

  declarationsTable: DeclarationFieldItem[];
  calibrationAnalysis?: CalibrationAnalysis;
  nutritionAndIngredients?: NutritionAndIngredientsData;
}

export interface NutrientItem {
  name: string;
  amountPerServing?: string;
  amountPer100g?: string;
  percentDailyValue?: string; // % RDA or % DV
}

export interface NutritionAndIngredientsData {
  isFoodOrBeverage?: boolean;
  servingSize?: string;
  servingsPerContainer?: string;
  energyKcal?: string;
  nutrients: NutrientItem[];
  ingredientsList: string[];
  rawIngredientsText?: string;
  allergenDeclarations?: string[];
  vegNonVegStatus?: 'VEG' | 'NON_VEG' | 'NOT_APPLICABLE' | 'UNKNOWN';
}

export interface InspectionReport {
  id: string;
  sNo?: number;
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  governmentId?: string;
  timestamp?: string;
  
  productName: string;
  category: PackagedCommodityCategory;
  imageUrls?: string[];
  
  complianceScore: number; // 0 to 100
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL_COMPLIANCE';
  
  extractedData: ExtractedProductData;
  violations: ComplianceViolation[];
  calibrationAnalysis?: CalibrationAnalysis;
  nutritionAndIngredients?: NutritionAndIngredientsData;
  
  enforcementAction: 'VERIFIED_COMPLIANT' | 'NOTICE_ISSUED' | 'SEIZURE_RECOMMENDED' | 'UNDER_REVIEW' | 'WARNING_ISSUED';
  inspectorRemarks: string;
  
  isEdited?: boolean;
  lastEditedAt?: string;
  barcodeNumber?: string;
}

export interface StandardSizeRule {
  commodity: PackagedCommodityCategory;
  standardSizes: string;
  allowedUnits: string[];
  notes: string;
  ruleCitation: string;
  isStandardPackRequired?: boolean;
}

export interface MPERule {
  range: string;
  minQty: number;
  maxQty: number;
  maxErrorPercent?: number;
  fixedErrorUnits?: number;
}
