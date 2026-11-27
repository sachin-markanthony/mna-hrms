import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { LettersController } from './letters.controller.js';
import { LettersService } from './letters.service.js';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [LettersController],
  providers: [LettersService],
  exports: [LettersService],
})
export class LettersModule {}
