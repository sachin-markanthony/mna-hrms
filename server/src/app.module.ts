import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { EmployeesModule } from './modules/employees/employees.module.js';
import { AttendanceModule } from './modules/attendance/attendance.module.js';
import { LeaveModule } from './modules/leave/leave.module.js';
import { RecruitmentModule } from './modules/recruitment/recruitment.module.js';
import { OnboardingModule } from './modules/onboarding/onboarding.module.js';
import { OffboardingModule } from './modules/offboarding/offboarding.module.js';
import { PerformanceModule } from './modules/performance/performance.module.js';
import { PayrollModule } from './modules/payroll/payroll.module.js';
import { AssetsModule } from './modules/assets/assets.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AuditModule,
    DashboardModule,
    EmployeesModule,
    AttendanceModule,
    LeaveModule,
    RecruitmentModule,
    OnboardingModule,
    OffboardingModule,
    PerformanceModule,
    PayrollModule,
    AssetsModule,
    NotificationsModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'server',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
