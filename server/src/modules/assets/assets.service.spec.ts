import { ConflictException } from '@nestjs/common';
import { AssetStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../prisma/prisma.service.js';
import type { AuditService } from '../audit/audit.service.js';
import { AssetsService } from './assets.service.js';

describe('AssetsService', () => {
  let service: AssetsService;
  let prisma: {
    assetAssignment: {
      findUnique: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    user: { findUnique: ReturnType<typeof vi.fn> };
  };
  let auditService: { log: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = {
      assetAssignment: {
        findUnique: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: { findUnique: vi.fn().mockResolvedValue({ id: 'u-5' }) },
    };
    auditService = { log: vi.fn().mockResolvedValue({}) };

    service = new AssetsService(
      prisma as unknown as PrismaService,
      auditService as unknown as AuditService,
    );
  });

  it('creates a laptop collection record and logs ASSET_ASSIGNED', async () => {
    prisma.assetAssignment.findUnique.mockResolvedValue(null);
    prisma.assetAssignment.create.mockResolvedValue({
      id: 'ast-1',
      assetTag: 'MAV/IT/AST/2026/0001',
      serialNumber: 'DL-9988',
      employeeCode: 'EMP-005',
      status: AssetStatus.ASSIGNED,
    });

    const created = await service.createAsset(
      {
        reportDate: '2026-11-28',
        employeeName: 'Priya Menon',
        employeeCode: 'EMP-005',
        department: 'Sales & Leasing',
        designation: 'Senior Sales Executive',
        contactNumber: '9876543210',
        laptopBrand: 'Dell',
        model: 'Latitude 5430',
        serialNumber: 'DL-9988',
        chargerReceived: true,
        collectedAt: '2026-11-28T10:00:00Z',
      },
      'hr-1',
      {},
    );

    expect(created.assetTag).toBe('MAV/IT/AST/2026/0001');
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ actionType: 'ASSET_ASSIGNED' }),
    );
  });

  it('rejects duplicate laptop serial number with ConflictException', async () => {
    prisma.assetAssignment.findUnique.mockResolvedValue({ id: 'existing' });

    await expect(
      service.createAsset(
        {
          reportDate: '2026-11-28',
          employeeName: 'Priya Menon',
          employeeCode: 'EMP-005',
          department: 'Sales',
          designation: 'Executive',
          contactNumber: '9876543210',
          laptopBrand: 'Dell',
          model: 'Latitude 5430',
          serialNumber: 'DUP-123',
          chargerReceived: true,
          collectedAt: '2026-11-28T10:00:00Z',
        },
        'hr-1',
        {},
      ),
    ).rejects.toThrow(ConflictException);
  });
});
