import * as XLSX from 'xlsx';
import type { PayrollRunDetail } from './types';

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

/** Exports the selected monthly payroll run as an Excel (.xlsx) workbook. */
export function exportPayrollRunToExcel(run: PayrollRunDetail) {
  const monthName = MONTHS[run.month - 1] ?? String(run.month);
  const monthLabel = `${monthName} ${run.year}`;

  const rows = run.payslips.map((slip) => {
    const totalEarnings = slip.monthlyGross + slip.bonus;
    const totalDeductions = slip.lopDeduction + slip.professionalTax + slip.otherDeductions;
    return {
      'Employee ID': slip.user.employeeId,
      'Employee Name': slip.user.name,
      Email: slip.user.email,
      Department: slip.user.employee?.department?.name ?? 'General',
      Designation: slip.user.employee?.jobTitle ?? slip.user.role,
      'Month & Year': monthLabel,
      Status: run.status,
      'Working Days': slip.workingDaysInMonth,
      'Present Days': slip.presentDays,
      'Half Days': slip.halfDays,
      'LOP Days': slip.lopDays,
      'In-Hand Salary (INR)': slip.monthlyGross,
      'Bonus (INR)': slip.bonus,
      'Total Earnings (INR)': totalEarnings,
      'LOP Deduction (INR)': slip.lopDeduction,
      'Professional Tax (INR)': slip.professionalTax,
      'Other Deductions (INR)': slip.otherDeductions,
      'Total Deductions (INR)': totalDeductions,
      'Net Pay (INR)': slip.netPay,
      'Bank Name': slip.user.employee?.bankName ?? '',
      'Account Number': slip.user.employee?.bankAccountNumber ?? '',
      IFSC: slip.user.employee?.bankIfsc ?? '',
      PAN: slip.user.employee?.panNumber ?? '',
      UAN: slip.user.employee?.uanNumber ?? '',
      Remarks: slip.remarks ?? '',
    };
  });

  // Totals summary row
  const totals = run.payslips.reduce(
    (acc, slip) => {
      acc.gross += slip.monthlyGross;
      acc.bonus += slip.bonus;
      acc.earnings += slip.monthlyGross + slip.bonus;
      acc.lop += slip.lopDeduction;
      acc.pt += slip.professionalTax;
      acc.other += slip.otherDeductions;
      acc.deductions += slip.lopDeduction + slip.professionalTax + slip.otherDeductions;
      acc.net += slip.netPay;
      return acc;
    },
    { gross: 0, bonus: 0, earnings: 0, lop: 0, pt: 0, other: 0, deductions: 0, net: 0 },
  );

  rows.push({
    'Employee ID': 'TOTAL',
    'Employee Name': `${run.payslips.length} Employees`,
    Email: '',
    Department: '',
    Designation: '',
    'Month & Year': monthLabel,
    Status: run.status,
    'Working Days': run.payslips[0]?.workingDaysInMonth ?? 0,
    'Present Days': 0,
    'Half Days': 0,
    'LOP Days': run.payslips.reduce((s, p) => s + p.lopDays, 0),
    'In-Hand Salary (INR)': totals.gross,
    'Bonus (INR)': totals.bonus,
    'Total Earnings (INR)': totals.earnings,
    'LOP Deduction (INR)': totals.lop,
    'Professional Tax (INR)': totals.pt,
    'Other Deductions (INR)': totals.other,
    'Total Deductions (INR)': totals.deductions,
    'Net Pay (INR)': totals.net,
    'Bank Name': '',
    'Account Number': '',
    IFSC: '',
    PAN: '',
    UAN: '',
    Remarks: '',
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 22 },
    { wch: 28 },
    { wch: 18 },
    { wch: 22 },
    { wch: 16 },
    { wch: 10 },
    { wch: 13 },
    { wch: 13 },
    { wch: 11 },
    { wch: 10 },
    { wch: 20 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 26 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${monthName} ${run.year}`);
  XLSX.writeFile(workbook, `Payroll_${monthName}_${run.year}_${run.status}.xlsx`);
}
