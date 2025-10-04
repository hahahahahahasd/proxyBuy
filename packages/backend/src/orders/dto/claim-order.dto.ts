import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNotEmpty, IsNumber, IsString } from 'class-validator';

class AssigneeDto {
  @ApiProperty({ example: 1, description: 'The ID of the assignee.' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'admin', description: 'The name of the assignee.' })
  @IsString()
  name: string;
}

export class ClaimOrderDto {
  @ApiProperty({
    description: 'The user who is claiming the order.',
    type: AssigneeDto,
  })
  @IsObject()
  @IsNotEmpty()
  assignee: AssigneeDto;
}
