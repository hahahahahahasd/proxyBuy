import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SyncQrCodeDto {
  @ApiProperty({
    example: '1234',
    description: 'The claim code for the order.',
  })
  @IsString()
  @IsNotEmpty()
  claimCode: string;

  @ApiProperty({
    example: 'aNiDoZCFAAg=',
    description: 'The base64 encoded QR code data.',
  })
  @IsString()
  @IsNotEmpty()
  qrCodeData: string;
}
