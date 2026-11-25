import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { DocumentType, EmploymentStatus, LeaveType, PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? '',
});
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  { key: 'auth:impersonate', module: 'auth', description: 'Universal Login (Impersonate any user)' },
  { key: 'roles:manage', module: 'roles', description: 'Create/edit roles and assign permissions' },
  { key: 'dashboard:view_all', module: 'dashboard', description: 'Full company KPI dashboard view' },
  { key: 'employees:manage_all', module: 'employees', description: 'Manage full employee directory' },
  { key: 'documents:vault_all', module: 'employees', description: 'Full access to KYC document vault' },
  { key: 'attendance:hardware_config', module: 'attendance', description: 'Configure facial scan hardware' },
  { key: 'attendance:site_visit_audit', module: 'attendance', description: 'Audit all GPS site visit punches' },
  { key: 'attendance:latecomer_control', module: 'attendance', description: 'Manage latecomer alerts & regularization' },
  { key: 'leave:approve_all', module: 'leave', description: 'Universal leave approval' },
  { key: 'recruitment:manage_all', module: 'recruitment', description: 'Manage job openings & ATS pipeline' },
  { key: 'recruitment:question_bank_manage', module: 'recruitment', description: 'Manage question banks & scoring' },
  { key: 'letters:release', module: 'onboarding', description: 'Release offer & relieving letters' },
  { key: 'onboarding:lms_manage', module: 'onboarding', description: 'Manage induction LMS & QR badges' },
  { key: 'payroll:salary_manage', module: 'payroll', description: 'Manage salary structures & CTC' },
  { key: 'payroll:run', module: 'payroll', description: 'Run monthly payroll & email payslips' },
  { key: 'offboarding:noc_final', module: 'offboarding', description: 'Final NOC offboarding signoff' },
  { key: 'assets:manage_all', module: 'assets', description: 'Full asset allocation & audit control' },
];

const SYSTEM_ROLES: Array<{
  name: Role;
  displayName: string;
  description: string;
  permissionKeys: string[];
}> = [
  {
    name: Role.SUPER_ADMIN,
    displayName: 'SuperAdmin / MD / CEO',
    description: 'Universal system access, impersonation, and role/permission management',
    permissionKeys: PERMISSIONS.map((p) => p.key),
  },
  {
    name: Role.HR_ADMIN,
    displayName: 'HR Admin / People Ops',
    description: 'Full HR operations, payroll, ATS, KYC vault, and attendance regularization',
    permissionKeys: PERMISSIONS.filter(
      (p) => p.key !== 'auth:impersonate' && p.key !== 'roles:manage',
    ).map((p) => p.key),
  },
  {
    name: Role.HR_COORDINATOR,
    displayName: 'HR Coordinator',
    description: 'HR coordination, leave review, recruitment scheduling & onboarding support',
    permissionKeys: [
      'attendance:site_visit_audit',
      'leave:approve_all',
      'recruitment:manage_all',
      'recruitment:question_bank_manage',
      'onboarding:lms_manage',
    ],
  },
  {
    name: Role.TEAM_LEADER,
    displayName: 'Team Leader / Supervisor',
    description: 'Direct report leave approvals, site visit verification, and team NOC signoff',
    permissionKeys: ['leave:approve_all', 'recruitment:question_bank_manage'],
  },
  {
    name: Role.EMPLOYEE,
    displayName: 'Employee / Sales Rep',
    description: 'Self-service profile, leaves, mobile site punches, LMS, and payslips',
    permissionKeys: [],
  },
];

async function main() {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { module: perm.module, description: perm.description },
      create: perm,
    });
  }

  const allPerms = await prisma.permission.findMany();
  const permByKey = new Map(allPerms.map((p) => [p.key, p.id]));

  const roleIdByName = new Map<Role, string>();

  for (const roleDef of SYSTEM_ROLES) {
    const role = await prisma.roleDefinition.upsert({
      where: { name: roleDef.name },
      update: {
        displayName: roleDef.displayName,
        description: roleDef.description,
        isSystem: true,
      },
      create: {
        name: roleDef.name,
        displayName: roleDef.displayName,
        description: roleDef.description,
        isSystem: true,
      },
    });

    roleIdByName.set(roleDef.name, role.id);

    for (const key of roleDef.permissionKeys) {
      const permissionId = permByKey.get(key);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId },
        },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }

  // Seed Departments
  const departmentDefs = [
    { name: 'Executive', description: 'Executive leadership & strategy' },
    { name: 'Human Resources', description: 'People operations, recruitment & payroll' },
    { name: 'Sales & Leasing', description: 'Real estate sales, site visits & closures' },
    { name: 'Marketing', description: 'Brand, digital marketing & lead generation' },
    { name: 'Accounts & Finance', description: 'Payroll disbursements & financial compliance' },
  ];

  const deptIdByName = new Map<string, string>();
  for (const d of departmentDefs) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: { description: d.description },
      create: d,
    });
    deptIdByName.set(dept.name, dept.id);
  }

  // Seed Teams
  const teamDefs = [
    { name: 'Executive Leadership', description: 'Company leadership' },
    { name: 'HR & People Ops', description: 'HR and talent acquisition team' },
    { name: 'Bangalore East Sales', description: 'East zone developer projects' },
    { name: 'Bangalore South Sales', description: 'South zone developer projects' },
  ];

  const teamIdByName = new Map<string, string>();
  for (const t of teamDefs) {
    const team = await prisma.team.upsert({
      where: { name: t.name },
      update: { description: t.description },
      create: t,
    });
    teamIdByName.set(team.name, team.id);
  }

  // Seed Users & Employee Profiles across all 5 RBAC roles
  const seedUsers = [
    {
      employeeId: 'EMP-001',
      email: 'superadmin@markanthony.in',
      name: 'Mark Anthony',
      phone: '+919800000001',
      password: 'SuperAdmin@123',
      role: Role.SUPER_ADMIN,
      canImpersonate: true,
      teamName: 'Executive Leadership',
      departmentName: 'Executive',
      jobTitle: 'Managing Director',
      salary: 250000,
    },
    {
      employeeId: 'EMP-002',
      email: 'hr@markanthony.in',
      name: 'Ananya Sharma',
      phone: '+919800000002',
      password: 'HrAdmin@123',
      role: Role.HR_ADMIN,
      canImpersonate: false,
      teamName: 'HR & People Ops',
      departmentName: 'Human Resources',
      jobTitle: 'HR Manager',
      salary: 95000,
    },
    {
      employeeId: 'EMP-003',
      email: 'hr.coord@markanthony.in',
      name: 'Vikram Nair',
      phone: '+919800000003',
      password: 'HrCoord@123',
      role: Role.HR_COORDINATOR,
      canImpersonate: false,
      teamName: 'HR & People Ops',
      departmentName: 'Human Resources',
      jobTitle: 'HR Coordinator',
      salary: 65000,
    },
    {
      employeeId: 'EMP-004',
      email: 'tl.dhinesh@markanthony.in',
      name: 'Dhinesh Kumar',
      phone: '+919800000004',
      password: 'TeamLead@123',
      role: Role.TEAM_LEADER,
      canImpersonate: false,
      teamName: 'Bangalore East Sales',
      departmentName: 'Sales & Leasing',
      jobTitle: 'Sales Team Leader',
      salary: 75000,
    },
    {
      employeeId: 'EMP-005',
      email: 'priya.sales@markanthony.in',
      name: 'Priya Menon',
      phone: '+919800000005',
      password: 'Employee@123',
      role: Role.EMPLOYEE,
      canImpersonate: false,
      teamName: 'Bangalore East Sales',
      departmentName: 'Sales & Leasing',
      jobTitle: 'Senior Sales Executive',
      salary: 50000,
    },
    {
      employeeId: 'EMP-006',
      email: 'arjun.sales@markanthony.in',
      name: 'Arjun Reddy',
      phone: '+919800000006',
      password: 'Employee@123',
      role: Role.EMPLOYEE,
      canImpersonate: false,
      teamName: 'Bangalore South Sales',
      departmentName: 'Sales & Leasing',
      jobTitle: 'Field Sales Representative',
      salary: 42000,
    },
    {
      employeeId: 'EMP-007',
      email: 'sneha.marketing@markanthony.in',
      name: 'Sneha Iyer',
      phone: '+919800000007',
      password: 'Employee@123',
      role: Role.EMPLOYEE,
      canImpersonate: false,
      teamName: 'HR & People Ops',
      departmentName: 'Marketing',
      jobTitle: 'Digital Marketing Specialist',
      salary: 48000,
    },
    {
      employeeId: 'EMP-008',
      email: 'rohan.finance@markanthony.in',
      name: 'Rohan Deshmukh',
      phone: '+919800000008',
      password: 'Employee@123',
      role: Role.EMPLOYEE,
      canImpersonate: false,
      teamName: 'Executive Leadership',
      departmentName: 'Accounts & Finance',
      jobTitle: 'Senior Accounts Executive',
      salary: 58000,
    },
    {
      employeeId: 'EMP-009',
      email: 'kavya.sales@markanthony.in',
      name: 'Kavya Rao',
      phone: '+919800000009',
      password: 'Employee@123',
      role: Role.EMPLOYEE,
      canImpersonate: false,
      teamName: 'Bangalore East Sales',
      departmentName: 'Sales & Leasing',
      jobTitle: 'Property Advisor',
      salary: 44000,
    },
    {
      employeeId: 'EMP-010',
      email: 'tl.karthik@markanthony.in',
      name: 'Karthik Hegde',
      phone: '+919800000010',
      password: 'TeamLead@123',
      role: Role.TEAM_LEADER,
      canImpersonate: false,
      teamName: 'Bangalore South Sales',
      departmentName: 'Sales & Leasing',
      jobTitle: 'South Zone Team Lead',
      salary: 78000,
    },
  ];

  const bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-'];
  const currentYear = 2026;

  for (let i = 0; i < seedUsers.length; i++) {
    const u = seedUsers[i];
    const passwordHash = await bcrypt.hash(u.password, 10);
    const roleId = roleIdByName.get(u.role);
    const teamId = teamIdByName.get(u.teamName);
    const departmentId = deptIdByName.get(u.departmentName);

    const user = await prisma.user.upsert({
      where: { employeeId: u.employeeId },
      update: {
        email: u.email,
        name: u.name,
        phone: u.phone,
        passwordHash,
        role: u.role,
        roleId,
        teamId,
        canImpersonate: u.canImpersonate,
        employmentStatus: EmploymentStatus.ACTIVE,
      },
      create: {
        employeeId: u.employeeId,
        email: u.email,
        name: u.name,
        phone: u.phone,
        passwordHash,
        role: u.role,
        roleId,
        teamId,
        canImpersonate: u.canImpersonate,
        employmentStatus: EmploymentStatus.ACTIVE,
        dateOfJoining: new Date('2025-01-15T00:00:00Z'),
      },
    });

    const emp = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {
        departmentId,
        jobTitle: u.jobTitle,
        salary: u.salary,
        bloodGroup: bloodGroups[i % bloodGroups.length],
        emergencyContactName: `${u.name.split(' ')[0]} Family Contact`,
        emergencyContactPhone: `+9199000000${String(i + 10).padStart(2, '0')}`,
        bankName: 'HDFC Bank',
        bankIfsc: 'HDFC0000240',
        panNumber: `ABCDE10${String(i + 10).padStart(2, '0')}F`,
        aadhaarNumber: `4567890123${String(i + 10).padStart(2, '0')}`,
      },
      create: {
        userId: user.id,
        departmentId,
        jobTitle: u.jobTitle,
        hireDate: new Date('2025-01-15T00:00:00Z'),
        salary: u.salary,
        bloodGroup: bloodGroups[i % bloodGroups.length],
        emergencyContactName: `${u.name.split(' ')[0]} Family Contact`,
        emergencyContactPhone: `+9199000000${String(i + 10).padStart(2, '0')}`,
        bankName: 'HDFC Bank',
        bankIfsc: 'HDFC0000240',
        panNumber: `ABCDE10${String(i + 10).padStart(2, '0')}F`,
        aadhaarNumber: `4567890123${String(i + 10).padStart(2, '0')}`,
      },
    });

    // Seed 2026 leave balances so Leave & Employee sections are synced
    for (const lb of [
      { leaveType: LeaveType.CASUAL, days: 12 },
      { leaveType: LeaveType.SICK, days: 8 },
      { leaveType: LeaveType.EARNED, days: 15 },
      { leaveType: LeaveType.LOP, days: 0 },
    ]) {
      await prisma.leaveBalance.upsert({
        where: {
          userId_leaveType_year: {
            userId: user.id,
            leaveType: lb.leaveType,
            year: currentYear,
          },
        },
        update: {},
        create: {
          userId: user.id,
          leaveType: lb.leaveType,
          year: currentYear,
          allocatedDays: lb.days,
          usedDays: 0,
          remainingDays: lb.days,
        },
      });
    }

    // Seed sample KYC document if none exists
    const existingDocs = await prisma.employeeDocument.count({
      where: { employeeId: emp.id },
    });
    if (existingDocs === 0) {
      await prisma.employeeDocument.create({
        data: {
          employeeId: emp.id,
          docType: DocumentType.PAN,
          fileName: `${u.employeeId}_PAN.pdf`,
          fileUrl: `https://vault.markanthony.in/kyc/${u.employeeId}/pan.pdf`,
          isVerified: i < 5,
        },
      });
    }
  }

  console.log('Seeded RBAC roles, permissions, departments, teams, and 10 employees successfully.');
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
