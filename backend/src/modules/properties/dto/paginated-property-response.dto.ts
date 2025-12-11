import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../entities/property.entity';

export class PaginatedPropertyResponseDto {
  @ApiProperty({ type: [Property] })
  data: Property[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}
