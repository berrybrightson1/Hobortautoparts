// PDF Generator Service - converted from Angular
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice, CompanyDetails, BankDetails } from '@/lib/billing/data/useData';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

/**
 * Get image dimensions from data URL
 */
function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Generate a professional, text-selectable PDF invoice with the premium orange brand styling
 */
export async function generateInvoicePdf(
  invoice: Invoice,
  company: CompanyDetails,
  bank?: BankDetails,
  terms?: string[],
  logoDataUrl?: string
): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Brand colors matching the premium mock
  const brandOrange: [number, number, number] = [238, 108, 43]; // #ee6c2b
  const lightOrange: [number, number, number] = [249, 189, 153]; // #f9bd99
  const veryLightOrange: [number, number, number] = [253, 237, 227]; // #fdede3
  const darkNavy: [number, number, number] = [44, 57, 75]; // #2c394b
  const slateGray: [number, number, number] = [100, 116, 139]; // #64748b
  const lightGray: [number, number, number] = [241, 245, 249]; // #f1f5f9

  // Helper to draw angled graphic bands
  const drawAngledBands = (yStart: number, isBottom = false) => {
    const drawPolygon = (blX: number, brX: number, yTop: number, yBottom: number, skew: number, color: [number, number, number]) => {
      doc.setFillColor(...color);
      // Triangle 1: Top-Left, Top-Right, Bottom-Right
      doc.triangle(blX + skew, yTop, brX + skew, yTop, brX, yBottom, 'F');
      // Triangle 2: Top-Left, Bottom-Right, Bottom-Left
      doc.triangle(blX + skew, yTop, brX, yBottom, blX, yBottom, 'F');
    };

    if (!isBottom) {
      // Top Banner
      doc.setFillColor(brandOrange[0], brandOrange[1], brandOrange[2]);
      doc.rect(0, 0, pageWidth, 2, 'F'); // Top bar 2mm

      const yTop = 2;
      const yBottom = 16;
      const skew = 14;

      // Dark Orange (w=65)
      drawPolygon(pageWidth - 65, pageWidth, yTop, yBottom, skew, brandOrange);
      // Light Orange 1 (w=12, right=20)
      drawPolygon(pageWidth - 32, pageWidth - 20, yTop, yBottom, skew, lightOrange);
      // Light Orange 2 (w=8, right=36)
      drawPolygon(pageWidth - 44, pageWidth - 36, yTop, yBottom, skew, lightOrange);

    } else {
      // Bottom Banner
      const yBottom = pageHeight - 1.5;
      const yTop = pageHeight - 12;
      const skew = 10.5;

      doc.setFillColor(brandOrange[0], brandOrange[1], brandOrange[2]);
      doc.rect(0, yBottom, pageWidth, 1.5, 'F'); // Bottom bar 1.5mm

      // For bottom, TR is fixed relative to right edge, BR is shifted left by skew.
      // Dark Orange: right-0 w=[105mm]
      const brX1 = pageWidth - skew;
      const blX1 = brX1 - 105;
      drawPolygon(blX1, brX1, yTop, yBottom, skew, brandOrange);

      // Light Orange 1: right-[110mm] w=[12mm]
      const trX2 = pageWidth - 110;
      const brX2 = trX2 - skew;
      const blX2 = brX2 - 12;
      drawPolygon(blX2, brX2, yTop, yBottom, skew, lightOrange);

      // Light Orange 2: right-[126mm] w=[8mm]
      const trX3 = pageWidth - 126;
      const brX3 = trX3 - skew;
      const blX3 = brX3 - 8;
      drawPolygon(blX3, brX3, yTop, yBottom, skew, lightOrange);
    }
  };

  // Top decorative graphics
  drawAngledBands(0);

  let yPos = 20;

  // -- HEADER SECTION --

  // Left: Logo
  if (logoDataUrl) {
    try {
      const img = await getImageDimensions(logoDataUrl);
      const maxLogoWidth = 65; // Scaled down again
      const maxLogoHeight = 22; // Scaled down again

      let logoWidth = maxLogoWidth;
      let logoHeight = (img.height / img.width) * maxLogoWidth;

      if (logoHeight > maxLogoHeight) {
        logoHeight = maxLogoHeight;
        logoWidth = (img.width / img.height) * maxLogoHeight;
      }

      // Move logo down slightly to sit under the 2mm top orange line
      doc.addImage(logoDataUrl, 'PNG', 12, 3.5, logoWidth, logoHeight);
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error);
    }
  }

  // Middle/Right: Company Details & Invoice Meta
  const rightColX = pageWidth - 12;

  // Company details (Top Right)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(company.companyName, rightColX, yPos + 2, { align: 'right' });

  let compY = yPos + 7;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  if (company.phone) {
    doc.text(`Business Number ${company.phone}`, rightColX, compY, { align: 'right' });
    compY += 5;
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);

  const companyLines = [
    company.address,
    company.website,
    company.email
  ].filter(Boolean) as string[];

  companyLines.forEach((line) => {
    if (line.includes('http')) {
      doc.setTextColor(59, 130, 246); // blue link
    } else {
      doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    }
    doc.text(line, rightColX, compY, { align: 'right' });
    compY += 4;
  });

  // Calculate start for Row 2 (Bill To + Meta) based on company details
  let row2Y = Math.max(34, compY) + 8; // leave robust gap between company details and meta

  // -- BILL TO SECTION (Left) --
  let billToY = row2Y;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('BILL TO', 12, billToY);

  billToY += 5;
  doc.setFontSize(10);
  doc.text(invoice.customerName, 12, billToY);

  billToY += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  if (invoice.customerEmail) {
    doc.text(invoice.customerEmail, 12, billToY);
    billToY += 4;
  }
  if (invoice.customerAddress) {
    const addressLines = doc.splitTextToSize(invoice.customerAddress, (pageWidth / 2) - 20);
    doc.text(addressLines, 12, billToY);
    billToY += addressLines.length * 4;
  }

  // Invoice Meta (Bottom Right)
  let metaY = row2Y;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);

  doc.text('Invoice Number: ', rightColX - 25, metaY, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(invoice.id, rightColX, metaY, { align: 'right' });

  metaY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
  doc.text('Date: ', rightColX - 25, metaY, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(invoice.createdAt.replace(/-/g, '.'), rightColX, metaY, { align: 'right' });

  if (invoice.dueDate) {
    metaY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);
    doc.text('Due: ', rightColX - 25, metaY, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    if (invoice.dueDate === invoice.createdAt) {
      doc.text('On Receipt', rightColX, metaY, { align: 'right' });
    } else {
      doc.text(invoice.dueDate.replace(/-/g, '.'), rightColX, metaY, { align: 'right' });
    }
  }

  const subtotal = invoice.lineItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
  const taxAmount = invoice.taxPercent ? (subtotal * invoice.taxPercent) / 100 : 0;
  const discount = invoice.discountAmount || 0;
  const shipping = invoice.shippingFee || 0;
  const grandTotal = subtotal + taxAmount - discount + shipping;
  const currency = invoice.currency || 'USD';

  if (invoice.status !== 'paid') {
    metaY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(brandOrange[0], brandOrange[1], brandOrange[2]);
    doc.text('Balance Due: ', rightColX - 25, metaY, { align: 'right' });
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(`${currency} $${grandTotal.toFixed(2)}`, rightColX, metaY, { align: 'right' });
  } else {
    metaY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94); // Green
    doc.text('Status: PAID', rightColX, metaY, { align: 'right' });
  }

  yPos = Math.max(metaY, billToY) + 12;

  // -- LINE ITEMS TABLE --
  const tableData = invoice.lineItems.map((item: { description: string; partNumber?: string; qty: number; rate: number; total: number }) => [
    item.description + (item.partNumber ? `\nPart: ${item.partNumber}` : ''),
    `$${item.rate.toFixed(2)}`,
    item.qty.toString(),
    `$${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['DESCRIPTION', 'RATE', 'QTY', 'AMOUNT']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: brandOrange,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8, // Scaled down from 9
      cellPadding: 3, // Scaled down from 4
    },
    bodyStyles: {
      fontSize: 9, // Scaled down from 10
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
      textColor: darkNavy,
      valign: 'top',
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 100 }, // Fixed width to respect block, forces break if too long but keeps structure intact
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: 12, right: 12 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || yPos + 40;
  yPos = finalY + 10; // Scaled down from 15

  // Horizontal divider
  doc.setDrawColor(241, 245, 249);
  doc.line(12, yPos, pageWidth - 12, yPos);
  yPos += 8; // Scaled down from 10

  // -- TOTALS --
  const totalsBoxX = pageWidth / 2 + 15;
  const totalsWidth = pageWidth / 2 - 27;

  doc.setFontSize(8); // Scaled down from 9
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', totalsBoxX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`$${grandTotal.toFixed(2)}`, rightColX, yPos, { align: 'right' });

  yPos += 6; // Scaled down from 8

  // Very light orange background for Balance Due row
  doc.setFillColor(veryLightOrange[0], veryLightOrange[1], veryLightOrange[2]);
  doc.rect(totalsBoxX - 5, yPos - 4, totalsWidth + 10, 8, 'F');

  doc.setFontSize(8); // Scaled down from 9
  doc.setFont('helvetica', 'bold');
  doc.text('BALANCE DUE', totalsBoxX, yPos + 1.5);
  doc.setFontSize(10); // Scaled down from 11
  if (invoice.status === 'paid') {
    doc.text(`${currency} $0.00`, rightColX, yPos + 2, { align: 'right' });
  } else {
    doc.text(`${currency} $${grandTotal.toFixed(2)}`, rightColX, yPos + 2, { align: 'right' });
  }

  yPos += 12;

  // Horizontal Divider before Payment & Terms
  doc.setDrawColor(241, 245, 249);
  doc.line(12, yPos, pageWidth - 12, yPos);
  yPos += 8;

  // -- PAYMENT INFO & TERMS (Side-by-Side) --
  const splitY = yPos;
  const leftColWidth = (pageWidth / 2) - 18;
  const rightColXStart = (pageWidth / 2) + 6;
  const rightColWidth = (pageWidth / 2) - 18;

  // Left side: Payment Info & Bank Details
  doc.setFontSize(10); // Scaled down from 12
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Payment Info', 12, yPos);

  yPos += 6; // Scaled down from 8
  if (invoice.paymentInstructions) {
    doc.setFontSize(7); // Scaled down from 8
    doc.text('PAYMENT INSTRUCTIONS', 12, yPos);
    yPos += 4; // Scaled down from 5
    doc.setFontSize(9); // Scaled down from 10
    doc.setFont('helvetica', 'normal');
    const instructionLines = doc.splitTextToSize(invoice.paymentInstructions, leftColWidth);
    doc.text(instructionLines, 12, yPos);
    yPos += instructionLines.length * 3.5; // Scaled down from 5
  }

  if (bank && bank.bankName) {
    yPos += 2; // Scaled down from 3
    doc.setFontSize(9); // Scaled down from 10
    doc.setFont('helvetica', 'normal');
    doc.text(bank.bankName, 12, yPos);
    if (bank.accountNumber) {
      yPos += 4; // Scaled down from 5
      doc.text(bank.accountNumber, 12, yPos);
    }
    if (bank.accountName) {
      yPos += 4; // Scaled down from 5
      doc.text(`Account Name : ${bank.accountName}`, 12, yPos);
    }
  }

  const paymentEndLeftY = yPos;

  // Right side: Terms
  yPos = splitY;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text('Terms & Conditions', rightColXStart, yPos);

  yPos += 6;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateGray[0], slateGray[1], slateGray[2]);

  if (terms && terms.length > 0) {
    const summary = "All purchases are subject to our standard terms and conditions. For full warranty, cancellation, and return policies, please refer to our service agreement.";
    const termLines = doc.splitTextToSize(summary, rightColWidth);
    doc.text(termLines, rightColXStart, yPos);
    yPos += termLines.length * 3.5;
  } else {
    doc.text('No additional terms provided.', rightColXStart, yPos);
    yPos += 3.5;
  }

  const termsEndRightY = yPos;
  const finalBottomY = Math.max(paymentEndLeftY, termsEndRightY);

  // Vertical Divider
  doc.setDrawColor(241, 245, 249);
  doc.line(pageWidth / 2, splitY - 2, pageWidth / 2, finalBottomY + 2);

  yPos = finalBottomY + 10;

  // Footer decorative graphics
  drawAngledBands(pageHeight - 5, true);

  return doc.output('blob');
}

/**
 * Download the PDF
 */
export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Load image as data URL for PDF embedding
 */
export function loadImageAsDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
