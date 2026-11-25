import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.PAN })
  @IsEnum(DocumentType)
  docType: DocumentType;

  @ApiProperty({ example: 'pan_card.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'https://s3.ap-south-1.amazonaws.com/mna-hrms-vault/emp-005/pan.pdf' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}
