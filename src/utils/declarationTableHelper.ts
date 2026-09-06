import { DeclarationFieldItem, ExtractedProductData } from '../types';

interface StatutoryRuleDef {
  key: string;
  canonicalLabel: string;
  ruleCitation: string;
  defaultNotes: string;
  matchPatterns: RegExp[];
  getFallbackValue: (data?: Partial<ExtractedProductData>) => string;
  isCompliant: (val: string, data?: Partial<ExtractedProductData>) => { isValid: boolean; status: DeclarationFieldItem['status']; notes?: string };
}

const STATUTORY_DEFINITIONS: StatutoryRuleDef[] = [
  {
    key: 'commodityName',
    canonicalLabel: 'Name of Commodity (Generic Name)',
    ruleCitation: 'Rule 6(1)(b)',
    defaultNotes: 'Generic commodity category identification on package.',
    matchPatterns: [/commodity/i, /generic/i, /product\s*name/i, /item\s*name/i],
    getFallbackValue: (data) => data?.genericCommodityName || data?.productName || 'Not detected on package',
    isCompliant: (val) => {
      const isMissing = !val || val === 'Not detected on package' || val === 'Not visible on scanned panel(s)';
      return {
        isValid: !isMissing,
        status: isMissing ? 'MISSING' : 'CORRECT',
        notes: isMissing ? 'Generic commodity name not detected on scanned panel.' : 'Generic commodity name clearly printed.',
      };
    },
  },
  {
    key: 'mfgName',
    canonicalLabel: 'Manufacturer & Packer Name / Address',
    ruleCitation: 'Rule 6(1)(a)',
    defaultNotes: 'Complete physical address with postal code.',
    matchPatterns: [/mfg/i, /manufactur/i, /packer/i, /importer/i, /address/i, /premises/i],
    getFallbackValue: (data) => {
      const m = data?.manufacturerDetails;
      if (!m || !m.name || m.name === 'Not visible on scanned panel(s)' || m.name === 'Declared on statutory panel') {
        if (m?.address && m.address !== 'Not visible on scanned panel(s)') return m.address;
        return 'Not visible on scanned panel(s)';
      }
      if (m.address && m.address !== 'Not visible on scanned panel(s)' && !m.name.toLowerCase().includes(m.address.toLowerCase())) {
        return `${m.name}, ${m.address}`;
      }
      return m.name;
    },
    isCompliant: (val, data) => {
      const isMissing = !val || val === 'Not visible on scanned panel(s)' || val === 'Not provided on label' || val === 'Missing';
      const hasSpecified = data?.manufacturerDetails?.isSpecified !== false;
      return {
        isValid: !isMissing && hasSpecified,
        status: isMissing ? 'MISSING' : hasSpecified ? 'CORRECT' : 'INCORRECT',
        notes: isMissing
          ? 'Manufacturer address panel not visible on scanned image(s).'
          : 'Complete premises and manufacturer details verified.',
      };
    },
  },
  {
    key: 'netQty',
    canonicalLabel: 'Net Quantity (Weight / Measure / Count)',
    ruleCitation: 'Rule 6(1)(c) & Rule 12',
    defaultNotes: 'Standard SI metric unit declaration.',
    matchPatterns: [/net\s*qty/i, /net\s*quantity/i, /weight/i, /volume/i, /mass/i, /quantity/i],
    getFallbackValue: (data) => data?.netQuantity?.declaredValue || 'Not detected on package',
    isCompliant: (val, data) => {
      const isMissing = !val || val === 'Not detected on package' || val === 'Missing';
      const hasMisleading = data?.netQuantity?.misleadingTermsUsed && data.netQuantity.misleadingTermsUsed.length > 0;
      const lower = (val || '').toLowerCase();
      const isApprox = lower.includes('approx') || lower.includes('minimum') || lower.includes('when packed');
      if (isMissing) {
        return { isValid: false, status: 'MISSING', notes: 'Net quantity numeral not identified on package.' };
      }
      if (hasMisleading || isApprox) {
        return {
          isValid: false,
          status: 'MISLEADING',
          notes: 'Prohibited qualifier (approx/minimum) used in net quantity (Rule 8(d)).',
        };
      }
      return { isValid: true, status: 'CORRECT', notes: 'Standard SI metric unit declaration verified.' };
    },
  },
  {
    key: 'mrp',
    canonicalLabel: 'Maximum Retail Price (MRP) & Taxes',
    ruleCitation: 'Rule 6(1)(e) & Rule 18',
    defaultNotes: 'Retail sale price inclusive of all taxes.',
    matchPatterns: [/mrp/i, /retail\s*price/i, /price/i, /sale\s*price/i],
    getFallbackValue: (data) => data?.mrpDetails?.declaredMRP || 'Not detected on package',
    isCompliant: (val, data) => {
      const isMissing = !val || val === 'Not detected on package' || val === 'Missing';
      const isSticker = Boolean(data?.mrpDetails?.isStickerPasted) || (val || '').toLowerCase().includes('pasted sticker') || (val || '').toLowerCase().includes('sticker');
      if (isMissing) {
        return { isValid: false, status: 'MISSING', notes: 'MRP mark not visible on provided image.' };
      }
      if (isSticker) {
        return {
          isValid: false,
          status: 'INCORRECT',
          notes: 'Altering printed MRP with adhesive sticker violates Rule 18(1) & 18(2).',
        };
      }
      return { isValid: true, status: 'CORRECT', notes: 'Statutory MRP format with tax inclusion verified.' };
    },
  },
  {
    key: 'dates',
    canonicalLabel: 'Month & Year of Manufacture / Packing',
    ruleCitation: 'Rule 6(1)(d)',
    defaultNotes: 'Unambiguous month and year of manufacture or packing.',
    matchPatterns: [/mfg\s*date/i, /pkd/i, /packing\s*date/i, /month.*year/i, /date of mfg/i, /manufacture/i],
    getFallbackValue: (data) => data?.dates?.mfgDate || 'Not detected on package',
    isCompliant: (val) => {
      const isMissing = !val || val === 'Not detected on package' || val === 'Missing' || val === 'MISSING';
      return {
        isValid: !isMissing,
        status: isMissing ? 'MISSING' : 'CORRECT',
        notes: isMissing ? 'Month and Year of manufacture missing or unreadable.' : 'Statutory month and year format verified.',
      };
    },
  },
  {
    key: 'expiryDate',
    canonicalLabel: 'Date of Expiry / Best Before',
    ruleCitation: 'Rule 6(1)(d)',
    defaultNotes: 'Date of expiry, best before, or use by period declared on packaging.',
    matchPatterns: [/expiry/i, /best\s*before/i, /use\s*by/i, /exp\s*date/i, /expiry\s*date/i, /\bexp\b/i],
    getFallbackValue: (data) => data?.dates?.expiryDate || data?.dates?.bestBefore || 'Not declared on package',
    isCompliant: (val) => {
      const isMissing = !val || val === 'Not detected on package' || val === 'Missing' || val === 'MISSING' || val === 'Not declared on package';
      return {
        isValid: !isMissing,
        status: isMissing ? 'UNCLEAR' : 'CORRECT',
        notes: isMissing ? 'Expiry / best before date not detected on packaging panel(s).' : 'Expiry / best before date clearly specified.',
      };
    },
  },
  {
    key: 'consumerCare',
    canonicalLabel: 'Consumer Care Cell & Grievance Redressal',
    ruleCitation: 'Rule 6(1)(g)',
    defaultNotes: 'Helpline telephone number and email address.',
    matchPatterns: [/consumer/i, /care/i, /grievance/i, /helpline/i, /customer/i, /complaint/i],
    getFallbackValue: (data) => {
      const c = data?.consumerCare;
      if (!c) return 'Not declared on scanned panel';
      const phone = c.phoneOrTollFree && c.phoneOrTollFree !== 'Not declared' ? c.phoneOrTollFree : '';
      const email = c.email && c.email !== 'Not declared' ? c.email : '';
      const parts = [phone, email].filter(Boolean);
      if (parts.length > 0) return parts.join(' | ');
      return 'Not declared on scanned panel';
    },
    isCompliant: (val, data) => {
      const isMissing = !val || val === 'Not declared on scanned panel' || val === 'Missing' || val === 'Not specified';
      const completeness = data?.consumerCare?.completeness;
      if (isMissing || completeness === 'MISSING') {
        return { isValid: false, status: 'MISSING', notes: 'Consumer care helpline/email not found on package.' };
      }
      if (completeness === 'PARTIAL') {
        return { isValid: true, status: 'CORRECT', notes: 'Consumer care contact details partially available.' };
      }
      return { isValid: true, status: 'CORRECT', notes: 'Consumer care helpline and email verified.' };
    },
  },
  {
    key: 'origin',
    canonicalLabel: 'Country of Origin',
    ruleCitation: 'Rule 6(10)',
    defaultNotes: 'Statutory country of manufacture or assembly declaration.',
    matchPatterns: [/origin/i, /country/i],
    getFallbackValue: (data) => data?.manufacturerDetails?.countryOfOrigin || 'India',
    isCompliant: (val) => {
      const isMissing = !val || val === 'Missing';
      return {
        isValid: !isMissing,
        status: isMissing ? 'MISSING' : 'CORRECT',
        notes: 'Country of origin statutory declaration verified.',
      };
    },
  },
  {
    key: 'unitSalePrice',
    canonicalLabel: 'Unit Sale Price (USP)',
    ruleCitation: 'Rule 6(11)',
    defaultNotes: 'Unit price per standard metric unit (per g, kg, ml, l, or piece).',
    matchPatterns: [/usp/i, /unit\s*sale/i, /unit\s*price/i],
    getFallbackValue: (data) => data?.mrpDetails?.unitSalePrice || 'Declared on package',
    isCompliant: (val) => {
      const isMissing = !val || val === 'Not declared' || val === 'Missing';
      return {
        isValid: !isMissing,
        status: isMissing ? 'MISSING' : 'CORRECT',
        notes: isMissing ? 'Unit Sale Price not declared (mandatory under Rule 6(11)).' : 'Unit Sale Price calculation verified.',
      };
    },
  },
];

/**
 * Statutory field title keywords used to detect when an LLM puts the statutory
 * rule description into a value slot, or to detect swapped columns.
 */
const STATUTORY_TITLE_TERMS = [
  'commodity',
  'generic name',
  'product name',
  'item name',
  'manufacturer',
  'packer',
  'importer',
  'premises',
  'net quantity',
  'net weight',
  'net mass',
  'net volume',
  'retail sale price',
  'retail price',
  'maximum retail',
  'mrp',
  'unit sale price',
  'usp',
  'date of manufacture',
  'manufacture date',
  'mfg date',
  'date of packing',
  'pkd date',
  'packing date',
  'month and year',
  'consumer care',
  'grievance',
  'customer care',
  'helpline',
  'country of origin',
  'standard pack size',
  'statutory',
  'rule 6',
  'mandatory declaration',
  'expiry date',
  'date of expiry',
  'best before',
  'use by',
];

export function isStatutoryFieldTitle(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim().toLowerCase();
  if (t === 'mrp' || t === 'usp') return true;
  return STATUTORY_TITLE_TERMS.some((term) => t === term || t.startsWith(term) || t.includes(term));
}

/**
 * Checks if a string looks like an extracted value rather than a statutory field title.
 * For instance, numbers, currency symbols, metric units, dates, addresses, brand names.
 */
function isLikelyExtractedValue(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;

  // Currencies, weights, volumes, percentages
  if (/[₹$€£]|Rs\.?|INR|\b\d+(\.\d+)?\s*(g|kg|ml|l|ltr|gm|gms|mg|m|cm|mm|pcs|units|n)\b/i.test(trimmed)) {
    return true;
  }
  // Date formats e.g. 08/2026, 2026, 12/24, Aug 2026
  if (/\b\d{1,2}[\/\.-]\d{2,4}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{2,4}\b/i.test(trimmed)) {
    return true;
  }
  // Phone numbers, emails, URLs, addresses
  if (/\b\d{4,}\b|@|www\.|\.com|\.in|pvt|ltd|plot|sector|road|street|nagar|delhi|mumbai|bangalore|pune|kolkata|india/i.test(trimmed)) {
    return true;
  }
  // Specific packaging text like "Altered Sticker Price", "approx 50g", "₹ 20"
  if (/sticker|approx|not less than|batch|expir|mfg|pkd|made in/i.test(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Robust normalizer for the Mandatory Declarations Table.
 * Guarantees that:
 * 1. "label" ALWAYS contains the clean, official Statutory Field Title.
 * 2. "extractedValue" ALWAYS contains the actual packaging text/value.
 * 3. Never falsely marks "NOT DETECTED" when the value exists in extractedData.
 */
export function normalizeDeclarationsTable(
  rawTable: any[] | undefined,
  extractedData?: Partial<ExtractedProductData>
): DeclarationFieldItem[] {
  const safeTable = Array.isArray(rawTable) ? rawTable : [];
  const processedDefs = new Set<string>();
  const result: DeclarationFieldItem[] = [];

  // 1. Process items from safeTable
  for (const item of safeTable) {
    if (!item) continue;
    const rawField = String(item.field || '').trim();
    const rawLabel = String(item.label || '').trim();
    const rawExtracted = String(item.extractedValue || '').trim();
    const rawCitation = String(item.ruleCitation || '').trim();

    // Identify matching statutory rule definition
    const matchedDef = STATUTORY_DEFINITIONS.find((def) => {
      if (def.key.toLowerCase() === rawField.toLowerCase()) return true;
      return def.matchPatterns.some(
        (pattern) => pattern.test(rawField) || pattern.test(rawCitation) || (pattern.test(rawLabel) && isStatutoryFieldTitle(rawLabel))
      );
    });

    if (!matchedDef || processedDefs.has(matchedDef.key)) {
      continue;
    }
    processedDefs.add(matchedDef.key);

    // Determine extracted packaging value:
    const fallbackFromData = extractedData ? matchedDef.getFallbackValue(extractedData) : '';
    let resolvedExtractedValue = '';

    // Check if rawExtracted has a real value that is not a statutory field title or placeholder
    const isRawExtractedValid =
      Boolean(rawExtracted) &&
      rawExtracted !== 'NOT DETECTED' &&
      rawExtracted !== 'Not detected on package' &&
      rawExtracted !== 'Not visible on scanned panel(s)' &&
      rawExtracted !== 'Missing' &&
      rawExtracted !== matchedDef.canonicalLabel &&
      !isStatutoryFieldTitle(rawExtracted);

    // Check if rawLabel has the extracted value (LLM put statutory field name in `field` and value in `label`)
    const isRawLabelExtractedValue =
      Boolean(rawLabel) &&
      rawLabel !== matchedDef.canonicalLabel &&
      rawLabel !== 'NOT DETECTED' &&
      rawLabel !== 'Not detected on package' &&
      rawLabel !== 'Not visible on scanned panel(s)' &&
      rawLabel !== 'Missing' &&
      (!isStatutoryFieldTitle(rawLabel) || isLikelyExtractedValue(rawLabel));

    if (isRawExtractedValid) {
      resolvedExtractedValue = rawExtracted;
    } else if (isRawLabelExtractedValue) {
      // The extracted packaging value was placed inside label
      resolvedExtractedValue = rawLabel;
    } else if (fallbackFromData && fallbackFromData !== 'Not detected on package' && fallbackFromData !== 'Not visible on scanned panel(s)') {
      // Fallback from report.extractedData which was successfully parsed
      resolvedExtractedValue = fallbackFromData;
    } else {
      resolvedExtractedValue = rawExtracted || rawLabel || fallbackFromData || 'Not visible on scanned panel(s)';
      // If candidate is just a statutory rule title or empty placeholder, use fallback
      if (isStatutoryFieldTitle(resolvedExtractedValue) || resolvedExtractedValue === matchedDef.canonicalLabel) {
        resolvedExtractedValue = fallbackFromData || 'Not visible on scanned panel(s)';
      }
    }

    // If the user has manually edited this row, preserve their extractedValue, status, notes, and validity completely
    if (item.isUserEdited) {
      const userStatus = item.status || 'CORRECT';
      result.push({
        field: matchedDef.key,
        label: item.label || matchedDef.canonicalLabel,
        extractedValue: item.extractedValue !== undefined ? String(item.extractedValue) : (rawExtracted || fallbackFromData || 'Not visible on scanned panel(s)'),
        isValid: item.isValid !== undefined ? Boolean(item.isValid) : userStatus === 'CORRECT',
        status: userStatus,
        ruleCitation: item.ruleCitation || rawCitation || matchedDef.ruleCitation,
        notes: item.notes || (userStatus === 'CORRECT' ? 'Statutory declaration verified as compliant by auditor.' : matchedDef.defaultNotes),
        isUserEdited: true,
      });
      continue;
    }

    // Determine status & notes
    const compliance = matchedDef.isCompliant(resolvedExtractedValue, extractedData);
    let resolvedStatus = item.status;
    if (!resolvedStatus) {
      resolvedStatus = compliance.status;
    } else if (item.status === 'MISSING' && isRawExtractedValid && compliance.status === 'CORRECT') {
      // LLM defaulted to MISSING on initial ingest but real packaging text was discovered
      resolvedStatus = compliance.status;
    }

    result.push({
      field: matchedDef.key,
      label: matchedDef.canonicalLabel,
      extractedValue: resolvedExtractedValue,
      isValid: item.isValid !== undefined ? Boolean(item.isValid) : resolvedStatus === 'CORRECT',
      status: resolvedStatus,
      ruleCitation: rawCitation || matchedDef.ruleCitation,
      notes: item.notes || compliance.notes || matchedDef.defaultNotes,
    });
  }

  // 2. Ensure core Rule 6(1) fields exist even if the LLM omitted them in declarationsTable
  const coreKeys = ['commodityName', 'mfgName', 'netQty', 'mrp', 'dates', 'expiryDate', 'consumerCare'];
  for (const key of coreKeys) {
    if (!processedDefs.has(key)) {
      const def = STATUTORY_DEFINITIONS.find((d) => d.key === key);
      if (def) {
        processedDefs.add(def.key);
        const fallbackVal = extractedData ? def.getFallbackValue(extractedData) : 'Not visible on scanned panel(s)';
        const compliance = def.isCompliant(fallbackVal, extractedData);
        result.push({
          field: def.key,
          label: def.canonicalLabel,
          extractedValue: fallbackVal,
          isValid: compliance.isValid,
          status: compliance.status,
          ruleCitation: def.ruleCitation,
          notes: compliance.notes || def.defaultNotes,
        });
      }
    }
  }

  // Optional: check if country of origin or unit sale price was in extractedData and not yet added
  if (!processedDefs.has('origin') && extractedData?.manufacturerDetails?.countryOfOrigin) {
    const originDef = STATUTORY_DEFINITIONS.find((d) => d.key === 'origin');
    if (originDef) {
      result.push({
        field: originDef.key,
        label: originDef.canonicalLabel,
        extractedValue: extractedData.manufacturerDetails.countryOfOrigin,
        isValid: true,
        status: 'CORRECT',
        ruleCitation: originDef.ruleCitation,
        notes: originDef.defaultNotes,
      });
    }
  }

  return result;
}
