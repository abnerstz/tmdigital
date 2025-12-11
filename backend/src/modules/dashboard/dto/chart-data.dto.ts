import { ApiProperty } from '@nestjs/swagger';

export class ChartDatasetDto {
  @ApiProperty()
  label: string;

  @ApiProperty({ type: [Number] })
  data: number[];

  @ApiProperty({ type: [String], required: false })
  backgroundColor?: string[];

  @ApiProperty({ type: [String], required: false })
  borderColor?: string[];
}

export class ChartDataDto {
  @ApiProperty({ type: [String] })
  labels: string[];

  @ApiProperty({ type: [ChartDatasetDto] })
  datasets: ChartDatasetDto[];
}
