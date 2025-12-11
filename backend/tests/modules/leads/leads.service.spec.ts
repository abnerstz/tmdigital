import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from '@modules/leads/leads.service';
import { LeadsRepository } from '@modules/leads/repositories/leads.repository';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Lead, LeadStatus } from '@modules/leads/entities/lead.entity';
import { CreateLeadDto } from '@modules/leads/dto/create-lead.dto';
import { UpdateLeadDto } from '@modules/leads/dto/update-lead.dto';
import { FilterLeadDto } from '@modules/leads/dto/filter-lead.dto';

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: jest.Mocked<LeadsRepository>;

  const mockLead: Lead = {
    id: '1',
    name: 'João Silva',
    cpf: '12345678909',
    email: 'joao@example.com',
    phone: '31987654321',
    city: 'Uberlândia',
    status: LeadStatus.NEW,
    firstContactDate: new Date('2024-01-15'),
    lastInteraction: new Date(),
    comments: 'Test comment',
    tags: ['priority'],
    properties: [],
    totalAreaHectares: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    findWithFilters: jest.fn(),
    findById: jest.fn(),
    findByCpf: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
    getStatsByStatus: jest.fn(),
    getStatsByCity: jest.fn(),
    findAll: jest.fn(),
    getTotalAreaByLead: jest.fn(),
    findPriorityLeads: jest.fn(),
    findRecentLeads: jest.fn(),
    findLeadsWithoutContact: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: LeadsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    repository = module.get(LeadsRepository);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar leads paginados com área total', async () => {
      const filters: FilterLeadDto = { page: 0, pageSize: 10 };
      const mockLeadsWithArea = [{ ...mockLead, totalAreaHectares: 100 }];
      const total = 1;

      repository.findWithFilters.mockResolvedValue([mockLeadsWithArea, total]);

      const result = await service.findAll(filters);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(total);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.data[0].totalAreaHectares).toBe(100);
    });
  });

  describe('findOne', () => {
    it('deve retornar um lead por ID', async () => {
      const leadWithProperties = {
        ...mockLead,
        properties: [{ id: '1', areaHectares: 50 } as any, { id: '2', areaHectares: 50 } as any],
      };

      repository.findById.mockResolvedValue(leadWithProperties);

      const result = await service.findOne('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.totalAreaHectares).toBe(100);
    });

    it('deve lançar NotFoundException quando lead não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('deve criar um novo lead', async () => {
      const createDto: CreateLeadDto = {
        name: 'João Silva',
        cpf: '12345678909',
        email: 'joao@example.com',
        phone: '31987654321',
        city: 'Uberlândia',
        status: LeadStatus.NEW,
      };

      repository.findByCpf.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockLead);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('João Silva');
      expect(repository.create).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException para CPF inválido', async () => {
      const createDto: CreateLeadDto = {
        name: 'João Silva',
        cpf: '12345678900',
        city: 'Uberlândia',
      };

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('deve lançar ConflictException para CPF duplicado', async () => {
      const createDto: CreateLeadDto = {
        name: 'João Silva',
        cpf: '12345678909',
        city: 'Uberlândia',
      };

      repository.findByCpf.mockResolvedValue(mockLead);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('deve atualizar um lead existente', async () => {
      const updateDto: UpdateLeadDto = {
        name: 'João Silva Atualizado',
      };

      const updatedLead: Lead = {
        ...mockLead,
        name: 'João Silva Atualizado',
      };

      repository.findById.mockResolvedValue(mockLead);
      repository.update.mockResolvedValue(updatedLead);

      const result = await service.update('1', updateDto);

      expect(result.name).toBe('João Silva Atualizado');
      expect(repository.update).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando lead não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('999', {})).rejects.toThrow(NotFoundException);
    });

    it('deve validar CPF ao atualizar', async () => {
      const updateDto: UpdateLeadDto = {
        cpf: '12345678900',
      };

      repository.findById.mockResolvedValue(mockLead);

      await expect(service.update('1', updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('deve remover um lead (soft delete)', async () => {
      repository.findById.mockResolvedValue(mockLead);
      repository.softDelete.mockResolvedValue(undefined);

      const result = await service.remove('1');

      expect(result.success).toBe(true);
      expect(repository.softDelete).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundException quando lead não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas de leads', async () => {
      repository.count.mockResolvedValue(10);
      repository.getStatsByStatus.mockResolvedValue([
        { status: LeadStatus.NEW, count: '5' },
        { status: LeadStatus.CONVERTED, count: '3' },
      ]);
      repository.getStatsByCity.mockResolvedValue([
        { city: 'Uberlândia', count: '5' },
        { city: 'Belo Horizonte', count: '3' },
      ]);

      const result = await service.getStats();

      expect(result.total).toBe(10);
      expect(result.byStatus).toHaveLength(2);
      expect(result.byCity).toHaveLength(2);
    });
  });

  describe('getPriorityLeads', () => {
    it('deve retornar leads prioritários', async () => {
      repository.findPriorityLeads.mockResolvedValue([mockLead]);

      const result = await service.getPriorityLeads(10);

      expect(result).toHaveLength(1);
      expect(repository.findPriorityLeads).toHaveBeenCalledWith(100, 10);
    });
  });

  describe('getRecentLeads', () => {
    it('deve retornar leads recentes', async () => {
      repository.findRecentLeads.mockResolvedValue([mockLead]);

      const result = await service.getRecentLeads(7);

      expect(result).toHaveLength(1);
      expect(repository.findRecentLeads).toHaveBeenCalledWith(7);
    });
  });

  describe('exportLeads', () => {
    it('deve lançar BadRequestException para formato inválido', async () => {
      await expect(service.exportLeads('invalid')).rejects.toThrow(BadRequestException);
    });
  });
});
