import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, IsNull } from 'typeorm';
import { Lead, LeadStatus } from '../entities/lead.entity';
import { Property } from '../../properties/entities/property.entity';
import { FilterLeadDto } from '../dto/filter-lead.dto';

@Injectable()
export class LeadsRepository {
  constructor(
    @InjectRepository(Lead)
    private readonly repository: Repository<Lead>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async create(leadData: Partial<Lead>): Promise<Lead> {
    const lead = this.repository.create(leadData);
    return this.repository.save(lead);
  }

  async findAll(): Promise<Lead[]> {
    return this.repository.find({ relations: ['properties'] });
  }

  async findById(id: string): Promise<Lead | null> {
    return this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['properties'],
    });
  }

  async findByCpf(cpf: string): Promise<Lead | null> {
    return this.repository.findOne({ where: { cpf } });
  }

  async update(lead: Lead): Promise<Lead> {
    return this.repository.save(lead);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async countByStatus(status: LeadStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  async findWithFilters(filters: FilterLeadDto): Promise<[Lead[], number]> {
    const queryBuilder = this.buildFilterQuery(filters);

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    const { page = 0, pageSize = 10 } = filters;
    const skip = page * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    // Map raw results to include totalAreaHectares
    const leadsWithArea = entities.map((lead: Lead, index: number) => ({
      ...lead,
      totalAreaHectares: parseFloat(raw[index]?.totalAreaHectares || '0'),
    }));

    return [leadsWithArea, total];
  }

  async getStatsByStatus(): Promise<Array<{ status: string; count: string }>> {
    return this.repository
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .getRawMany();
  }

  async getStatsByCity(limit: number = 10): Promise<Array<{ city: string; count: string }>> {
    return this.repository
      .createQueryBuilder('lead')
      .select('lead.city', 'city')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.city')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async findPriorityLeads(minArea: number = 100, limit: number = 10): Promise<Lead[]> {
    const leads = await this.repository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.properties', 'properties')
      .leftJoin(
        qb =>
          qb
            .select('p."leadId"', 'leadId')
            .addSelect('SUM(p."areaHectares")', 'totalArea')
            .from(Property, 'p')
            .groupBy('p."leadId"'),
        'prop_sum',
        'prop_sum."leadId" = lead.id',
      )
      .addSelect('prop_sum."totalArea"', 'lead_totalAreaHectares')
      .where('prop_sum."totalArea" >= :minArea', { minArea })
      .orderBy('prop_sum."totalArea"', 'DESC')
      .limit(limit)
      .getRawAndEntities();

    return leads.entities.map((lead, index) => ({
      ...lead,
      totalAreaHectares: parseFloat(leads.raw[index].lead_totalAreaHectares || 0),
    }));
  }

  async findRecentLeads(days: number = 7): Promise<Lead[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const leads = await this.repository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.properties', 'properties')
      .where('lead.createdAt >= :dateThreshold', { dateThreshold })
      .orderBy('lead.createdAt', 'DESC')
      .getMany();

    return leads.map(lead => ({
      ...lead,
      totalAreaHectares:
        lead.properties?.reduce((sum, prop) => sum + Number(prop.areaHectares), 0) || 0,
    }));
  }

  async findLeadsWithoutContact(days: number = 30): Promise<Lead[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const leads = await this.repository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.properties', 'properties')
      .where('lead.lastInteraction < :dateThreshold OR lead.lastInteraction IS NULL', {
        dateThreshold,
      })
      .orderBy('lead.lastInteraction', 'ASC')
      .getMany();

    return leads.map(lead => ({
      ...lead,
      totalAreaHectares:
        lead.properties?.reduce((sum, prop) => sum + Number(prop.areaHectares), 0) || 0,
    }));
  }

  async getTotalAreaByLead(leadId: string): Promise<number> {
    const result = await this.propertyRepository
      .createQueryBuilder('p')
      .select('SUM(p."areaHectares")', 'total')
      .where('p."leadId" = :leadId', { leadId })
      .getRawOne();

    return parseFloat(result?.total || 0);
  }

  private buildFilterQuery(filters: FilterLeadDto): SelectQueryBuilder<Lead> {
    const {
      searchTerm,
      status,
      city,
      areaMin,
      areaMax,
      cropType,
      sortField = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const queryBuilder = this.repository
      .createQueryBuilder('lead')
      .leftJoinAndSelect('lead.properties', 'properties')
      .leftJoin(
        qb =>
          qb
            .select('p."leadId"', 'leadId')
            .addSelect('SUM(p."areaHectares")', 'totalArea')
            .from(Property, 'p')
            .where('p."deletedAt" IS NULL')
            .groupBy('p."leadId"'),
        'area_sum',
        'area_sum."leadId" = lead.id',
      )
      .addSelect('COALESCE(area_sum."totalArea", 0)', 'totalAreaHectares')
      .where('lead."deletedAt" IS NULL');

    if (searchTerm) {
      queryBuilder.andWhere(
        '(lead.name ILIKE :search OR lead.cpf LIKE :search OR lead.email ILIKE :search)',
        { search: `%${searchTerm}%` },
      );
    }

    if (status && status.length > 0) {
      queryBuilder.andWhere('lead.status IN (:...status)', { status });
    }

    if (city && city.length > 0) {
      queryBuilder.andWhere('lead.city IN (:...city)', { city });
    }

    if (cropType) {
      queryBuilder.andWhere('properties."cropType" = :cropType', { cropType });
    }

    if (areaMin || areaMax) {
      queryBuilder.andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .select('SUM(p."areaHectares")')
          .from(Property, 'p')
          .where('p."leadId" = lead.id')
          .getQuery();

        if (areaMin && areaMax) {
          return `(${subQuery}) BETWEEN :areaMin AND :areaMax`;
        } else if (areaMin) {
          return `(${subQuery}) >= :areaMin`;
        } else {
          return `(${subQuery}) <= :areaMax`;
        }
      });

      if (areaMin) queryBuilder.setParameter('areaMin', areaMin);
      if (areaMax) queryBuilder.setParameter('areaMax', areaMax);
    }

    const allowedSortFields: Record<string, string> = {
      name: 'lead.name',
      status: 'lead.status',
      city: 'lead.city',
      createdAt: 'lead.createdAt',
      updatedAt: 'lead.updatedAt',
      totalAreaHectares: 'totalArea',
    };

    const mappedSortField = allowedSortFields[sortField] || 'lead.createdAt';

    if (sortField === 'totalAreaHectares') {
      queryBuilder.orderBy('area_sum.totalArea', sortOrder.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy(mappedSortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    }

    return queryBuilder;
  }
}
