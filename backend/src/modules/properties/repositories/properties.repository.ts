import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm';
import { Property } from '../entities/property.entity';
import { FilterPropertyDto } from '../dto/filter-property.dto';

@Injectable()
export class PropertiesRepository {
  constructor(
    @InjectRepository(Property)
    private readonly repository: Repository<Property>,
  ) {}

  async create(propertyData: Partial<Property>): Promise<Property> {
    const property = this.repository.create(propertyData);
    return this.repository.save(property);
  }

  async findAll(): Promise<Property[]> {
    return this.repository.find({ relations: ['lead'] });
  }

  async findById(id: string): Promise<Property | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['lead'],
    });
  }

  async findByLeadId(leadId: string): Promise<Property[]> {
    return this.repository.find({
      where: { leadId, deletedAt: IsNull() },
      relations: ['lead'],
    });
  }

  async update(property: Property): Promise<Property> {
    return this.repository.save(property);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async getTotalArea(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('p')
      .select('SUM(p."areaHectares")', 'total')
      .getRawOne();

    return parseFloat(result?.total || 0);
  }

  async findWithFilters(filters: FilterPropertyDto): Promise<[Property[], number]> {
    const queryBuilder = this.buildFilterQuery(filters);

    const { page = 0, pageSize = 10 } = filters;
    const skip = page * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    return queryBuilder.getManyAndCount();
  }

  async findLargeProperties(minArea: number = 100, limit: number = 10): Promise<Property[]> {
    return this.repository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.lead', 'lead')
      .where('property."areaHectares" >= :minArea', { minArea })
      .orderBy('property."areaHectares"', 'DESC')
      .limit(limit)
      .getMany();
  }

  async findPropertiesWithCoordinates(filters: FilterPropertyDto): Promise<Property[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.lead', 'lead')
      .where('property.latitude IS NOT NULL')
      .andWhere('property.longitude IS NOT NULL');

    if (filters.cropType && filters.cropType.length > 0) {
      queryBuilder.andWhere('property."cropType" IN (:...cropType)', {
        cropType: filters.cropType,
      });
    }

    if (filters.city && filters.city.length > 0) {
      queryBuilder.andWhere('property.city IN (:...city)', { city: filters.city });
    }

    return queryBuilder.getMany();
  }

  async getStatsByCropType(): Promise<Array<{ cropType: string; totalArea: string }>> {
    return this.repository
      .createQueryBuilder('property')
      .select('property."cropType"', 'cropType')
      .addSelect('SUM(property."areaHectares")', 'totalArea')
      .groupBy('property."cropType"')
      .orderBy('"totalArea"', 'DESC')
      .getRawMany();
  }

  private buildFilterQuery(filters: FilterPropertyDto): SelectQueryBuilder<Property> {
    const {
      leadId,
      searchTerm,
      cropType,
      areaMin,
      areaMax,
      city,
      sortField = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const queryBuilder = this.repository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.lead', 'lead');

    if (leadId) {
      queryBuilder.andWhere('property."leadId" = :leadId', { leadId });
    }

    if (searchTerm) {
      queryBuilder.andWhere(
        '(LOWER(property.name) LIKE LOWER(:searchTerm) OR LOWER(property.city) LIKE LOWER(:searchTerm))',
        { searchTerm: `%${searchTerm}%` },
      );
    }

    if (cropType && cropType.length > 0) {
      queryBuilder.andWhere('property."cropType" IN (:...cropType)', { cropType });
    }

    if (city && city.length > 0) {
      queryBuilder.andWhere('property.city IN (:...city)', { city });
    }

    if (areaMin) {
      queryBuilder.andWhere('property."areaHectares" >= :areaMin', { areaMin });
    }

    if (areaMax) {
      queryBuilder.andWhere('property."areaHectares" <= :areaMax', { areaMax });
    }

    queryBuilder.orderBy(`property.${sortField}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    return queryBuilder;
  }
}
