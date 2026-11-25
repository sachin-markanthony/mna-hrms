import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class SyncRolePermissionsDto {
  @ApiProperty({
    type: [String],
    description: 'Complete list of permission UUIDs to assign to this role',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
