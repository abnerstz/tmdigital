import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadDto } from './dto/filter-lead.dto';
import { PaginatedLeadResponseDto } from './dto/paginated-lead-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Lead } from './entities/lead.entity';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads with filters and pagination' })
  @ApiPaginatedResponse(Lead)
  findAll(@Query() filters: FilterLeadDto): Promise<PaginatedLeadResponseDto> {
    return this.leadsService.findAll(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get general lead statistics' })
  @ApiResponse({ status: 200, description: 'Lead statistics' })
  getStats() {
    return this.leadsService.getStats();
  }

  @Get('stats/total')
  @ApiOperation({ summary: 'Get total number of leads' })
  @ApiResponse({ status: 200, description: 'Total leads count' })
  async getTotalLeads() {
    const total = await this.leadsService.getTotalCount();
    return { total };
  }

  @Get('stats/by-status')
  @ApiOperation({ summary: 'Get leads grouped by status' })
  @ApiResponse({ status: 200, description: 'Leads grouped by status' })
  getLeadsByStatus() {
    return this.leadsService.getStatsByStatus();
  }

  @Get('stats/by-city')
  @ApiOperation({ summary: 'Get leads grouped by city' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Leads grouped by city' })
  getLeadsByCity(@Query('limit') limit?: number) {
    return this.leadsService.getStatsByCity(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('priority')
  @ApiOperation({ summary: 'Get priority leads (area > 100ha)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Priority leads', type: [Lead] })
  getPriorityLeads(@Query('limit') limit?: number) {
    return this.leadsService.getPriorityLeads(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export leads to CSV/Excel' })
  @ApiQuery({ name: 'format', enum: ['csv', 'excel'] })
  @ApiResponse({ status: 200, description: 'File downloaded' })
  async exportLeads(@Query('format') format: string, @Res() res: Response) {
    const file = await this.leadsService.exportLeads(format);
    const extension = format === 'csv' ? 'csv' : 'xlsx';
    const mimeType =
      format === 'csv'
        ? 'text/csv'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=leads.${extension}`);
    return res.send(file);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent leads (last 7 days)' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Recent leads', type: [Lead] })
  getRecentLeads(@Query('days') days?: number) {
    return this.leadsService.getRecentLeads(days ? parseInt(days.toString()) : 7);
  }

  @Get('no-contact')
  @ApiOperation({ summary: 'Get leads without contact for X days' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Leads without contact', type: [Lead] })
  getLeadsWithoutContact(@Query('days') days?: number) {
    return this.leadsService.getLeadsWithoutContact(days ? parseInt(days.toString()) : 30);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Lead found', type: Lead })
  findOne(@Param('id') id: string): Promise<Lead> {
    return this.leadsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new lead' })
  @ApiBody({ type: CreateLeadDto })
  @ApiResponse({ status: 201, description: 'Lead created', type: Lead })
  create(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.leadsService.create(createLeadDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update lead' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateLeadDto })
  @ApiResponse({ status: 200, description: 'Lead updated', type: Lead })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto): Promise<Lead> {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lead (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Lead deleted' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
