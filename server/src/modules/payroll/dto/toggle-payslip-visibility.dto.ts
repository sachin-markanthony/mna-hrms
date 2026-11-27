import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class TogglePayslipVisibilityDto {
  @ApiProperty({ example: true, description: 'Whether employees can view and download payslips from their portal' })
  @IsBoolean()
  visible: boolean;
}
