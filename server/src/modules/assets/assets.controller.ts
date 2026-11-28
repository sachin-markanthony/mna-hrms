import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AssetStatus } from '@prisma/client';
import type { Request } from 'express';
import { CurrentUser } from '../../core/decorators/current-user.decorator.js';
import { RequirePermissions } from '../../core/decorators/permissions.decorator.js';
import type { RequestMeta } from '../auth/auth.service.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { AssetsService } from './assets.service.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';

@ApiTags('Asset Management')
@ApiBearerAuth('JWT-auth')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get('my')
  @ApiOperation({ summary: 'List assets assigned to the currently logged-in employee' })
  getMyAssets(@CurrentUser() user: AuthenticatedUser) {
    return this.assetsService.getMyAssets(user.id, user.employeeId);
  }

  @RequirePermissions('assets:manage_all')
  @Get()
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AssetStatus })
  @ApiOperation({ summary: 'List all company asset collection reports' })
  listAssets(
    @Query('search') search?: string,
    @Query('status') status?: AssetStatus,
  ) {
    return this.assetsService.listAssets(search, status);
  }

  @RequirePermissions('assets:manage_all')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single asset collection report by ID' })
  getOne(@Param('id') id: string) {
    return this.assetsService.getOne(id);
  }

  @RequirePermissions('assets:manage_all')
  @Post()
  @ApiOperation({ summary: 'Record a new Laptop Collection Report & asset assignment' })
  createAsset(
    @Body() dto: CreateAssetDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.assetsService.createAsset(dto, actor.id, this.extractMeta(req));
  }

  @RequirePermissions('assets:manage_all')
  @Patch(':id')
  @ApiOperation({ summary: 'Update asset details or mark returned/damaged/lost' })
  updateAsset(
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.assetsService.updateAsset(id, dto, actor.id, this.extractMeta(req));
  }

  @RequirePermissions('assets:manage_all')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an asset assignment record' })
  deleteAsset(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.assetsService.deleteAsset(id, actor.id, this.extractMeta(req));
  }

  private extractMeta(req: Request): RequestMeta {
    return {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };
  }
}
