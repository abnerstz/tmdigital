import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsObject,
} from 'class-validator';
import { CropType } from '../entities/property.entity';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Fazenda Santa Rita', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  leadId: string;

  @ApiProperty({ enum: CropType, example: CropType.SOJA })
  @IsEnum(CropType)
  @IsNotEmpty()
  cropType: CropType;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  areaHectares: number;

  @ApiProperty({ example: 'Uberlândia' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: -18.918612, required: false })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: -48.277328, required: false })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  geometry?: any;

  @ApiProperty({ example: 'Property notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
