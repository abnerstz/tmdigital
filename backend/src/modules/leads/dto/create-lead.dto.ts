import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { LeadStatus } from '../entities/lead.entity';
import { IsValidCPF } from '../../../common/validators/cpf.validator';

export class CreateLeadDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '12345678901' })
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'CPF must contain 11 digits' })
  @IsValidCPF({ message: 'CPF must be a valid Brazilian CPF' })
  cpf: string;

  @ApiProperty({ example: 'joao@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '31987654321', required: false })
  @Transform(({ value }) => (value && typeof value === 'string' ? value.replace(/\D/g, '') : value))
  @IsString()
  @IsOptional()
  @Matches(/^\d{10,11}$/, { message: 'Invalid phone number' })
  phone?: string;

  @ApiProperty({ example: 'Uberlândia' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ enum: LeadStatus, example: LeadStatus.NEW, required: false })
  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsDateString()
  @IsOptional()
  firstContactDate?: string;

  @ApiProperty({ example: 'Initial comments about the lead', required: false })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({ example: ['priority', 'large-farm'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
