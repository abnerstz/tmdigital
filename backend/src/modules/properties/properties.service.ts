import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PropertiesRepository } from './repositories/properties.repository';
import { LeadsRepository } from '../leads/repositories/leads.repository';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { PaginatedPropertyResponseDto } from './dto/paginated-property-response.dto';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly propertiesRepository: PropertiesRepository,
    private readonly leadsRepository: LeadsRepository,
  ) {}

  async findAll(filters: FilterPropertyDto): Promise<PaginatedPropertyResponseDto> {
    const [data, total] = await this.propertiesRepository.findWithFilters(filters);

    const { page = 0, pageSize = 10 } = filters;

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findById(id);

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async findByLeadId(leadId: string): Promise<Property[]> {
    return this.propertiesRepository.findByLeadId(leadId);
  }

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const lead = await this.leadsRepository.findById(createPropertyDto.leadId);

    if (!lead) {
      throw new BadRequestException(`Lead with ID ${createPropertyDto.leadId} not found`);
    }

    return this.propertiesRepository.create(createPropertyDto);
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    Object.assign(property, updatePropertyDto);
    return this.propertiesRepository.update(property);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.propertiesRepository.softDelete(id);
  }

  async getLargeProperties(limit: number = 10): Promise<Property[]> {
    return this.propertiesRepository.findLargeProperties(100, limit);
  }

  async getPropertiesForMap(filters: FilterPropertyDto): Promise<Property[]> {
    return this.propertiesRepository.findPropertiesWithCoordinates(filters);
  }
}
