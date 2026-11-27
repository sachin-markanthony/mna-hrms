import logoImg from '../../assets/malogo.png';
import type { OfficialLetterItem, PayslipItem } from './types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatNum(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function resolveLogoDataUrl(): Promise<string> {
  if (logoImg.startsWith('data:')) return logoImg;
  try {
    const res = await fetch(logoImg);
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : logoImg);
      reader.readAsDataURL(blob);
    });
  } catch {
    return logoImg;
  }
}

/** Builds the official Mark Anthony Ventures Salary Slip HTML document. */
export function buildPayslipHtml(slip: PayslipItem, logoSrc: string = logoImg): string {
  const monthYear = `${MONTHS[slip.month - 1]} ${slip.year}`;
  const designation = slip.user.employee?.jobTitle ?? slip.user.role;
  const totalEarnings = slip.monthlyGross + slip.bonus;
  const totalDeductions = slip.professionalTax + slip.lopDeduction + slip.otherDeductions;
  const leaveDeductionDisplay =
    slip.lopDays > 0
      ? `${formatNum(slip.lopDeduction)} (${slip.lopDays}d)`
      : formatNum(slip.lopDeduction);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Salary Slip - ${escapeHtml(slip.user.employeeId)} - ${escapeHtml(monthYear)}</title>
<style>
  @page { size: 8.5in 11in; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #e8e8e8; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; }
  .page {
    position: relative; width: 8.5in; height: 11in; margin: 24px auto;
    background: #fff; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.25);
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .band-top { position: absolute; left: 0; right: 0; top: 0; height: .375in; background: #FFD584; }
  .letterhead { position: absolute; left: .85in; right: .85in; top: .375in; height: 1.2in;
    display: flex; align-items: center; padding-top: .1in; }
  .letterhead img { width: .94in; height: .94in; object-fit: contain; display: block; flex: none; }
  .lh-text { flex: 1; text-align: center; padding-right: .94in; }
  .lh-name { font-size: 25pt; line-height: 1.15; margin: 0 0 5px; font-weight: 400; }
  .lh-tag  { font-size: 10.5pt; margin: 0 0 5px; }
  .lh-sub  { font-size: 8pt; font-weight: 700; margin: 0; }
  .watermark { position: absolute; left: 2.15in; top: 3.4in; width: 4.2in; height: 4.2in;
    object-fit: contain; opacity: .16; z-index: 0; pointer-events: none; filter: sepia(1) saturate(2) hue-rotate(5deg); }
  .content { position: absolute; z-index: 1; left: .85in; right: .85in; top: 1.7in; font-size: 11pt; line-height: 1.12; }
  h1 { margin: 0 0 22pt; text-align: center; font-size: 13pt; font-weight: 700;
       text-transform: uppercase; text-decoration: underline; line-height: 1.2; }
  .band-bottom { position: absolute; left: -.1in; right: -.1in; top: 9.5in; height: 1.6in; background: #FFD584; z-index: 0; }
  .footer { position: absolute; z-index: 1; left: 0; right: 0; top: 9.7in; text-align: center; line-height: 1.38; }
  .footer .f1 { font-size: 12pt; font-weight: 700; letter-spacing: .4pt; }
  .footer .f2 { font-size: 11pt; letter-spacing: .15pt; }
  @media print {
    html, body { background: #fff; }
    .page { margin: 0; box-shadow: none; }
  }
  @media screen and (max-width: 8.8in) { .page { zoom: .6; } }
  table { border-collapse: collapse; width: 100%; table-layout: fixed; font-size: 10.5pt; line-height: 1.1; margin: 0; }
  td { border: 1px solid #000; padding: 6pt 7.5pt; vertical-align: middle; background: #fff; }
  td.lab { background: #FFD584; font-weight: 700; }
  td.hd, td.tot { background: #000; color: #FFD584; font-weight: 700; }
  td.num { text-align: right; }
  table.info { width: 100%; margin: 0 auto; }
  .spacer { height: 16pt; }
  .sig-top { margin: 14pt 0 .9in; font-weight: 700; }
  .sig-name { font-weight: 700; font-size: 11pt; margin: 0 0 4pt; }
  .sig-title { margin: 0; font-size: 10.5pt; }
</style>
</head>
<body>
<div class="page">
  <div class="band-top"></div>
  <div class="letterhead">
    <img src="${logoSrc}" alt="Mark Anthony Ventures logo">
    <div class="lh-text">
      <p class="lh-name">MARK ANTHONY</p>
      <p class="lh-tag">&quot;WE ARE THE DIFFERENCE&quot;</p>
      <p class="lh-sub">M A R K &nbsp; A N T H O N Y &nbsp; V E N T U R E S</p>
    </div>
  </div>

  <img class="watermark" src="${logoSrc}" alt="">

  <div class="content">
    <h1>Salary Slip</h1>
    <table class="info">
      <colgroup><col style="width:2in"><col></colgroup>
      <tr><td class="lab">Employee ID</td><td>${escapeHtml(slip.user.employeeId)}</td></tr>
      <tr><td class="lab">Employee Name</td><td>${escapeHtml(slip.user.name)}</td></tr>
      <tr><td class="lab">Designation</td><td>${escapeHtml(designation)}</td></tr>
      <tr><td class="lab">Branch</td><td>Bangalore</td></tr>
      <tr><td class="lab">Month &amp; Year</td><td>${escapeHtml(monthYear)}</td></tr>
    </table>
    <div class="spacer"></div>
    <table>
      <colgroup><col style="width:2.25in"><col style="width:1.15in"><col style="width:2.25in"><col style="width:1.15in"></colgroup>
      <tr><td class="hd" colspan="2">Earning</td><td class="hd" colspan="2">Deductions</td></tr>
      <tr><td>Basic Pay</td><td class="num">${formatNum(slip.monthlyGross)}</td><td>Professional Tax</td><td class="num">${formatNum(slip.professionalTax)}</td></tr>
      <tr><td>OtherAllowance</td><td class="num">${formatNum(slip.bonus)}</td><td>Leave taken</td><td class="num">${leaveDeductionDisplay}</td></tr>
      <tr><td>Conveyance Allowance</td><td class="num">-</td><td>TotalDeduction</td><td class="num">${formatNum(totalDeductions)}</td></tr>
      <tr><td class="tot">Total Earnings</td><td class="tot num">${formatNum(totalEarnings)}</td><td class="tot">Net Salary</td><td class="tot num">${formatNum(slip.netPay)}</td></tr>
    </table>
    <p class="sig-top">For M &amp; A Ventures&nbsp;</p>
    <p class="sig-name">Shilpa Kumari.P&nbsp;</p>
    <p class="sig-title">Human Resource Manager/Finance</p>
  </div>

  <div class="band-bottom"></div>
  <div class="footer">
    <div class="f1">MARK ANTHONY VENTURES</div>
    <div class="f2">5th Floor, Oxford House, Rustam Bagh Main Rd,</div>
    <div class="f2">Murugeshpalya, Bengaluru, Karnataka 560017</div>
    <div class="f2">Website&nbsp; markanthony.in</div>
  </div>
</div>
</body>
</html>`;
}

/** Triggers a one-click download of the official Mark Anthony Ventures Salary Slip. */
export async function downloadPayslipFile(slip: PayslipItem) {
  const logoDataUrl = await resolveLogoDataUrl();
  const html = buildPayslipHtml(slip, logoDataUrl);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Salary_Slip_${slip.user.employeeId}_${MONTHS[slip.month - 1]}_${slip.year}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Builds an official Mark Anthony Ventures Offer / HR Letter HTML document. */
export function buildOfficialLetterHtml(
  letter: OfficialLetterItem,
  logoSrc: string = logoImg,
): string {
  const titleLabel = letter.letterType.replace(/_/g, ' ');
  const issuedDate = new Date(letter.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const joiningStr = letter.joiningDate
    ? new Date(letter.joiningDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'To be confirmed';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(titleLabel)} - ${escapeHtml(letter.refNumber)}</title>
<style>
  @page { size: 8.5in 11in; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #e8e8e8; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; }
  .page {
    position: relative; width: 8.5in; height: 11in; margin: 24px auto;
    background: #fff; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.25);
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .band-top { position: absolute; left: 0; right: 0; top: 0; height: .375in; background: #FFD584; }
  .letterhead { position: absolute; left: .85in; right: .85in; top: .375in; height: 1.2in;
    display: flex; align-items: center; padding-top: .1in; }
  .letterhead img { width: .94in; height: .94in; object-fit: contain; display: block; flex: none; }
  .lh-text { flex: 1; text-align: center; padding-right: .94in; }
  .lh-name { font-size: 25pt; line-height: 1.15; margin: 0 0 5px; font-weight: 400; }
  .lh-tag  { font-size: 10.5pt; margin: 0 0 5px; }
  .lh-sub  { font-size: 8pt; font-weight: 700; margin: 0; }
  .watermark { position: absolute; left: 2.15in; top: 3.4in; width: 4.2in; height: 4.2in;
    object-fit: contain; opacity: .16; z-index: 0; pointer-events: none; filter: sepia(1) saturate(2) hue-rotate(5deg); }
  .content { position: absolute; z-index: 1; left: .85in; right: .85in; top: 1.7in; font-size: 10.5pt; line-height: 1.45; }
  h1 { margin: 0 0 16pt; text-align: center; font-size: 13pt; font-weight: 700;
       text-transform: uppercase; text-decoration: underline; }
  .meta-row { display: flex; justify-content: space-between; margin-bottom: 14pt; font-size: 10pt; font-weight: 700; }
  table { border-collapse: collapse; width: 100%; margin: 14pt 0; font-size: 10pt; }
  td { border: 1px solid #000; padding: 6pt 8pt; background: #fff; }
  td.lab { background: #FFD584; font-weight: 700; width: 35%; }
  .sigs { display: flex; justify-content: space-between; margin-top: 42pt; }
  .sig-name { font-weight: 700; margin: 0 0 2pt; }
  .sig-title { margin: 0; font-size: 9.5pt; }
  .band-bottom { position: absolute; left: -.1in; right: -.1in; top: 9.5in; height: 1.6in; background: #FFD584; z-index: 0; }
  .footer { position: absolute; z-index: 1; left: 0; right: 0; top: 9.7in; text-align: center; line-height: 1.38; }
  .footer .f1 { font-size: 12pt; font-weight: 700; letter-spacing: .4pt; }
  .footer .f2 { font-size: 11pt; letter-spacing: .15pt; }
  @media print { html, body { background: #fff; } .page { margin: 0; box-shadow: none; } }
  @media screen and (max-width: 8.8in) { .page { zoom: .6; } }
</style>
</head>
<body>
<div class="page">
  <div class="band-top"></div>
  <div class="letterhead">
    <img src="${logoSrc}" alt="Mark Anthony Ventures logo">
    <div class="lh-text">
      <p class="lh-name">MARK ANTHONY</p>
      <p class="lh-tag">&quot;WE ARE THE DIFFERENCE&quot;</p>
      <p class="lh-sub">M A R K &nbsp; A N T H O N Y &nbsp; V E N T U R E S</p>
    </div>
  </div>
  <img class="watermark" src="${logoSrc}" alt="">
  <div class="content">
    <h1>${escapeHtml(titleLabel)}</h1>
    <div class="meta-row">
      <span>Ref: ${escapeHtml(letter.refNumber)}</span>
      <span>Date: ${escapeHtml(issuedDate)}</span>
    </div>
    <p>Dear <strong>${escapeHtml(letter.recipientName)}</strong>,</p>
    <p>
      We are pleased to issue this <strong>${escapeHtml(titleLabel)}</strong> with Mark Anthony Ventures
      for the position of <strong>${escapeHtml(letter.designation)}</strong> in the
      <strong>${escapeHtml(letter.department)}</strong> department.
    </p>
    <table>
      <tr><td class="lab">Designation</td><td>${escapeHtml(letter.designation)}</td></tr>
      <tr><td class="lab">Department</td><td>${escapeHtml(letter.department)}</td></tr>
      <tr><td class="lab">Work Location</td><td>${escapeHtml(letter.workLocation ?? 'Bangalore, Karnataka')}</td></tr>
      <tr><td class="lab">Joining Date</td><td>${escapeHtml(joiningStr)}</td></tr>
      ${letter.monthlyGross != null ? `<tr><td class="lab">In-Hand Monthly Salary</td><td>INR ${formatNum(letter.monthlyGross)}</td></tr>` : ''}
      ${letter.annualGrossCtc != null ? `<tr><td class="lab">Annual Compensation</td><td>INR ${formatNum(letter.annualGrossCtc)}</td></tr>` : ''}
      ${letter.probationMonths != null ? `<tr><td class="lab">Probation Period</td><td>${letter.probationMonths} Month(s)</td></tr>` : ''}
    </table>
    ${letter.customNotes ? `<p>${escapeHtml(letter.customNotes)}</p>` : ''}
    <div class="sigs">
      <div>
        <p class="sig-name">${escapeHtml(letter.ceoName)}</p>
        <p class="sig-title">${escapeHtml(letter.ceoTitle)}</p>
      </div>
      <div>
        <p class="sig-name">${escapeHtml(letter.headOfHrName)}</p>
        <p class="sig-title">${escapeHtml(letter.headOfHrTitle)}</p>
      </div>
    </div>
  </div>
  <div class="band-bottom"></div>
  <div class="footer">
    <div class="f1">MARK ANTHONY VENTURES</div>
    <div class="f2">5th Floor, Oxford House, Rustam Bagh Main Rd,</div>
    <div class="f2">Murugeshpalya, Bengaluru, Karnataka 560017</div>
    <div class="f2">Website&nbsp; markanthony.in</div>
  </div>
</div>
</body>
</html>`;
}

/** Triggers a one-click download of an Official Letter HTML file. */
export async function downloadOfficialLetterFile(letter: OfficialLetterItem) {
  const logoDataUrl = await resolveLogoDataUrl();
  const html = buildOfficialLetterHtml(letter, logoDataUrl);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${letter.letterType}_${letter.refNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
