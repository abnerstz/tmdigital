import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PaginatedPropertyResponseDto } from './dto/paginated-property-response.dto';
import { Property } from './entities/property.entity';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('Properties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'List properties with filters and pagination' })
  @ApiPaginatedResponse(Property)
  findAll(@Query() filters: FilterPropertyDto): Promise<PaginatedPropertyResponseDto> {
    return this.propertiesService.findAll(filters);
  }

  @Get('by-lead/:leadId')
  @ApiOperation({ summary: 'Get all properties by lead ID' })
  @ApiParam({ name: 'leadId', type: String })
  @ApiResponse({ status: 200, description: 'Properties found', type: [Property] })
  findByLeadId(@Param('leadId') leadId: string): Promise<Property[]> {
    return this.propertiesService.findByLeadId(leadId);
  }

  @Get('large')
  @ApiOperation({ summary: 'Get large properties (area >= 100ha)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Large properties', type: [Property] })
  getLargeProperties(@Query('limit') limit?: number): Promise<Property[]> {
    return this.propertiesService.getLargeProperties(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('map')
  @ApiOperation({ summary: 'Get properties with coordinates for map display' })
  @ApiResponse({ status: 200, description: 'Properties with coordinates', type: [Property] })
  getPropertiesForMap(@Query() filters: FilterPropertyDto): Promise<Property[]> {
    return this.propertiesService.getPropertiesForMap(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Property found', type: Property })
  findOne(@Param('id') id: string): Promise<Property> {
    return this.propertiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new property' })
  @ApiBody({ type: CreatePropertyDto })
  @ApiResponse({ status: 201, description: 'Property created', type: Property })
  create(@Body() createPropertyDto: CreatePropertyDto): Promise<Property> {
    return this.propertiesService.create(createPropertyDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update property' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdatePropertyDto })
  @ApiResponse({ status: 200, description: 'Property updated', type: Property })
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    return this.propertiesService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property (soft delete)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Property deleted' })
  remove(@Param('id') id: string): Promise<void> {
    return this.propertiesService.remove(id);
  }
}
