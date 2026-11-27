import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportElementToPdfBase64(
  elementId = 'printable-letterhead',
): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element #${elementId} not found for PDF export.`);
  }

  // Render element onto canvas at 2x resolution for print clarity
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

  // Return pure base64 string (strip data:application/pdf;filename=...;base64, prefix)
  const dataUri = pdf.output('datauristring');
  const commaIdx = dataUri.indexOf(',');
  return commaIdx !== -1 ? dataUri.slice(commaIdx + 1) : dataUri;
}

export async function downloadElementAsPdf(
  elementId = 'printable-letterhead',
  filename = 'Offer_Letter.pdf',
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  pdf.save(filename);
}
