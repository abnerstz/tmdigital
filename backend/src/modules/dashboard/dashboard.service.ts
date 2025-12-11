import { Injectable } from '@nestjs/common';
import { LeadsRepository } from '../leads/repositories/leads.repository';
import { PropertiesRepository } from '../properties/repositories/properties.repository';
import { LeadStatus } from '../leads/entities/lead.entity';
import { Lead } from '../leads/entities/lead.entity';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';
import { ChartDataDto } from './dto/chart-data.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly propertiesRepository: PropertiesRepository,
  ) {}

  async getMetrics(): Promise<DashboardMetricsDto> {
    const totalLeads = await this.leadsRepository.count();
    const totalProperties = await this.propertiesRepository.count();
    const totalAreaHectares = await this.propertiesRepository.getTotalArea();

    const newLeads = await this.leadsRepository.countByStatus(LeadStatus.NEW);
    const leadsInNegotiation = await this.leadsRepository.countByStatus(LeadStatus.IN_NEGOTIATION);
    const convertedLeads = await this.leadsRepository.countByStatus(LeadStatus.CONVERTED);

    const priorityLeads = (await this.leadsRepository.findPriorityLeads(100, 1000)).length;

    const leadsWithoutContact = (await this.leadsRepository.findLeadsWithoutContact(30)).length;

    return {
      totalLeads,
      totalProperties,
      totalAreaHectares,
      newLeads,
      leadsInNegotiation,
      convertedLeads,
      priorityLeads,
      leadsWithoutContact,
    };
  }

  async getLeadsByStatus(): Promise<ChartDataDto> {
    const results = await this.leadsRepository.getStatsByStatus();

    const statusLabels: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: 'Novo',
      [LeadStatus.INITIAL_CONTACT]: 'Contato Inicial',
      [LeadStatus.IN_NEGOTIATION]: 'Em Negociação',
      [LeadStatus.CONVERTED]: 'Convertido',
      [LeadStatus.LOST]: 'Perdido',
    };

    const colors: Record<LeadStatus, string> = {
      [LeadStatus.NEW]: '#3B82F6',
      [LeadStatus.INITIAL_CONTACT]: '#10B981',
      [LeadStatus.IN_NEGOTIATION]: '#F59E0B',
      [LeadStatus.CONVERTED]: '#22C55E',
      [LeadStatus.LOST]: '#EF4444',
    };

    return {
      labels: results.map(item => statusLabels[item.status as LeadStatus] || item.status),
      datasets: [
        {
          label: 'Leads por Status',
          data: results.map(item => parseInt(item.count)),
          backgroundColor: results.map(item => colors[item.status as LeadStatus] || '#6B7280'),
          borderColor: results.map(item => colors[item.status as LeadStatus] || '#6B7280'),
        },
      ],
    };
  }

  async getLeadsByCity(limit: number = 10): Promise<ChartDataDto> {
    const results = await this.leadsRepository.getStatsByCity(limit);

    return {
      labels: results.map(item => item.city),
      datasets: [
        {
          label: 'Leads por Cidade',
          data: results.map(item => parseInt(item.count)),
          backgroundColor: ['#3B82F6'],
          borderColor: ['#3B82F6'],
        },
      ],
    };
  }

  async getAreaByCropType(): Promise<ChartDataDto> {
    const results = await this.propertiesRepository.getStatsByCropType();

    const cropLabels: Record<string, string> = {
      soja: 'Soja',
      milho: 'Milho',
      algodao: 'Algodão',
      outros: 'Outros',
    };

    const colors: Record<string, string> = {
      soja: '#10B981',
      milho: '#F59E0B',
      algodao: '#8B5CF6',
      outros: '#6B7280',
    };

    return {
      labels: results.map(item => cropLabels[item.cropType] || item.cropType),
      datasets: [
        {
          label: 'Área (hectares)',
          data: results.map(item => parseFloat(item.totalArea)),
          backgroundColor: results.map(item => colors[item.cropType] || '#6B7280'),
          borderColor: results.map(item => colors[item.cropType] || '#6B7280'),
        },
      ],
    };
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
}
