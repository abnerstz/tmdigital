import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from '@modules/leads/leads.controller';
import { LeadsService } from '@modules/leads/leads.service';
import { Lead, LeadStatus } from '@modules/leads/entities/lead.entity';
import { CreateLeadDto } from '@modules/leads/dto/create-lead.dto';
import { UpdateLeadDto } from '@modules/leads/dto/update-lead.dto';
import { Response } from 'express';

describe('LeadsController', () => {
  let controller: LeadsController;
  let service: jest.Mocked<LeadsService>;

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

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn(),
    getPriorityLeads: jest.fn(),
    getRecentLeads: jest.fn(),
    getLeadsWithoutContact: jest.fn(),
    exportLeads: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        {
          provide: LeadsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
    service = module.get(LeadsService);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar lista paginada de leads', async () => {
      const mockResponse = {
        data: [mockLead],
        total: 1,
        page: 0,
        pageSize: 10,
        totalPages: 1,
      };

      service.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um lead por ID', async () => {
      service.findOne.mockResolvedValue(mockLead);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockLead);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('create', () => {
    it('deve criar um novo lead', async () => {
      const createDto: CreateLeadDto = {
        name: 'João Silva',
        cpf: '12345678909',
        city: 'Uberlândia',
      };

      service.create.mockResolvedValue(mockLead);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockLead);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('deve atualizar um lead', async () => {
      const updateDto: UpdateLeadDto = {
        name: 'João Silva Atualizado',
      };

      const updatedLead: Lead = {
        ...mockLead,
        name: 'João Silva Atualizado',
      };

      service.update.mockResolvedValue(updatedLead);

      const result = await controller.update('1', updateDto);

      expect(result.name).toBe('João Silva Atualizado');
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('deve remover um lead', async () => {
      service.remove.mockResolvedValue({ success: true, message: 'Lead deleted successfully' });

      const result = await controller.remove('1');

      expect(result.success).toBe(true);
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas', async () => {
      const mockStats = {
        total: 10,
        byStatus: [],
        byCity: [],
      };

      service.getStats.mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('getPriorityLeads', () => {
    it('deve retornar leads prioritários', async () => {
      service.getPriorityLeads.mockResolvedValue([mockLead]);

      const result = await controller.getPriorityLeads(10);

      expect(result).toEqual([mockLead]);
      expect(service.getPriorityLeads).toHaveBeenCalledWith(10);
    });
  });

  describe('exportLeads', () => {
    it('deve exportar leads em formato CSV', async () => {
      const mockBuffer = Buffer.from('test');
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      service.exportLeads.mockResolvedValue(mockBuffer);

      await controller.exportLeads('csv', mockResponse);

      expect(service.exportLeads).toHaveBeenCalledWith('csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=leads.csv',
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
    });

    it('deve exportar leads em formato Excel', async () => {
      const mockBuffer = Buffer.from('test');
      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      service.exportLeads.mockResolvedValue(mockBuffer);

      await controller.exportLeads('excel', mockResponse);

      expect(service.exportLeads).toHaveBeenCalledWith('excel');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=leads.xlsx',
      );
    });
  });
});
