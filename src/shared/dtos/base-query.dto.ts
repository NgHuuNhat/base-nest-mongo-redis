// src/shared/dtos/base-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class BaseQueryDto {
  @ApiProperty({ required: false, example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number) // Ép kiểu string từ query params sang number
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Tìm kiếm theo từ khóa' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, example: 'createdAt:desc', description: 'desc | asc' })
  @IsOptional()
  @IsString()
  sort?: string;
}
