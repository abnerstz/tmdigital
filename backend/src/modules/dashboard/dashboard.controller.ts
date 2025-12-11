import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';
import { ChartDataDto } from './dto/chart-data.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Lead } from '../leads/entities/lead.entity';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get general dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics', type: DashboardMetricsDto })
  getMetrics(): Promise<DashboardMetricsDto> {
    return this.dashboardService.getMetrics();
  }

  @Get('leads-by-status')
  @ApiOperation({ summary: 'Get leads distribution by status for chart' })
  @ApiResponse({ status: 200, description: 'Chart data', type: ChartDataDto })
  getLeadsByStatus(): Promise<ChartDataDto> {
    return this.dashboardService.getLeadsByStatus();
  }

  @Get('leads-by-city')
  @ApiOperation({ summary: 'Get top cities by lead count for chart' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Chart data', type: ChartDataDto })
  getLeadsByCity(@Query('limit') limit?: number): Promise<ChartDataDto> {
    return this.dashboardService.getLeadsByCity(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('area-by-crop-type')
  @ApiOperation({ summary: 'Get total area by crop type for chart' })
  @ApiResponse({ status: 200, description: 'Chart data', type: ChartDataDto })
  getAreaByCropType(): Promise<ChartDataDto> {
    return this.dashboardService.getAreaByCropType();
  }

  @Get('priority-leads')
  @ApiOperation({ summary: 'Get priority leads (area > 100ha)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Priority leads', type: [Lead] })
  getPriorityLeads(@Query('limit') limit?: number): Promise<Lead[]> {
    return this.dashboardService.getPriorityLeads(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('recent-leads')
  @ApiOperation({ summary: 'Get recent leads (last 7 days)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent leads', type: [Lead] })
  getRecentLeads(@Query('days') days?: number): Promise<Lead[]> {
    return this.dashboardService.getRecentLeads(days ? parseInt(days.toString()) : 7);
  }

  @Get('leads-no-contact')
  @ApiOperation({ summary: 'Get leads without contact for X days' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Leads without contact', type: [Lead] })
  getLeadsWithoutContact(@Query('days') days?: number): Promise<Lead[]> {
    return this.dashboardService.getLeadsWithoutContact(days ? parseInt(days.toString()) : 30);
  }
}
