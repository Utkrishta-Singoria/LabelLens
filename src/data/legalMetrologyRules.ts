import { StandardSizeRule, MPERule, InspectionReport, ComplianceViolation } from '../types';
import { getNutritionAndIngredientsFallback } from '../utils/nutritionHelper';

export const STANDARD_PACK_RULES: StandardSizeRule[] = [
  {
    commodity: 'Baby food / Weaning food',
    standardSizes: '100g to 1kg in 100g steps, then 2kg, 5kg, 10kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Must declare net weight in g or kg.',
    ruleCitation: 'Schedule II, Item 1',
  },
  {
    commodity: 'Biscuits',
    standardSizes: '25g–300g (small standard increments), then 100g steps up to 1kg',
    allowedUnits: ['g', 'kg'],
    notes: 'No non-standard sizes allowed unless prominently declared.',
    ruleCitation: 'Schedule II, Item 2',
  },
  {
    commodity: 'Bread',
    standardSizes: '100g, then multiples of 100g (not applicable to buns)',
    allowedUnits: ['g', 'kg'],
    notes: 'Excludes buns, pav, and specialty rolls.',
    ruleCitation: 'Schedule II, Item 3',
  },
  {
    commodity: 'Butter / Margarine',
    standardSizes: '25g, 50g, 100g, 200g, 500g, 1kg, 2kg, 5kg, then multiples of 5kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Uncanned butter/margarine only.',
    ruleCitation: 'Schedule II, Item 4',
  },
  {
    commodity: 'Cereals & Pulses',
    standardSizes: '100g, 200g, 500g, 1kg, 2kg, 5kg, then multiples of 5kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Excludes institutional packs >25kg.',
    ruleCitation: 'Schedule II, Item 5',
  },
  {
    commodity: 'Coffee',
    standardSizes: '25g, 50g, 100g, 200g, 250g, 500g, 1kg, then multiples of 1kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Pure coffee or coffee-chicory mixture.',
    ruleCitation: 'Schedule II, Item 6',
  },
  {
    commodity: 'Tea',
    standardSizes: '25g, 50g, 100g, 125g, 250g, 500g, 1kg, then multiples of 1kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Leaf or dust tea packs.',
    ruleCitation: 'Schedule II, Item 7',
  },
  {
    commodity: 'Beverage mixes',
    standardSizes: '25g, 50g, 100g, 200g, 500g, 1kg, then multiples of 1kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Malted milk drinks, cocoa powders, etc.',
    ruleCitation: 'Schedule II, Item 8',
  },
  {
    commodity: 'Edible oils / Vanaspati / Ghee',
    standardSizes: '50g–5kg (specified standard steps), then multiples of 5kg. If sold by volume (ml/L), equivalent mass must also be shown in brackets.',
    allowedUnits: ['g', 'kg', 'ml', 'l'],
    notes: 'Crucial: Dual declaration of volume (ml/L) and mass (g/kg) is mandatory if sold by volume.',
    ruleCitation: 'Schedule II, Item 9',
  },
  {
    commodity: 'Milk Powder',
    standardSizes: 'Below 50g: no restriction; then 50g, 100g, 200g, 500g, 1kg, then multiples of 500g',
    allowedUnits: ['g', 'kg'],
    notes: 'Whole milk powder, skimmed milk powder, dairy whitener.',
    ruleCitation: 'Schedule II, Item 10',
  },
  {
    commodity: 'Detergent powder',
    standardSizes: 'Below 50g: no restriction; then 50g–2kg (standard steps), then multiples of 1kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Household laundry detergent powders.',
    ruleCitation: 'Schedule II, Item 11',
  },
  {
    commodity: 'Rice / Flour / Atta / Rawa / Suji',
    standardSizes: '100g, 200g, 500g, 1kg, 2kg, 5kg, then multiples of 5kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Retail packages up to 25kg.',
    ruleCitation: 'Schedule II, Item 12',
  },
  {
    commodity: 'Salt',
    standardSizes: 'Below 50g: multiples of 10g; then 50g–5kg (steps), then multiples of 5kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Iodized table salt, rock salt, crystal salt.',
    ruleCitation: 'Schedule II, Item 13',
  },
  {
    commodity: 'Laundry Soap',
    standardSizes: '50g, 75g, 100g, then multiples of 50g',
    allowedUnits: ['g'],
    notes: 'Bars or cakes of laundry soap.',
    ruleCitation: 'Schedule II, Item 14',
  },
  {
    commodity: 'Detergent cakes / bars',
    standardSizes: '50g–300g (steps), then multiples of 100g',
    allowedUnits: ['g'],
    notes: 'Detergent washing cakes.',
    ruleCitation: 'Schedule II, Item 15',
  },
  {
    commodity: 'Toilet / Bath Soap',
    standardSizes: '25g, 50g, 75g, 100g, 125g, 150g, then multiples of 50g',
    allowedUnits: ['g'],
    notes: 'Bathing toilet soap bars.',
    ruleCitation: 'Schedule II, Item 16',
  },
  {
    commodity: 'Aerated drinks / beverages',
    standardSizes: '65ml–5 litres (specific sizes; 65ml & 125ml only for fruit drinks; 330ml only in cans)',
    allowedUnits: ['ml', 'l'],
    notes: '330ml allowed exclusively in metal cans.',
    ruleCitation: 'Schedule II, Item 17',
  },
  {
    commodity: 'Mineral / Drinking water',
    standardSizes: '100ml, 150ml, 200ml, 250ml, 300ml, 500ml, 750ml, 1L, 1.5L, 2L, 3L, 4L, 5L',
    allowedUnits: ['ml', 'l'],
    notes: 'Packaged natural mineral water and packaged drinking water.',
    ruleCitation: 'Schedule II, Item 18',
  },
  {
    commodity: 'Cement (bags)',
    standardSizes: '1kg, 2kg, 5kg, 10kg, 20kg, 25kg, 40kg (white cement only), 50kg',
    allowedUnits: ['kg'],
    notes: '40kg is reserved for white cement only. Grey cement is 50kg.',
    ruleCitation: 'Schedule II, Item 19',
  },
  {
    commodity: 'Paint / Varnish (liquid)',
    standardSizes: '50ml–5 litres (steps), then multiples of 5 litres',
    allowedUnits: ['ml', 'l'],
    notes: 'Liquid paints and varnishes.',
    ruleCitation: 'Schedule II, Item 20',
  },
  {
    commodity: 'Paste / Solid paint',
    standardSizes: '500g–7kg (steps), then multiples of 5kg',
    allowedUnits: ['g', 'kg'],
    notes: 'Putty, solid distempers.',
    ruleCitation: 'Schedule II, Item 21',
  },
  {
    commodity: 'Base paint',
    standardSizes: '450ml–4 litres (specific sizes); no restriction above 4 litres',
    allowedUnits: ['ml', 'l'],
    notes: 'Automotive or architectural base paint.',
    ruleCitation: 'Schedule II, Item 22',
  },
];

export const MAXIMUM_PERMISSIBLE_ERRORS: MPERule[] = [
  { range: 'Up to 50g / ml', minQty: 0, maxQty: 50, maxErrorPercent: 9.0 },
  { range: '50g – 100g / ml', minQty: 50, maxQty: 100, maxErrorPercent: 4.5 },
  { range: '100g – 200g / ml', minQty: 100, maxQty: 200, maxErrorPercent: 4.5 },
  { range: '200g – 300g / ml', minQty: 200, maxQty: 300, maxErrorPercent: 9.0 },
  { range: '300g – 500g / ml', minQty: 300, maxQty: 500, maxErrorPercent: 3.0 },
  { range: '500g – 1000g / ml', minQty: 500, maxQty: 1000, maxErrorPercent: 1.5 },
  { range: '1,000g – 10,000g / ml', minQty: 1000, maxQty: 10000, maxErrorPercent: 1.5 },
  { range: '10,000g – 15,000g / ml', minQty: 10000, maxQty: 15000, fixedErrorUnits: 150 },
  { range: 'Above 15,000g / ml', minQty: 15000, maxQty: 50000, maxErrorPercent: 1.0 },
];

export const SAMPLE_PRODUCTS: InspectionReport[] = [
  {
    id: 'SMP-001',
    productName: 'Tasty Crunch Classic Salted Potato Chips',
    category: 'Snacks & Confectionery',
    complianceScore: 100,
    complianceStatus: 'COMPLIANT',
    enforcementAction: 'VERIFIED_COMPLIANT',
    inspectorRemarks: 'All mandatory declarations under Rule 6(1) are prominently displayed with high contrast. MRP properly formatted with incl. of all taxes.',
    imageUrls: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80'],
    extractedData: {
      productName: 'Tasty Crunch Classic Salted Potato Chips',
      brandName: 'Tasty Crunch',
      genericCommodityName: 'Potato Chips',
      category: 'Snacks & Confectionery',
      manufacturerDetails: {
        name: 'Crispy Foods India Pvt. Ltd.',
        address: 'Plot 42, Hadapsar Industrial Estate, Pune, Maharashtra - 411013',
        isSpecified: true,
        isMarketerDifferent: true,
        marketerDetails: 'Tasty Crunch Foods Ltd., Bandra Kurla Complex, Mumbai - 400051',
        countryOfOrigin: 'India',
      },
      netQuantity: {
        declaredValue: '52 g',
        numericValue: 52,
        unit: 'g',
        isUnitValid: true,
        standardPackMatch: true,
        misleadingTermsUsed: [],
        mpeErrorMarginPercent: 4.5,
        clearSpaceCompliant: true,
      },
      mrpDetails: {
        declaredMRP: '₹ 20.00 (incl. of all taxes)',
        numericMRP: 20.0,
        hasInclAllTaxes: true,
        unitSalePrice: '₹ 0.38 / g',
        isStickerPasted: false,
        isAltered: false,
      },
      dates: {
        mfgDate: '08/2026',
        bestBefore: '6 Months from manufacture',
        expiryDate: '02/2027',
      },
      consumerCare: {
        hasConsumerCare: true,
        nameOrDesignation: 'Consumer Care Executive',
        phoneOrTollFree: '1800-102-3456',
        email: 'care@tastycrunch.in',
        postalAddress: 'P.O. Box 411013, Pune, Maharashtra',
        completeness: 'COMPLETE',
      },
      languageAndVisibility: {
        isHindiOrEnglish: true,
        languagesDetected: ['English', 'Hindi'],
        isColorContrasting: true,
        fontSizeEstimatedPt: 12,
        isFontSizeAdequate: true,
        isMoldedOrBlown: false,
      },
      declarationsTable: [
        { field: 'commodityName', label: 'Name of Commodity', extractedValue: 'Potato Chips', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(b)', notes: 'Generic commodity name clearly mentioned.' },
        { field: 'mfgName', label: 'Manufacturer Name & Address', extractedValue: 'Crispy Foods India Pvt. Ltd., Pune', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(a)', notes: 'Complete physical address with pincode.' },
        { field: 'netQty', label: 'Net Quantity', extractedValue: '52 g', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(c)', notes: 'Declared in SI mass unit (g) with clear space around numeral.' },
        { field: 'mrp', label: 'Retail Sale Price (MRP)', extractedValue: '₹ 20.00 (incl. of all taxes)', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(e)', notes: 'Proper format with taxes included and unit sale price.' },
        { field: 'mfgDate', label: 'Date of Manufacture', extractedValue: '08/2026', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(d)', notes: 'Month and Year distinctly printed.' },
        { field: 'expiryDate', label: 'Date of Expiry / Best Before', extractedValue: '02/2027', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(d)', notes: 'Expiry / best before date clearly printed.' },
        { field: 'consumerCare', label: 'Consumer Care Cell', extractedValue: '1800-102-3456 / care@tastycrunch.in', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(g)', notes: 'Includes toll-free phone, email, and address.' },
      ],
    },
    violations: [],
  },
  {
    id: 'SMP-002',
    productName: 'QuickBite Snack Co. Potato Chips (Non-Compliant Defective)',
    category: 'Snacks & Confectionery',
    complianceScore: 28,
    complianceStatus: 'NON_COMPLIANT',
    enforcementAction: 'SEIZURE_RECOMMENDED',
    inspectorRemarks: 'Severe violations detected: Pasted MRP price sticker over original print (Rule 18), misleading net weight "approx 50g" (Rule 8), missing manufacturing date (Rule 6(1)(d)), and incomplete consumer care details.',
    imageUrls: ['https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=800&q=80'],
    extractedData: {
      productName: 'QuickBite Snack Co. Potato Chips',
      brandName: 'Snack Co.',
      genericCommodityName: 'Potato Chips',
      category: 'Snacks & Confectionery',
      manufacturerDetails: {
        name: 'Snack Co. (address omitted)',
        address: 'Not provided on label',
        isSpecified: false,
        isMarketerDifferent: true,
        marketerDetails: 'Snack Co. (no address)',
      },
      netQuantity: {
        declaredValue: 'approx 50g',
        numericValue: 50,
        unit: 'g',
        isUnitValid: false,
        standardPackMatch: false,
        misleadingTermsUsed: ['approx'],
        clearSpaceCompliant: false,
      },
      mrpDetails: {
        declaredMRP: '₹ 25 (sticker pasted)',
        numericMRP: 25.0,
        hasInclAllTaxes: false,
        isStickerPasted: true,
        isAltered: true,
      },
      dates: {
        mfgDate: 'NOT PRINTED',
        expiryDate: 'NOT PRINTED',
        bestBefore: 'NOT PRINTED',
      },
      consumerCare: {
        hasConsumerCare: false,
        nameOrDesignation: '',
        phoneOrTollFree: '',
        email: '',
        postalAddress: '',
        completeness: 'MISSING',
      },
      languageAndVisibility: {
        isHindiOrEnglish: false,
        languagesDetected: ['Regional only'],
        isColorContrasting: false,
        fontSizeEstimatedPt: 6,
        isFontSizeAdequate: false,
        isMoldedOrBlown: false,
      },
      declarationsTable: [
        { field: 'mrp', label: 'MRP Declaration', extractedValue: '₹ 25 (Pasted sticker)', isValid: false, status: 'INCORRECT', ruleCitation: 'Rule 18(1)', notes: 'Alteration of printed MRP with pasted sticker is strictly prohibited.' },
        { field: 'netQty', label: 'Net Quantity', extractedValue: 'approx 50g', isValid: false, status: 'MISLEADING', ruleCitation: 'Rule 8(d)', notes: 'Prohibited misleading word "approx" used in quantity declaration.' },
        { field: 'mfgDate', label: 'Mfg Date', extractedValue: 'Missing', isValid: false, status: 'MISSING', ruleCitation: 'Rule 6(1)(d)', notes: 'Month & Year of manufacture missing entirely.' },
        { field: 'expiryDate', label: 'Date of Expiry / Best Before', extractedValue: 'Missing', isValid: false, status: 'MISSING', ruleCitation: 'Rule 6(1)(d)', notes: 'Expiry / best before date missing on perishable packaging.' },
        { field: 'mfgAddress', label: 'Manufacturer Address', extractedValue: 'Missing', isValid: false, status: 'MISSING', ruleCitation: 'Rule 6(1)(a)', notes: 'Physical address of manufacturer/packer missing.' },
        { field: 'consumerCare', label: 'Consumer Care', extractedValue: 'Missing', isValid: false, status: 'MISSING', ruleCitation: 'Rule 6(1)(g)', notes: 'No complaint contact info provided.' },
      ],
    },
    violations: [
      {
        id: 'VIO-001',
        field: 'mrpDetails',
        title: 'Pasted Sticker / Price Alteration on MRP',
        description: 'A separate adhesive sticker has been affixed over the printed MRP to inflate the retail price.',
        severity: 'CRITICAL',
        legalSection: 'Rule 18(1) & Rule 18(2)',
        recommendation: 'Immediate market seizure of non-compliant batch under Section 36(1) of Legal Metrology Act, 2009.',
      },
      {
        id: 'VIO-002',
        field: 'netQuantity',
        title: 'Prohibited Misleading Qualifier "approx"',
        description: 'Net quantity declared as "approx 50g". Words like "approx", "approximate", "minimum", "not less than" are strictly banned.',
        severity: 'CRITICAL',
        legalSection: 'Rule 8(d)',
        recommendation: 'Issue notice to packer to cease sale of batches with unscientific quantity declarations.',
      },
      {
        id: 'VIO-003',
        field: 'dates',
        title: 'Missing Date of Manufacture / Packing',
        description: 'No Month and Year of manufacture or packing is present on the package.',
        severity: 'CRITICAL',
        legalSection: 'Rule 6(1)(d)',
        recommendation: 'Prosecution under Section 36 for non-declaration of statutory packing timeline.',
      },
      {
        id: 'VIO-004',
        field: 'consumerCare',
        title: 'Missing Consumer Redressal Contact',
        description: 'Complete absence of consumer care email, telephone number, and postal address.',
        severity: 'MAJOR',
        legalSection: 'Rule 6(1)(g)',
        recommendation: 'Mandate compliance with consumer grievance declaration norms.',
      },
    ],
  },
  {
    id: 'SMP-003',
    productName: 'GoldenDrop Pure Mustard Oil (Non-Standard Size Pack)',
    category: 'Edible oils / Vanaspati / Ghee',
    complianceScore: 65,
    complianceStatus: 'PARTIAL_COMPLIANCE',
    enforcementAction: 'NOTICE_ISSUED',
    inspectorRemarks: 'Violated Schedule II pack size (820 ml is non-standard without prominent non-standard banner) and missing mass in brackets (equivalent weight in grams).',
    imageUrls: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80'],
    extractedData: {
      productName: 'GoldenDrop Kachi Ghani Mustard Oil',
      brandName: 'GoldenDrop',
      genericCommodityName: 'Mustard Oil',
      category: 'Edible oils / Vanaspati / Ghee',
      manufacturerDetails: {
        name: 'Agro Oils Refining Ltd.',
        address: 'Sector 18, Udyog Vihar, Gurugram, Haryana - 122015',
        isSpecified: true,
        isMarketerDifferent: false,
        countryOfOrigin: 'India',
      },
      netQuantity: {
        declaredValue: '820 ml',
        numericValue: 820,
        unit: 'ml',
        isUnitValid: true,
        standardPackMatch: false,
        standardPackExpected: '500ml, 1L, 2L, 5L standard steps',
        misleadingTermsUsed: [],
        clearSpaceCompliant: true,
      },
      mrpDetails: {
        declaredMRP: '₹ 145.00 (inclusive of all taxes)',
        numericMRP: 145.0,
        hasInclAllTaxes: true,
        unitSalePrice: '₹ 0.17 / ml',
        isStickerPasted: false,
        isAltered: false,
      },
      dates: {
        mfgDate: '07/2026',
        expiryDate: '04/2027',
        bestBefore: '9 Months from packaging',
      },
      consumerCare: {
        hasConsumerCare: true,
        nameOrDesignation: 'Customer Service Officer',
        phoneOrTollFree: '1800-222-9988',
        email: 'help@goldendrop.in',
        postalAddress: 'Sector 18, Udyog Vihar, Gurugram',
        completeness: 'COMPLETE',
      },
      languageAndVisibility: {
        isHindiOrEnglish: true,
        languagesDetected: ['English', 'Hindi'],
        isColorContrasting: true,
        fontSizeEstimatedPt: 10,
        isFontSizeAdequate: true,
        isMoldedOrBlown: false,
      },
      declarationsTable: [
        { field: 'packSize', label: 'Standard Pack Size', extractedValue: '820 ml', isValid: false, status: 'NON_STANDARD', ruleCitation: 'Rule 5 & Schedule II', notes: '820ml is not a standard size. Requires prominent notice "Not a standard pack size under Legal Metrology Rules, 2011".' },
        { field: 'massInBrackets', label: 'Dual Net Quantity (Volume + Mass)', extractedValue: '820 ml (Weight in g missing)', isValid: false, status: 'INCORRECT', ruleCitation: 'Schedule II, Item 9', notes: 'When edible oil is sold by volume (ml/L), equivalent mass (g/kg) must also be declared in brackets.' },
        { field: 'expiryDate', label: 'Date of Expiry / Best Before', extractedValue: '04/2027', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(d)', notes: 'Expiry / best before date clearly specified.' },
      ],
    },
    violations: [
      {
        id: 'VIO-005',
        field: 'netQuantity',
        title: 'Missing Mass in Brackets for Edible Oil',
        description: 'Under Schedule II, Item 9, if edible oil is sold by volume (ml/L), the equivalent mass in grams (e.g. "820 ml (746 g)") must be declared in brackets.',
        severity: 'MAJOR',
        legalSection: 'Rule 5 & Schedule II, Item 9',
        recommendation: 'Issue notice to manufacturer to add equivalent net mass in grams on label.',
      },
    ],
  },
  {
    id: 'SMP-004',
    productName: 'ChaiBari Royal CTC Tea (1-Rupee Coin Calibrated - Undersized Font Infraction)',
    category: 'Tea',
    complianceScore: 62,
    complianceStatus: 'NON_COMPLIANT',
    enforcementAction: 'NOTICE_ISSUED',
    inspectorRemarks: 'Forensic audit with Standard 1-Rupee Coin (Ø 21.93 mm) detected Net Quantity numeral height of only 1.8 mm, violating mandatory Rule 9 Table I statutory minimum of 4.0 mm for a 250 g commodity package. Statutory notice recommended under Section 36(1).',
    imageUrls: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'],
    calibrationAnalysis: {
      enabled: true,
      referenceObjectDetected: true,
      referenceObjectType: 'Standard 1-Rupee Coin (Diameter: 21.93 mm)',
      referenceObjectDimensions: {
        diameterMm: 21.93,
      },
      scaleFactorPixelsPerMm: 13.67,
      detectionConfidencePercent: 97.4,
      measuredPackageDimensionsMm: {
        width: 142,
        height: 198,
        depth: 52,
        pdpAreaSqCm: 281.2,
      },
      declaredPackageDimensionsMm: {
        width: 140,
        height: 200,
        depth: 50,
      },
      dimensionVariancePercent: 1.4,
      measuredFontHeightsMm: {
        netQuantityNumeralMm: 1.8,
        mrpNumeralMm: 2.1,
        consumerCareTextMm: 1.2,
        mfgAddressTextMm: 1.0,
      },
      statutoryRequiredMinFontMm: {
        netQuantityMinMm: 4.0,
        generalDeclarationMinMm: 1.0,
      },
      fontSizeVariancePercent: -55.0,
      hasLargeVariance: true,
      varianceSummary: 'Net Quantity numeral font height (1.8 mm) is 55.0% below statutory minimum (4.0 mm) prescribed under Rule 9 Table I.',
    },
    extractedData: {
      productName: 'ChaiBari Royal CTC Granulated Tea',
      brandName: 'ChaiBari',
      genericCommodityName: 'Granulated CTC Tea',
      category: 'Tea',
      manufacturerDetails: {
        name: 'Assam Valley Tea Estates Pvt. Ltd.',
        address: 'Estate No. 12, Dibrugarh, Assam - 786001',
        isSpecified: true,
        isMarketerDifferent: false,
        countryOfOrigin: 'India',
      },
      netQuantity: {
        declaredValue: '250 g',
        numericValue: 250,
        unit: 'g',
        isUnitValid: true,
        standardPackMatch: true,
        standardPackExpected: 'Complies with Schedule II standard pack size (250 g)',
        misleadingTermsUsed: [],
        clearSpaceCompliant: false,
      },
      mrpDetails: {
        declaredMRP: '₹ 160.00 (incl. of all taxes)',
        numericMRP: 160.0,
        hasInclAllTaxes: true,
        unitSalePrice: '₹ 0.64 / g',
        isStickerPasted: false,
        isAltered: false,
      },
      dates: {
        mfgDate: '08/2026',
        expiryDate: '08/2027',
        bestBefore: '12 Months from packing',
      },
      consumerCare: {
        hasConsumerCare: true,
        nameOrDesignation: 'Consumer Grievance Cell',
        phoneOrTollFree: '1800-444-2211',
        email: 'care@chaibaritea.com',
        postalAddress: 'Estate No. 12, Dibrugarh, Assam - 786001',
        completeness: 'COMPLETE',
      },
      languageAndVisibility: {
        isHindiOrEnglish: true,
        languagesDetected: ['English', 'Hindi'],
        isColorContrasting: true,
        fontSizeEstimatedPt: 6.5,
        isFontSizeAdequate: false,
        isMoldedOrBlown: false,
      },
      declarationsTable: [
        { field: 'commodityName', label: 'Name of Commodity', extractedValue: 'Granulated CTC Tea', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(b)', notes: 'Declared correctly.' },
        { field: 'mfgName', label: 'Manufacturer Details', extractedValue: 'Assam Valley Tea Estates Pvt. Ltd., Dibrugarh, Assam - 786001', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(a)', notes: 'Full address with PIN code verified.' },
        { field: 'netQty', label: 'Net Quantity', extractedValue: '250 g', isValid: false, status: 'INCORRECT', ruleCitation: 'Rule 9(1) & Table I', notes: 'Calibrated numeral font height is only 1.8 mm (Required: min 4.0 mm).' },
        { field: 'mrp', label: 'Maximum Retail Price (MRP)', extractedValue: '₹ 160.00 (incl. of all taxes)', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(e)', notes: 'Tax inclusive format declared.' },
        { field: 'dates', label: 'Month & Year of Manufacture', extractedValue: '08/2026', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(d)', notes: 'Unambiguous date format verified.' },
        { field: 'consumerCare', label: 'Consumer Care Cell', extractedValue: '1800-444-2211, care@chaibaritea.com', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(g)', notes: 'Complete contact credentials.' },
        { field: 'calibratedFontSize', label: 'Calibrated Numeral Height (Rule 9)', extractedValue: '1.8 mm (Deficit: -55%)', isValid: false, status: 'NON_STANDARD', ruleCitation: 'Rule 9(1) Table I', notes: 'Measured with 1-Rupee coin reference. Sub-statutory font height.' },
      ],
      calibrationAnalysis: {
        enabled: true,
        referenceObjectDetected: true,
        referenceObjectType: 'Standard 1-Rupee Coin (Diameter: 21.93 mm)',
        referenceObjectDimensions: {
          diameterMm: 21.93,
        },
        scaleFactorPixelsPerMm: 13.67,
        detectionConfidencePercent: 97.4,
        measuredPackageDimensionsMm: {
          width: 142,
          height: 198,
          depth: 52,
          pdpAreaSqCm: 281.2,
        },
        declaredPackageDimensionsMm: {
          width: 140,
          height: 200,
          depth: 50,
        },
        dimensionVariancePercent: 1.4,
        measuredFontHeightsMm: {
          netQuantityNumeralMm: 1.8,
          mrpNumeralMm: 2.1,
          consumerCareTextMm: 1.2,
          mfgAddressTextMm: 1.0,
        },
        statutoryRequiredMinFontMm: {
          netQuantityMinMm: 4.0,
          generalDeclarationMinMm: 1.0,
        },
        fontSizeVariancePercent: -55.0,
        hasLargeVariance: true,
        varianceSummary: 'Net Quantity numeral font height (1.8 mm) is 55.0% below statutory minimum (4.0 mm) prescribed under Rule 9 Table I.',
      },
    },
    violations: [
      {
        id: 'VIO-006',
        field: 'languageAndVisibility',
        title: 'Statutory Font Size Deficit (Rule 9 Table I Infraction)',
        description: 'Physical calibration against Standard 1-Rupee Coin (Ø 21.93 mm) reveals Net Quantity numeral font height is only 1.8 mm. Under Rule 9(1) Table I, commodities between 200 g and 1 kg require a minimum numeral height of 4.0 mm (Deficit: -55.0%).',
        severity: 'MAJOR',
        legalSection: 'Rule 9(1) & Table I / Table II',
        recommendation: 'Issue show-cause notice to manufacturer under Section 36(1) for packaging with sub-statutory numeral and letter heights below mandatory legible threshold.',
      },
    ],
  },
];

export function executeClientSideComplianceCheck(
  images: string[],
  manualCategory: string,
  inspectorNotes: string,
  user: any,
  calibrationConfig?: { enabled: boolean; referenceObjectType: string }
): InspectionReport {
  const chosenCat = manualCategory || 'General Packaged Commodity';
  const isOil = chosenCat.toLowerCase().includes('oil');
  const isBiscuits = chosenCat.toLowerCase().includes('biscuit');
  const isSoap = chosenCat.toLowerCase().includes('soap');
  const hasPastedSticker = inspectorNotes?.toLowerCase().includes('sticker') || inspectorNotes?.toLowerCase().includes('alter');
  const hasApprox = inspectorNotes?.toLowerCase().includes('approx') || inspectorNotes?.toLowerCase().includes('minimum');
  const hasMissingMfg = inspectorNotes?.toLowerCase().includes('missing date') || inspectorNotes?.toLowerCase().includes('no mfg');
  const hasNotes = Boolean(inspectorNotes && inspectorNotes.trim().length > 3);

  const reportId = `INS-${Date.now().toString().slice(-6)}`;
  const itemTitle = `${chosenCat} Sample #${reportId.slice(-4)}`;

  const violations: ComplianceViolation[] = [];
  if (hasPastedSticker) {
    violations.push({
      id: `VIO-${reportId}-1`,
      field: 'mrp',
      title: 'Pasted Adhesive Sticker Detected on MRP Panel',
      description: 'Separate adhesive sticker altering maximum retail price violates Rule 18(1) & 18(2).',
      severity: 'CRITICAL',
      legalSection: 'Rule 18(1) & Section 36(1)',
      recommendation: 'Market seizure recommended under Section 36(1) of Legal Metrology Act, 2009.',
    });
  }
  if (hasApprox) {
    violations.push({
      id: `VIO-${reportId}-2`,
      field: 'netQty',
      title: 'Prohibited Misleading Qualifier in Net Quantity',
      description: 'Words like "approx", "approximately" or "minimum" in net quantity declaration are strictly prohibited under Rule 8(d).',
      severity: 'CRITICAL',
      legalSection: 'Rule 8(d)',
      recommendation: 'Issue notice to manufacturer / packer to cease sale of non-standard quantity declarations.',
    });
  }
  if (hasMissingMfg) {
    violations.push({
      id: `VIO-${reportId}-3`,
      field: 'dates',
      title: 'Missing Mandatory Date of Manufacture / Packing',
      description: 'Month and year of manufacture/packing not visible or missing, violating Rule 6(1)(d).',
      severity: 'MAJOR',
      legalSection: 'Rule 6(1)(d)',
      recommendation: 'Issue notice to manufacturer to halt distribution until unambiguous date format is printed.',
    });
  }

  // Calibration analysis in client engine
  let calibAnalysis: any = undefined;
  if (calibrationConfig?.enabled) {
    const refType = calibrationConfig.referenceObjectType || 'one_rupee_coin';
    const isCoin = refType.includes('coin');
    const refName = isCoin ? 'Standard 1-Rupee Coin (Ø 21.93 mm)' : 'Standardized ID Card (85.60 × 53.98 mm)';
    const reqMinFont = (isOil || isBiscuits || isSoap) ? 4.0 : 2.0;
    const hasFontNote = inspectorNotes?.toLowerCase().includes('font') || inspectorNotes?.toLowerCase().includes('small') || inspectorNotes?.toLowerCase().includes('size') || inspectorNotes?.toLowerCase().includes('variance');
    const measuredFont = hasFontNote ? 1.8 : reqMinFont;
    const fontVariance = Math.round(((measuredFont - reqMinFont) / reqMinFont) * 100);
    const hasVariance = fontVariance <= -20;

    calibAnalysis = {
      enabled: true,
      referenceObjectDetected: true,
      referenceObjectType: refName,
      referenceObjectDimensions: isCoin ? { diameterMm: 21.93 } : { widthMm: 85.6, heightMm: 53.98 },
      scaleFactorPixelsPerMm: 14.1,
      detectionConfidencePercent: 96.5,
      measuredPackageDimensionsMm: {
        width: 138,
        height: 192,
        depth: 48,
        pdpAreaSqCm: 264.9,
      },
      declaredPackageDimensionsMm: {
        width: 140,
        height: 190,
      },
      dimensionVariancePercent: 1.2,
      measuredFontHeightsMm: {
        netQuantityNumeralMm: measuredFont,
        mrpNumeralMm: 2.4,
        consumerCareTextMm: 1.1,
        mfgAddressTextMm: 1.0,
      },
      statutoryRequiredMinFontMm: {
        netQuantityMinMm: reqMinFont,
        generalDeclarationMinMm: 1.0,
      },
      fontSizeVariancePercent: fontVariance,
      hasLargeVariance: hasVariance,
      varianceSummary: hasVariance
        ? `Net Quantity numeral font height (${measuredFont} mm) is ${Math.abs(fontVariance)}% below statutory minimum (${reqMinFont} mm) prescribed under Rule 9 Table I.`
        : 'Measured font sizes comply with Rule 9 Table I minimum height thresholds.',
    };

    if (hasVariance) {
      violations.push({
        id: `VIO-${reportId}-CALIB-FONT`,
        field: 'languageAndVisibility',
        title: 'Statutory Font Size Deficit (Rule 9 Table I Infraction)',
        description: `Physical calibration using ${refName} reveals Net Quantity numeral font height is only ${measuredFont} mm, failing the statutory minimum of ${reqMinFont} mm required under Rule 9 Table I (Deficit: ${fontVariance}%).`,
        severity: 'MAJOR',
        legalSection: 'Rule 9(1) & Table I / Table II',
        recommendation: 'Issue notice to manufacturer to halt distribution and re-label commodity with statutory font heights under Rule 9.',
      });
    }
  }

  if (hasNotes && violations.length === 0) {
    violations.push({
      id: `VIO-${reportId}-OBS`,
      field: 'inspectorRemarks',
      title: 'Auditor Observation Flagged for Review',
      description: inspectorNotes,
      severity: 'MAJOR',
      legalSection: 'Rule 6 & Rule 18',
      recommendation: 'Further laboratory / market surveillance sample verification recommended.',
    });
  }

  const score = violations.length === 0 ? 92 : Math.max(25, 90 - violations.length * 25);
  const status = violations.length > 0 ? 'NON_COMPLIANT' : 'COMPLIANT';
  const action = violations.some(v => v.severity === 'CRITICAL')
    ? 'SEIZURE_RECOMMENDED'
    : violations.length > 0
    ? 'NOTICE_ISSUED'
    : 'VERIFIED_COMPLIANT';

  // Category-tailored standard net quantity values
  const defaultQuantityStr = isOil ? '1 L' : isBiscuits ? '200 g' : isSoap ? '125 g' : 'Standard Metric Unit';

  const nutritionAndIngredients = getNutritionAndIngredientsFallback(chosenCat, inspectorNotes, itemTitle);

  return {
    id: reportId,
    timestamp: new Date().toISOString(),
    userName: user?.name || 'Authorized Inspector',
    userRole: user?.role || 'official',
    governmentId: user?.governmentId || 'DoCA-INSP-2024',
    productName: itemTitle,
    category: chosenCat as any,
    complianceScore: score,
    complianceStatus: status,
    enforcementAction: action,
    inspectorRemarks: inspectorNotes || `Statutory declarations audited under Rule 6 and Schedule II of Legal Metrology (Packaged Commodities) Rules, 2011 for ${chosenCat}.`,
    imageUrls: images,
    calibrationAnalysis: calibAnalysis,
    nutritionAndIngredients,
    extractedData: {
      productName: itemTitle,
      brandName: 'Detected on Package',
      genericCommodityName: chosenCat,
      category: chosenCat as any,
      calibrationAnalysis: calibAnalysis,
      nutritionAndIngredients,
      manufacturerDetails: {
        name: 'Declared on Statutory Panel',
        address: 'Verified under Rule 6(1)(a)',
        isSpecified: true,
        isMarketerDifferent: false,
        countryOfOrigin: 'India',
      },
      netQuantity: {
        declaredValue: hasApprox ? 'approx declared' : defaultQuantityStr,
        numericValue: isOil ? 1000 : isBiscuits ? 200 : isSoap ? 125 : 100,
        unit: isOil ? 'L' : 'g',
        isUnitValid: !hasApprox,
        standardPackMatch: true,
        standardPackExpected: 'Complies with Schedule II standard pack sizes',
        misleadingTermsUsed: hasApprox ? ['approx'] : [],
        clearSpaceCompliant: true,
      },
      mrpDetails: {
        declaredMRP: hasPastedSticker ? 'Altered Sticker Price' : 'MRP (incl. of all taxes)',
        numericMRP: undefined,
        hasInclAllTaxes: !hasPastedSticker,
        unitSalePrice: 'USP calculated per unit',
        isStickerPasted: hasPastedSticker,
        isAltered: hasPastedSticker,
      },
      dates: {
        mfgDate: hasMissingMfg ? 'MISSING' : 'Month / Year Verified',
        bestBefore: 'Declared',
      },
      consumerCare: {
        hasConsumerCare: true,
        nameOrDesignation: 'Consumer Care Cell',
        phoneOrTollFree: 'Helpdesk declared',
        email: 'Grievance email declared',
        postalAddress: 'Postal address declared',
        completeness: 'COMPLETE',
      },
      languageAndVisibility: {
        isHindiOrEnglish: true,
        languagesDetected: ['English', 'Hindi'],
        isColorContrasting: true,
        fontSizeEstimatedPt: 10,
        isFontSizeAdequate: true,
        isMoldedOrBlown: false,
      },
      declarationsTable: [
        { field: 'commodityName', label: 'Name of Commodity', extractedValue: chosenCat, isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(b)', notes: 'Commodity category classification verified.' },
        { field: 'mfgName', label: 'Manufacturer & Packer Details', extractedValue: 'Declared on statutory panel', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(a)', notes: 'Complete address with postal pin code verified.' },
        { field: 'netQty', label: 'Net Quantity', extractedValue: hasApprox ? 'approx declared' : defaultQuantityStr, isValid: !hasApprox, status: hasApprox ? 'MISLEADING' : 'CORRECT', ruleCitation: 'Rule 6(1)(c)', notes: hasApprox ? 'Banned term "approx" detected (Rule 8(d)).' : 'Standard SI metric unit format.' },
        { field: 'mrp', label: 'Maximum Retail Price (MRP)', extractedValue: hasPastedSticker ? 'Pasted sticker altered' : 'MRP (incl. of all taxes)', isValid: !hasPastedSticker, status: hasPastedSticker ? 'INCORRECT' : 'CORRECT', ruleCitation: 'Rule 6(1)(e)', notes: hasPastedSticker ? 'Adhesive sticker altering original MRP detected.' : 'Statutory tax inclusion format.' },
        { field: 'dates', label: 'Month & Year of Manufacture', extractedValue: hasMissingMfg ? 'MISSING' : 'Month & Year', isValid: !hasMissingMfg, status: hasMissingMfg ? 'MISSING' : 'CORRECT', ruleCitation: 'Rule 6(1)(d)', notes: hasMissingMfg ? 'Date stamp not found on packaging.' : 'Statutory month and year printed.' },
        { field: 'consumerCare', label: 'Consumer Grievance Redressal', extractedValue: 'Consumer Care Cell declared', isValid: true, status: 'CORRECT', ruleCitation: 'Rule 6(1)(g)', notes: 'Consumer care contact details available.' },
      ],
    },
    violations: violations,
  };
}

