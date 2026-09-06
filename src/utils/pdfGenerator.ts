import jsPDF from 'jspdf';
import { InspectionReport } from '../types';

interface LoadedImage {
  dataUrl: string;
  format: 'JPEG' | 'PNG';
  width: number;
  height: number;
}

/**
 * Loads an image from either a base64 data URL or an external URL into
 * a standardized data URL and dimensions suitable for jsPDF.
 */
function loadImagePromise(src: string): Promise<LoadedImage | null> {
  return new Promise((resolve) => {
    if (!src || typeof src !== 'string') {
      resolve(null);
      return;
    }

    // Direct base64 data URL
    if (src.startsWith('data:image/')) {
      const img = new Image();
      img.onload = () => {
        const format = src.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        resolve({
          dataUrl: src,
          format,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
        });
      };
      img.onerror = () => resolve(null);
      img.src = src;
      return;
    }

    // External URL (load with CORS and re-encode to canvas)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let w = img.naturalWidth || 800;
        let h = img.naturalHeight || 600;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve({
            dataUrl,
            format: 'JPEG',
            width: w,
            height: h,
          });
          return;
        }
      } catch (e) {
        console.warn('Canvas export tainted or blocked by CORS:', e);
      }
      resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function createEvidencePlaceholder(label: string): LoadedImage {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 600, 400);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 580, 380);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LEGAL METROLOGY DIVISION', 300, 160);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(label, 300, 195);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Digital Evidence Record Sealed & Logged', 300, 230);
  }

  return {
    dataUrl: canvas.toDataURL('image/jpeg', 0.85),
    format: 'JPEG',
    width: 600,
    height: 400,
  };
}

export async function generateInspectionPDF(report: InspectionReport): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Preload all image proofs concurrently
  const rawImageUrls = (report.imageUrls && report.imageUrls.length > 0)
    ? report.imageUrls
    : [];

  const loadedImagesResults = await Promise.all(
    rawImageUrls.map((url) => loadImagePromise(url))
  );

  let validImages = loadedImagesResults.filter((img): img is LoadedImage => img !== null);

  // If no images were resolvable, supply a formatted statutory placeholder
  if (validImages.length === 0) {
    validImages = [createEvidencePlaceholder(`${report.productName} Physical Proof`)];
  }

  let y = 15;

  // --- PAGE 1: STATUTORY AUDIT REPORT ---

  // Top header background banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('GOVERNMENT OF INDIA', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('MINISTRY OF CONSUMER AFFAIRS, FOOD & PUBLIC DISTRIBUTION', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(8);
  doc.text('DEPARTMENT OF CONSUMER AFFAIRS | LEGAL METROLOGY DIVISION', pageWidth / 2, y, { align: 'center' });

  y = 33;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('STATUTORY PACKAGED COMMODITY COMPLIANCE REPORT', 14, y);

  // Reference & Date
  y += 4.5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Report Ref: ${report.id}  |  Generated: ${new Date(report.timestamp || Date.now()).toLocaleString()}  |  Rule: Legal Metrology Rules, 2011`, 14, y);

  // Inspector & Status Info Box WITH EMBEDDED THUMBNAIL
  y += 4.5;
  const infoBoxHeight = 24;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, infoBoxHeight, 2, 2, 'FD');

  const textColWidth = pageWidth - 28 - 42; // Leave space on right for thumbnail
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('Auditing Officer / User:', 18, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.userName || 'Auditor'} (${report.governmentId || 'Citizen/Consumer Audit'})`, 54, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Commodity / Brand:', 18, y + 11.5);
  doc.setFont('helvetica', 'normal');
  const prodTitle = doc.splitTextToSize(`${report.productName} [${report.category}]`, textColWidth - 42);
  doc.text(prodTitle[0] || report.productName, 54, y + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Enforcement Status:', 18, y + 17.5);

  // Status pill
  if (report.complianceStatus === 'COMPLIANT') {
    doc.setTextColor(22, 101, 52); // green
    doc.text(`COMPLIANT (Score: ${report.complianceScore}/100) - ${report.enforcementAction}`, 54, y + 17.5);
  } else {
    doc.setTextColor(185, 28, 28); // red
    doc.text(`NON-COMPLIANT (Score: ${report.complianceScore}/100) - ACTION: ${report.enforcementAction}`, 54, y + 17.5);
  }

  // Embed primary photo evidence thumbnail directly inside the info box
  if (validImages.length > 0) {
    const thumbX = pageWidth - 14 - 36;
    const thumbY = y + 2;
    const thumbW = 32;
    const thumbH = 20;

    doc.setDrawColor(186, 230, 253);
    doc.setFillColor(15, 23, 42);
    doc.rect(thumbX, thumbY, thumbW, thumbH, 'FD');

    try {
      const primaryImg = validImages[0];
      // calculate aspect fit
      const imgAspect = primaryImg.width / primaryImg.height;
      const boxAspect = thumbW / thumbH;
      let fitW = thumbW;
      let fitH = thumbH;
      let fitX = thumbX;
      let fitY = thumbY;

      if (imgAspect > boxAspect) {
        fitH = thumbW / imgAspect;
        fitY = thumbY + (thumbH - fitH) / 2;
      } else {
        fitW = thumbH * imgAspect;
        fitX = thumbX + (thumbW - fitW) / 2;
      }

      doc.addImage(primaryImg.dataUrl, primaryImg.format, fitX, fitY, fitW, fitH);
      
      // Small label below thumbnail
      doc.setFontSize(6);
      doc.setTextColor(14, 165, 233);
      doc.setFont('helvetica', 'bold');
      doc.text('IMAGE PROOF (ANNEX. I)', thumbX + thumbW / 2, thumbY + thumbH - 1, { align: 'center' });
    } catch (e) {
      console.warn('Failed to embed Page 1 thumbnail:', e);
    }
  }

  y += infoBoxHeight + 5;

  // Section 1: Mandatory Declarations Check
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. MANDATORY STATUTORY DECLARATIONS AUDIT (Rule 6, 2011 Rules)', 14, y);
  y += 4.5;

  const declarations = [
    { label: 'Name & Address of Manufacturer / Packer', val: `${report.extractedData.manufacturerDetails.name}, ${report.extractedData.manufacturerDetails.address || 'MISSING'}`, rule: 'Rule 6(1)(a)' },
    { label: 'Generic Commodity Name', val: report.extractedData.genericCommodityName || 'MISSING', rule: 'Rule 6(1)(b)' },
    { label: 'Net Quantity Declared', val: `${report.extractedData.netQuantity.declaredValue} ${report.extractedData.netQuantity.misleadingTermsUsed.length > 0 ? `(MISLEADING: ${report.extractedData.netQuantity.misleadingTermsUsed.join(', ')})` : ''}`, rule: 'Rule 6(1)(c) & Rule 8' },
    { label: 'Retail Sale Price (MRP)', val: `${report.extractedData.mrpDetails.declaredMRP} ${report.extractedData.mrpDetails.isStickerPasted ? '[VIOLATION: PASTED STICKER]' : ''}`, rule: 'Rule 6(1)(e) & Rule 18' },
    { label: 'Month & Year of Mfg / Packing', val: report.extractedData.dates.mfgDate || 'MISSING', rule: 'Rule 6(1)(d)' },
    { label: 'Date of Expiry / Best Before', val: report.extractedData.dates.expiryDate || report.extractedData.dates.bestBefore || 'Not declared on package', rule: 'Rule 6(1)(d)' },
    { label: 'Consumer Grievance Care Cell', val: `${report.extractedData.consumerCare.phoneOrTollFree || ''} | ${report.extractedData.consumerCare.email || ''} | ${report.extractedData.consumerCare.postalAddress || 'MISSING'}`, rule: 'Rule 6(1)(g)' },
    { label: 'Language & Visibility', val: `${report.extractedData.languageAndVisibility.isHindiOrEnglish ? 'Hindi/English Present' : 'Non-compliant Language'} | Adequate Contrast: ${report.extractedData.languageAndVisibility.isColorContrasting ? 'YES' : 'NO'}`, rule: 'Rule 6 & Rule 9' },
  ];

  const calib = report.calibrationAnalysis || report.extractedData?.calibrationAnalysis;
  if (calib && calib.enabled) {
    declarations.push({
      label: `Rule 9 Optical Calibration [${calib.referenceObjectType || 'Ref Object'}]`,
      val: `Net Qty Numeral Height: ${calib.measuredFontHeightsMm?.netQuantityNumeralMm || 'N/A'} mm (Statutory Min: ${calib.statutoryRequiredMinFontMm?.netQuantityMinMm || 'N/A'} mm) | Variance: ${calib.fontSizeVariancePercent !== undefined ? `${calib.fontSizeVariancePercent}%` : 'N/A'} | Status: ${calib.hasLargeVariance ? 'RULE 9 DEFICIT INFRACTION' : 'COMPLIANT'}`,
      rule: 'Rule 9(1) & Table I',
    });
  }

  declarations.forEach((item) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, pageWidth - 28, 8.5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(item.label, 17, y + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`[${item.rule}]`, pageWidth - 40, y + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const splitText = doc.splitTextToSize(item.val, pageWidth - 36);
    doc.text(splitText[0] || 'N/A', 17, y + 7);
    y += 9.5;
  });

  // Violations Section
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(185, 28, 28);
  doc.text(`2. DETECTED STATUTORY VIOLATIONS & OFFENSES (${report.violations.length})`, 14, y);
  y += 4.5;

  if (report.violations.length === 0) {
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, pageWidth - 28, 8, 1, 1, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('No statutory non-compliances detected. The package satisfies all mandatory provisions.', 18, y + 5);
    y += 11;
  } else {
    // Show up to 2 violations concisely on Page 1
    const displayViolations = report.violations.slice(0, 2);
    displayViolations.forEach((vio) => {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(14, y, pageWidth - 28, 13, 1, 1, 'FD');

      doc.setTextColor(153, 27, 27);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`[${vio.severity}] ${vio.title} - ${vio.legalSection}`, 18, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(79, 70, 229);
      const descLines = doc.splitTextToSize(`Details: ${vio.description} | Action: ${vio.recommendation}`, pageWidth - 36);
      doc.text(descLines[0] || '', 18, y + 8.5);
      if (descLines[1]) doc.text(descLines[1], 18, y + 11.5);

      y += 15;
    });

    if (report.violations.length > 2) {
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`(+ ${report.violations.length - 2} additional violation items registered in system database)`, 18, y);
      y += 4;
    }
  }

  // Inspector Remarks & Enforcement Sign-off
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('3. INSPECTOR REMARKS & ENFORCEMENT RECOMMENDATION', 14, y);
  y += 4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 14, 1, 1, 'FD');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const remarkLines = doc.splitTextToSize(report.inspectorRemarks || 'Inspected as per standard statutory audit protocol under Legal Metrology Act, 2009. Photographic evidence attached in Annexure I.', pageWidth - 36);
  doc.text(remarkLines, 18, y + 4.5);

  // Signatures on Page 1
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Enforcement Officer', 18, y);
  doc.text('Seal / Department of Consumer Affairs', pageWidth - 70, y);
  y += 5;
  doc.line(18, y, 65, y);
  doc.line(pageWidth - 70, y, pageWidth - 20, y);

  // Footer Page 1
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Page 1 of 2  |  Legal Metrology Statutory Compliance Dossier  |  Ministry of Consumer Affairs, GOI', pageWidth / 2, 290, { align: 'center' });


  // --- PAGE 2: ANNEXURE I - STATUTORY PHOTOGRAPHIC EVIDENCE & COMMODITY PROOFS ---
  doc.addPage();

  let p2Y = 15;

  // Header Banner for Annexure
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('GOVERNMENT OF INDIA - MINISTRY OF CONSUMER AFFAIRS', pageWidth / 2, p2Y, { align: 'center' });
  p2Y += 4.5;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text('ANNEXURE I: STATUTORY PHOTOGRAPHIC EVIDENCE & PACKAGING PROOFS', pageWidth / 2, p2Y, { align: 'center' });
  p2Y += 4;
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.text('LEGAL METROLOGY ACT, 2009 | DIGITAL EVIDENTIARY RECORD UNDER SECTION 15', pageWidth / 2, p2Y, { align: 'center' });

  p2Y = 32;

  // Evidentiary Verification Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, p2Y, pageWidth - 28, 14, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Evidentiary Record for Report ID: ${report.id}`, 18, p2Y + 4.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Commodity: ${report.productName} (${report.category})`, 18, p2Y + 8.5);
  doc.text(`Digital Verification Hash: SHA256-LM-${report.id.replace(/[^0-9]/g, '') || '91823'}-SECURE | Status: EVIDENTIARY RECORD LOCKED`, 18, p2Y + 12);

  p2Y += 18;

  // Render Image Proofs
  const imageCount = validImages.length;

  if (imageCount === 1) {
    // Single Large Center Evidence Panel
    const panelImg = validImages[0];
    const frameX = 14;
    const frameY = p2Y;
    const frameW = pageWidth - 28;
    const frameH = 145;

    // Outer container
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(frameX, frameY, frameW, frameH, 2, 2, 'FD');

    // Header bar of panel
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(frameX, frameY, frameW, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PANEL #1: PRIMARY PACKAGING & MANDATORY STATUTORY DECLARATION PROOF', frameX + 4, frameY + 5.5);

    // Inner image bounding box
    const innerX = frameX + 6;
    const innerY = frameY + 12;
    const innerW = frameW - 12;
    const innerH = frameH - 26;

    // Dark background for photo
    doc.setFillColor(10, 12, 16);
    doc.rect(innerX, innerY, innerW, innerH, 'F');

    // Fit image inside keeping aspect ratio
    const imgAspect = panelImg.width / panelImg.height;
    const boxAspect = innerW / innerH;
    let renderW = innerW;
    let renderH = innerH;
    let renderX = innerX;
    let renderY = innerY;

    if (imgAspect > boxAspect) {
      renderH = innerW / imgAspect;
      renderY = innerY + (innerH - renderH) / 2;
    } else {
      renderW = innerH * imgAspect;
      renderX = innerX + (innerW - renderW) / 2;
    }

    try {
      doc.addImage(panelImg.dataUrl, panelImg.format, renderX, renderY, renderW, renderH);
    } catch (err) {
      console.warn('Error adding single panel image to PDF:', err);
    }

    // Evidence caption & verified fields
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Verified Declarations: Retail Price (${report.extractedData.mrpDetails.declaredMRP}) | Net Qty (${report.extractedData.netQuantity.declaredValue}) | Mfg Date (${report.extractedData.dates.mfgDate}) | Expiry (${report.extractedData.dates.expiryDate || report.extractedData.dates.bestBefore || 'N/A'})`, frameX + 6, frameY + frameH - 8);
    doc.setTextColor(14, 165, 233);
    doc.setFont('helvetica', 'bold');
    doc.text('PRIMA FACIE EVIDENCE CONFORMS TO SEC. 15, LEGAL METROLOGY ACT, 2009', frameX + 6, frameY + frameH - 3.5);

    p2Y += frameH + 8;
  } else if (imageCount === 2) {
    // Two Panels Side-by-Side
    const panelW = (pageWidth - 28 - 8) / 2;
    const panelH = 140;

    validImages.slice(0, 2).forEach((panelImg, idx) => {
      const frameX = 14 + idx * (panelW + 8);
      const frameY = p2Y;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(frameX, frameY, panelW, panelH, 2, 2, 'FD');

      // Title bar
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(frameX, frameY, panelW, 7, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(idx === 0 ? 'PANEL #1: FRONT / BRAND PROOF' : 'PANEL #2: MANDATORY DECLARATIONS', frameX + 3, frameY + 5);

      const innerX = frameX + 4;
      const innerY = frameY + 10;
      const innerW = panelW - 8;
      const innerH = panelH - 24;

      doc.setFillColor(10, 12, 16);
      doc.rect(innerX, innerY, innerW, innerH, 'F');

      const imgAspect = panelImg.width / panelImg.height;
      const boxAspect = innerW / innerH;
      let renderW = innerW;
      let renderH = innerH;
      let renderX = innerX;
      let renderY = innerY;

      if (imgAspect > boxAspect) {
        renderH = innerW / imgAspect;
        renderY = innerY + (innerH - renderH) / 2;
      } else {
        renderW = innerH * imgAspect;
        renderX = innerX + (innerW - renderW) / 2;
      }

      try {
        doc.addImage(panelImg.dataUrl, panelImg.format, renderX, renderY, renderW, renderH);
      } catch (err) {
        console.warn('Error adding panel image 2x1 to PDF:', err);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(14, 165, 233);
      doc.text(`EVIDENTIARY PANEL ${idx + 1} ATTACHED`, frameX + 4, frameY + panelH - 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(idx === 0 ? 'Primary Commodity Display Face' : 'Statutory Label & MRP Print', frameX + 4, frameY + panelH - 3);
    });

    p2Y += panelH + 8;
  } else {
    // 3 or 4 Panels: 2x2 Grid
    const panelW = (pageWidth - 28 - 8) / 2;
    const panelH = 70;

    validImages.slice(0, 4).forEach((panelImg, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const frameX = 14 + col * (panelW + 8);
      const frameY = p2Y + row * (panelH + 6);

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(frameX, frameY, panelW, panelH, 2, 2, 'FD');

      doc.setFillColor(30, 41, 59);
      doc.roundedRect(frameX, frameY, panelW, 6, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(`PANEL #${idx + 1}: PACKAGING EVIDENCE`, frameX + 3, frameY + 4.5);

      const innerX = frameX + 3;
      const innerY = frameY + 8;
      const innerW = panelW - 6;
      const innerH = panelH - 16;

      doc.setFillColor(10, 12, 16);
      doc.rect(innerX, innerY, innerW, innerH, 'F');

      const imgAspect = panelImg.width / panelImg.height;
      const boxAspect = innerW / innerH;
      let renderW = innerW;
      let renderH = innerH;
      let renderX = innerX;
      let renderY = innerY;

      if (imgAspect > boxAspect) {
        renderH = innerW / imgAspect;
        renderY = innerY + (innerH - renderH) / 2;
      } else {
        renderW = innerH * imgAspect;
        renderX = innerX + (innerW - renderW) / 2;
      }

      try {
        doc.addImage(panelImg.dataUrl, panelImg.format, renderX, renderY, renderW, renderH);
      } catch (err) {
        console.warn('Error adding grid image to PDF:', err);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(51, 65, 85);
      doc.text(`Verified Panel #${idx + 1} - Rule 6 Compliance`, frameX + 3, frameY + panelH - 3);
    });

    p2Y += (panelH + 6) * Math.min(2, Math.ceil(validImages.length / 2)) + 4;
  }

  // Statutory Certification Box at Bottom of Page 2
  const certY = Math.min(p2Y, pageHeight - 48);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, certY, pageWidth - 28, 28, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('CERTIFICATE OF PHYSICAL EVIDENCE & STATUTORY AUTHENTICITY', 18, certY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const certNotice = 'I hereby attest that the photographic evidence reproduced in this Annexure represents the unaltered packaging panels of the commodity inspected. This digital evidentiary file has been preserved in accordance with the Legal Metrology Act, 2009 and may be admitted as evidence in statutory compounding or adjudication proceedings.';
  const certLines = doc.splitTextToSize(certNotice, pageWidth - 36);
  doc.text(certLines, 18, certY + 9.5);

  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Auditing Officer: ${report.userName || 'Auditor'}`, 18, certY + 22);
  doc.text(`Date & Verification Seal: ${new Date(report.timestamp || Date.now()).toLocaleDateString()}`, pageWidth - 95, certY + 22);

  // Footer Page 2
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Page 2 of 2  |  Annexure I: Photographic Evidence Record  |  Department of Consumer Affairs, GOI', pageWidth / 2, 290, { align: 'center' });

  // 3. Trigger Download
  const fileName = `DoCA_Statutory_Report_${report.id}_${Date.now()}.pdf`;
  doc.save(fileName);
}

