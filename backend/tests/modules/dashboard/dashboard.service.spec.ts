import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '@modules/dashboard/dashboard.service';
import { LeadsRepository } from '@modules/leads/repositories/leads.repository';
import { PropertiesRepository } from '@modules/properties/repositories/properties.repository';
import { LeadStatus } from '@modules/leads/entities/lead.entity';

describe('DashboardService', () => {
  let service: DashboardService;
  let leadsRepository: jest.Mocked<LeadsRepository>;
  let propertiesRepository: jest.Mocked<PropertiesRepository>;

  const mockLeadsRepository = {
    count: jest.fn(),
    countByStatus: jest.fn(),
    findPriorityLeads: jest.fn(),
    findLeadsWithoutContact: jest.fn(),
    getStatsByStatus: jest.fn(),
    getStatsByCity: jest.fn(),
    findRecentLeads: jest.fn(),
  };

  const mockPropertiesRepository = {
    count: jest.fn(),
    getTotalArea: jest.fn(),
    getStatsByCropType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: LeadsRepository,
          useValue: mockLeadsRepository,
        },
        {
          provide: PropertiesRepository,
          useValue: mockPropertiesRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    leadsRepository = module.get(LeadsRepository);
    propertiesRepository = module.get(PropertiesRepository);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('getMetrics', () => {
    it('deve retornar métricas do dashboard', async () => {
      leadsRepository.count.mockResolvedValue(10);
      propertiesRepository.count.mockResolvedValue(5);
      propertiesRepository.getTotalArea.mockResolvedValue(1000);
      leadsRepository.countByStatus.mockResolvedValue(2);
      leadsRepository.findPriorityLeads.mockResolvedValue([]);
      leadsRepository.findLeadsWithoutContact.mockResolvedValue([]);

      const result = await service.getMetrics();

      expect(result.totalLeads).toBe(10);
      expect(result.totalProperties).toBe(5);
      expect(result.totalAreaHectares).toBe(1000);
      expect(result.newLeads).toBe(2);
    });
  });

  describe('getLeadsByStatus', () => {
    it('deve retornar dados do gráfico de leads por status', async () => {
      leadsRepository.getStatsByStatus.mockResolvedValue([
        { status: LeadStatus.NEW, count: '5' },
        { status: LeadStatus.CONVERTED, count: '3' },
      ]);

      const result = await service.getLeadsByStatus();

      expect(result.labels).toContain('Novo');
      expect(result.labels).toContain('Convertido');
      expect(result.datasets[0].data).toEqual([5, 3]);
    });
  });

  describe('getLeadsByCity', () => {
    it('deve retornar dados do gráfico de leads por cidade', async () => {
      leadsRepository.getStatsByCity.mockResolvedValue([
        { city: 'Uberlândia', count: '5' },
        { city: 'Belo Horizonte', count: '3' },
      ]);

      const result = await service.getLeadsByCity(10);

      expect(result.labels).toContain('Uberlândia');
      expect(result.labels).toContain('Belo Horizonte');
      expect(result.datasets[0].data).toEqual([5, 3]);
    });
  });

  describe('getAreaByCropType', () => {
    it('deve retornar dados do gráfico de área por tipo de cultura', async () => {
      propertiesRepository.getStatsByCropType.mockResolvedValue([
        { cropType: 'soja', totalArea: '500' },
        { cropType: 'milho', totalArea: '300' },
      ]);

      const result = await service.getAreaByCropType();

      expect(result.labels).toContain('Soja');
      expect(result.labels).toContain('Milho');
      expect(result.datasets[0].data).toEqual([500, 300]);
    });
  });

  describe('getPriorityLeads', () => {
    it('deve retornar leads prioritários', async () => {
      const mockLeads = [{ id: '1', name: 'Lead 1' } as any];
      leadsRepository.findPriorityLeads.mockResolvedValue(mockLeads);

      const result = await service.getPriorityLeads(10);

      expect(result).toEqual(mockLeads);
      expect(leadsRepository.findPriorityLeads).toHaveBeenCalledWith(100, 10);
    });
  });

  describe('getRecentLeads', () => {
    it('deve retornar leads recentes', async () => {
      const mockLeads = [{ id: '1', name: 'Lead 1' } as any];
      leadsRepository.findRecentLeads.mockResolvedValue(mockLeads);

      const result = await service.getRecentLeads(7);

      expect(result).toEqual(mockLeads);
      expect(leadsRepository.findRecentLeads).toHaveBeenCalledWith(7);
    });
  });
});

