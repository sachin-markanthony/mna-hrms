import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AssetStatus, AssetType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { CreateAssetDto } from './dto/create-asset.dto.js';
import type { UpdateAssetDto } from './dto/update-asset.dto.js';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listAssets(search?: string, status?: AssetStatus) {
    const trimmed = search?.trim();
    const where: Prisma.AssetAssignmentWhereInput = {
      ...(status ? { status } : {}),
      ...(trimmed
        ? {
            OR: [
              { employeeName: { contains: trimmed, mode: 'insensitive' } },
              { employeeCode: { contains: trimmed, mode: 'insensitive' } },
              { laptopBrand: { contains: trimmed, mode: 'insensitive' } },
              { model: { contains: trimmed, mode: 'insensitive' } },
              { serialNumber: { contains: trimmed, mode: 'insensitive' } },
              { assetTag: { contains: trimmed, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.assetAssignment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyAssets(userId: string, employeeCode: string) {
    return this.prisma.assetAssignment.findMany({
      where: {
        OR: [{ userId }, { employeeCode }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(id: string) {
    const asset = await this.prisma.assetAssignment.findUnique({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset assignment record not found');
    }
    return asset;
  }

  async createAsset(dto: CreateAssetDto, actorUserId: string, meta: RequestMeta) {
    const serial = dto.serialNumber.trim();
    const existingSerial = await this.prisma.assetAssignment.findUnique({
      where: { serialNumber: serial },
      select: { id: true },
    });

    if (existingSerial) {
      throw new ConflictException(`Serial number "${serial}" is already registered.`);
    }

    let linkedUserId = dto.userId?.trim() || null;
    if (!linkedUserId) {
      const matchedUser = await this.prisma.user.findUnique({
        where: { employeeId: dto.employeeCode.trim() },
        select: { id: true },
      });
      linkedUserId = matchedUser?.id ?? null;
    }

    const count = await this.prisma.assetAssignment.count();
    const year = new Date().getUTCFullYear();
    const assetTag = `MAV/IT/AST/${year}/${String(count + 1).padStart(4, '0')}`;

    const created = await this.prisma.assetAssignment.create({
      data: {
        assetTag,
        assetType: dto.assetType ?? AssetType.LAPTOP,
        reportDate: new Date(dto.reportDate),
        userId: linkedUserId,
        employeeName: dto.employeeName.trim(),
        employeeCode: dto.employeeCode.trim(),
        department: dto.department.trim(),
        designation: dto.designation.trim(),
        contactNumber: dto.contactNumber.trim(),
        laptopBrand: dto.laptopBrand.trim(),
        model: dto.model.trim(),
        serialNumber: serial,
        chargerReceived: dto.chargerReceived,
        mouseReceived: dto.mouseReceived ?? false,
        keyboardReceived: dto.keyboardReceived ?? false,
        simCardReceived: dto.simCardReceived ?? false,
        simCardNumber: dto.simCardNumber?.trim() || null,
        collectedAt: new Date(dto.collectedAt),
        employeeSignature: dto.employeeSignature?.trim() || null,
        employeeSignedDate: dto.employeeSignedDate ? new Date(dto.employeeSignedDate) : null,
        authorizedRepresentative: dto.authorizedRepresentative?.trim() || null,
        authorizedSignedDate: dto.authorizedSignedDate
          ? new Date(dto.authorizedSignedDate)
          : null,
        status: AssetStatus.ASSIGNED,
        createdById: actorUserId,
      },
    });

    await this.auditService.log({
      actorUserId,
      targetUserId: linkedUserId ?? undefined,
      actionType: 'ASSET_ASSIGNED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        assetId: created.id,
        assetTag: created.assetTag,
        serialNumber: created.serialNumber,
        employeeCode: created.employeeCode,
      },
    });

    return created;
  }

  async updateAsset(id: string, dto: UpdateAssetDto, actorUserId: string, meta: RequestMeta) {
    const existing = await this.getOne(id);

    if (dto.serialNumber && dto.serialNumber.trim() !== existing.serialNumber) {
      const conflict = await this.prisma.assetAssignment.findUnique({
        where: { serialNumber: dto.serialNumber.trim() },
        select: { id: true },
      });
      if (conflict) {
        throw new ConflictException(`Serial number "${dto.serialNumber.trim()}" is already registered.`);
      }
    }

    const updated = await this.prisma.assetAssignment.update({
      where: { id },
      data: {
        ...(dto.assetType !== undefined ? { assetType: dto.assetType } : {}),
        ...(dto.reportDate ? { reportDate: new Date(dto.reportDate) } : {}),
        ...(dto.employeeName !== undefined ? { employeeName: dto.employeeName.trim() } : {}),
        ...(dto.employeeCode !== undefined ? { employeeCode: dto.employeeCode.trim() } : {}),
        ...(dto.department !== undefined ? { department: dto.department.trim() } : {}),
        ...(dto.designation !== undefined ? { designation: dto.designation.trim() } : {}),
        ...(dto.contactNumber !== undefined ? { contactNumber: dto.contactNumber.trim() } : {}),
        ...(dto.laptopBrand !== undefined ? { laptopBrand: dto.laptopBrand.trim() } : {}),
        ...(dto.model !== undefined ? { model: dto.model.trim() } : {}),
        ...(dto.serialNumber !== undefined ? { serialNumber: dto.serialNumber.trim() } : {}),
        ...(dto.chargerReceived !== undefined ? { chargerReceived: dto.chargerReceived } : {}),
        ...(dto.mouseReceived !== undefined ? { mouseReceived: dto.mouseReceived } : {}),
        ...(dto.keyboardReceived !== undefined ? { keyboardReceived: dto.keyboardReceived } : {}),
        ...(dto.simCardReceived !== undefined ? { simCardReceived: dto.simCardReceived } : {}),
        ...(dto.simCardNumber !== undefined
          ? { simCardNumber: dto.simCardNumber?.trim() || null }
          : {}),
        ...(dto.collectedAt ? { collectedAt: new Date(dto.collectedAt) } : {}),
        ...(dto.employeeSignature !== undefined
          ? { employeeSignature: dto.employeeSignature?.trim() || null }
          : {}),
        ...(dto.employeeSignedDate !== undefined
          ? {
              employeeSignedDate: dto.employeeSignedDate
                ? new Date(dto.employeeSignedDate)
                : null,
            }
          : {}),
        ...(dto.authorizedRepresentative !== undefined
          ? { authorizedRepresentative: dto.authorizedRepresentative?.trim() || null }
          : {}),
        ...(dto.authorizedSignedDate !== undefined
          ? {
              authorizedSignedDate: dto.authorizedSignedDate
                ? new Date(dto.authorizedSignedDate)
                : null,
            }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.returnedAt !== undefined
          ? { returnedAt: dto.returnedAt ? new Date(dto.returnedAt) : null }
          : dto.status === AssetStatus.RETURNED && !existing.returnedAt
            ? { returnedAt: new Date() }
            : {}),
        ...(dto.returnNotes !== undefined ? { returnNotes: dto.returnNotes?.trim() || null } : {}),
      },
    });

    await this.auditService.log({
      actorUserId,
      targetUserId: updated.userId ?? undefined,
      actionType: dto.status === AssetStatus.RETURNED ? 'ASSET_RETURNED' : 'ASSET_UPDATED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        assetId: updated.id,
        status: updated.status,
        serialNumber: updated.serialNumber,
      },
    });

    return updated;
  }

  async deleteAsset(id: string, actorUserId: string, meta: RequestMeta) {
    const existing = await this.getOne(id);
    await this.prisma.assetAssignment.delete({ where: { id } });

    await this.auditService.log({
      actorUserId,
      targetUserId: existing.userId ?? undefined,
      actionType: 'ASSET_DELETED',
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      newValuePayload: {
        assetId: id,
        assetTag: existing.assetTag,
        serialNumber: existing.serialNumber,
      },
    });

    return { success: true };
  }
}
