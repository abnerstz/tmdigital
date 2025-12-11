import { ApiProperty } from '@nestjs/swagger';
import { Lead } from '../entities/lead.entity';

export class PaginatedLeadResponseDto {
  @ApiProperty({ type: [Lead] })
  data: Lead[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}
