import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { LeadsRepository } from './repositories/leads.repository';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { FilterLeadDto } from './dto/filter-lead.dto';
import { PaginatedLeadResponseDto } from './dto/paginated-lead-response.dto';
import { isValidCPF } from '../../common/utils/cpf.validator';

@Injectable()
export class LeadsService {
  constructor(private readonly leadsRepository: LeadsRepository) {}

  async findAll(filters: FilterLeadDto): Promise<PaginatedLeadResponseDto> {
    const [data, total] = await this.leadsRepository.findWithFilters(filters);

    const dataWithAreaTotal = data.map((lead: any) => ({
      ...lead,
      totalAreaHectares: lead.totalAreaHectares || 0,
    }));

    const { page = 0, pageSize = 10 } = filters;

    return {
      data: dataWithAreaTotal,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadsRepository.findById(id);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    const areaTotal = lead.properties.reduce((sum, prop) => sum + Number(prop.areaHectares), 0);

    return {
      ...lead,
      totalAreaHectares: areaTotal,
    };
  }

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    if (!isValidCPF(createLeadDto.cpf)) {
      throw new BadRequestException('Invalid CPF');
    }

    const existingLead = await this.leadsRepository.findByCpf(createLeadDto.cpf);

    if (existingLead) {
      throw new ConflictException('CPF already registered');
    }

    const leadData: Partial<Lead> = {
      ...createLeadDto,
      firstContactDate: createLeadDto.firstContactDate
        ? new Date(createLeadDto.firstContactDate)
        : undefined,
      lastInteraction: new Date(),
    };

    return this.leadsRepository.create(leadData);
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);

    if (updateLeadDto.cpf && updateLeadDto.cpf !== lead.cpf) {
      if (!isValidCPF(updateLeadDto.cpf)) {
        throw new BadRequestException('Invalid CPF');
      }

      const existingLead = await this.leadsRepository.findByCpf(updateLeadDto.cpf);

      if (existingLead) {
        throw new ConflictException('CPF already registered');
      }
    }

    Object.assign(lead, updateLeadDto, { lastInteraction: new Date() });

    return this.leadsRepository.update(lead);
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    await this.leadsRepository.softDelete(id);
    return { success: true, message: 'Lead deleted successfully' };
  }

  async getStats() {
    const total = await this.leadsRepository.count();
    const byStatus = await this.leadsRepository.getStatsByStatus();
    const byCity = await this.leadsRepository.getStatsByCity(10);

    return {
      total,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: parseInt(item.count),
      })),
      byCity: byCity.map(item => ({
        city: item.city,
        count: parseInt(item.count),
      })),
    };
  }

  async getTotalCount(): Promise<number> {
    return this.leadsRepository.count();
  }

  async getStatsByStatus() {
    const byStatus = await this.leadsRepository.getStatsByStatus();
    return byStatus.map(item => ({
      status: item.status,
      count: parseInt(item.count),
    }));
  }

  async getStatsByCity(limit: number = 10) {
    const byCity = await this.leadsRepository.getStatsByCity(limit);
    return byCity.map(item => ({
      city: item.city,
      count: parseInt(item.count),
    }));
  }

  async getPriorityLeads(limit: number = 10): Promise<Lead[]> {
    return this.leadsRepository.findPriorityLeads(100, limit);
  }

  async getRecentLeads(days: number = 7): Promise<Lead[]> {
    return this.leadsRepository.findRecentLeads(days);
  }

  async getLeadsWithoutContact(days: number = 30): Promise<Lead[]> {
    return this.leadsRepository.findLeadsWithoutContact(days);
  }

  async exportLeads(format: string): Promise<Buffer> {
    const leads = await this.leadsRepository.findAll();

    if (format === 'csv') {
      return this.generateCSV(leads);
    } else if (format === 'excel') {
      return this.generateExcel(leads);
    }

    throw new BadRequestException('Invalid format');
  }

  private async generateCSV(leads: Lead[]): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');

    const tmpFile = path.join(__dirname, '..', '..', '..', 'temp', `leads_${Date.now()}.csv`);

    const csvWriter = createCsvWriter({
      path: tmpFile,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'cpf', title: 'CPF' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'city', title: 'City' },
        { id: 'status', title: 'Status' },
        { id: 'totalArea', title: 'Total Area (ha)' },
      ],
    });

    const records = leads.map(lead => ({
      name: lead.name,
      cpf: lead.cpf,
      email: lead.email || '',
      phone: lead.phone || '',
      city: lead.city,
      status: lead.status,
      totalArea: lead.properties?.reduce((sum, p) => sum + Number(p.areaHectares), 0) || 0,
    }));

    await csvWriter.writeRecords(records);
    const buffer = fs.readFileSync(tmpFile);
    fs.unlinkSync(tmpFile);

    return buffer;
  }

  private async generateExcel(leads: Lead[]): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'CPF', key: 'cpf', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'City', key: 'city', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Area (ha)', key: 'totalArea', width: 15 },
    ];

    leads.forEach(lead => {
      worksheet.addRow({
        name: lead.name,
        cpf: lead.cpf,
        email: lead.email || '',
        phone: lead.phone || '',
        city: lead.city,
        status: lead.status,
        totalArea: lead.properties?.reduce((sum, p) => sum + Number(p.areaHectares), 0) || 0,
      });
    });

    return await workbook.xlsx.writeBuffer();
  }
}
