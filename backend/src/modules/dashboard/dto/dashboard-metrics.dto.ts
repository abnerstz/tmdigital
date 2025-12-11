import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricsDto {
  @ApiProperty()
  totalLeads: number;

  @ApiProperty()
  totalProperties: number;

  @ApiProperty()
  totalAreaHectares: number;

  @ApiProperty()
  newLeads: number;

  @ApiProperty()
  leadsInNegotiation: number;

  @ApiProperty()
  convertedLeads: number;

  @ApiProperty()
  priorityLeads: number;

  @ApiProperty()
  leadsWithoutContact: number;
}
