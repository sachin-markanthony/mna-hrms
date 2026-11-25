import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignUserRoleDto {
  @ApiProperty({ description: 'Target user UUID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'RoleDefinition UUID to assign' })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
