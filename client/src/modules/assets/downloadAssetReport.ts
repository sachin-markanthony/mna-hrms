import type { AssetAssignment } from './types';

function formatDateOnly(iso?: string | null) {
  if (!iso) return '________________';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '________________';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso?: string | null) {
  if (!iso) return '________________';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '________________';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function esc(value?: string | null) {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Builds the official MARK ANTHONY & VENTURES Laptop Collection Report HTML matching the physical form. */
export function buildAssetReportHtml(asset: AssetAssignment): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Laptop Collection Report - ${esc(asset.employeeCode)} - ${esc(asset.assetTag)}</title>
<style>
  @page { size: A4; margin: 0.7in 0.85in; }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111827;
    background: #e5e7eb;
    margin: 0;
    padding: 24px 0;
  }
  .page {
    width: 8.27in;
    min-height: 11.2in;
    margin: 0 auto;
    background: #fff;
    padding: 0.8in 0.9in;
    box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  }
  .header {
    text-align: center;
    font-size: 16pt;
    letter-spacing: 0.8px;
    font-weight: 500;
    margin: 0 0 28px;
    text-transform: uppercase;
  }
  .tag-line {
    text-align: right;
    font-size: 9pt;
    color: #4b5563;
    margin: -18px 0 18px;
  }
  .section-title {
    font-size: 11pt;
    font-weight: 700;
    margin: 0 0 14px;
  }
  .field-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 10px;
    font-size: 10.5pt;
  }
  .field-label {
    font-weight: 500;
    white-space: nowrap;
    margin-right: 8px;
  }
  .field-value {
    flex: 1;
    max-width: 340px;
    border-bottom: 1px solid #374151;
    padding: 0 6px 2px;
    font-weight: 600;
  }
  .desc-block {
    margin-top: 22px;
    font-size: 10.5pt;
    line-height: 1.55;
    text-align: justify;
  }
  .sig-section {
    margin-top: 48px;
    font-size: 10.5pt;
  }
  .sig-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 22px;
  }
  .sig-left { flex: 1.5; display: flex; align-items: baseline; }
  .sig-right { flex: 1; display: flex; align-items: baseline; }
  .sig-line {
    flex: 1;
    border-bottom: 1px solid #374151;
    padding: 0 6px 2px;
    margin-left: 8px;
    font-weight: 600;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .page { box-shadow: none; margin: 0; width: 100%; min-height: auto; }
  }
</style>
</head>
<body>
  <div class="page">
    <h1 class="header">MARK ANTHONY &amp; VENTURES</h1>
    <div class="tag-line">Asset Ref: ${esc(asset.assetTag)} &bull; Status: ${esc(asset.status)}</div>

    <div class="section-title">${esc(asset.assetType.replace(/_/g, ' '))} Collection Report:</div>

    <div class="field-row"><span class="field-label">Report Date:</span><span class="field-value">${esc(formatDateOnly(asset.reportDate))}</span></div>
    <div class="field-row"><span class="field-label">Asset Type:</span><span class="field-value">${esc(asset.assetType.replace(/_/g, ' '))}</span></div>
    <div class="field-row"><span class="field-label">Employee Name:</span><span class="field-value">${esc(asset.employeeName)}</span></div>
    <div class="field-row"><span class="field-label">Employee ID:</span><span class="field-value">${esc(asset.employeeCode)}</span></div>
    <div class="field-row"><span class="field-label">Department:</span><span class="field-value">${esc(asset.department)}</span></div>
    <div class="field-row"><span class="field-label">Designation:</span><span class="field-value">${esc(asset.designation)}</span></div>
    <div class="field-row"><span class="field-label">Contact Number:</span><span class="field-value">${esc(asset.contactNumber)}</span></div>
    <div class="field-row"><span class="field-label">Brand / Carrier:</span><span class="field-value">${esc(asset.laptopBrand)}</span></div>
    <div class="field-row"><span class="field-label">Model:</span><span class="field-value">${esc(asset.model)}</span></div>
    <div class="field-row"><span class="field-label">Serial Number:</span><span class="field-value">${esc(asset.serialNumber)}</span></div>
    <div class="field-row"><span class="field-label">Charger Received:</span><span class="field-value">${asset.chargerReceived ? 'Yes' : 'No'}</span></div>
    <div class="field-row"><span class="field-label">Mouse Received:</span><span class="field-value">${asset.mouseReceived ? 'Yes' : 'No'}</span></div>
    <div class="field-row"><span class="field-label">Keyboard Received:</span><span class="field-value">${asset.keyboardReceived ? 'Yes' : 'No'}</span></div>
    <div class="field-row"><span class="field-label">SIM Card Received:</span><span class="field-value">${asset.simCardReceived ? `Yes${asset.simCardNumber ? ` (${esc(asset.simCardNumber)})` : ''}` : 'No'}</span></div>
    <div class="field-row"><span class="field-label">Date &amp; Time of Collection:</span><span class="field-value">${esc(formatDateTime(asset.collectedAt))}</span></div>

    <div class="desc-block">
      <div class="section-title">Company Laptop Description</div>
      <p>
        Received a company-issued laptop from the HR department for official business purposes.
        Verified the laptop's condition, asset details, and all accompanying accessories, including
        the charger and any assigned peripherals, at the time of handover. Acknowledged
        responsibility for the safe handling, proper maintenance, and secure use of the device in
        accordance with the company's IT, information security, and asset management policies.
        Committed to using the laptop solely for authorized work-related activities and to promptly
        reporting any loss, damage, or technical issues. The laptop will be returned to the company
        in good condition upon request or at the end of employment.
      </p>
    </div>

    <div class="sig-section">
      <div class="sig-row">
        <div class="sig-left"><span>Employee Signature:</span><span class="sig-line">${esc(asset.employeeSignature ?? '')}</span></div>
        <div class="sig-right"><span>Date:</span><span class="sig-line">${esc(asset.employeeSignedDate ? formatDateOnly(asset.employeeSignedDate) : '')}</span></div>
      </div>
      <div class="sig-row">
        <div class="sig-left"><span>Authorized Representative:</span><span class="sig-line">${esc(asset.authorizedRepresentative ?? '')}</span></div>
        <div class="sig-right"><span>Date:</span><span class="sig-line">${esc(asset.authorizedSignedDate ? formatDateOnly(asset.authorizedSignedDate) : '')}</span></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function downloadAssetReportFile(asset: AssetAssignment) {
  const html = buildAssetReportHtml(asset);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Laptop_Collection_Report_${asset.employeeCode}_${asset.serialNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
