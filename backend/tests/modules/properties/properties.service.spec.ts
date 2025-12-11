import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from '@modules/properties/properties.service';
import { PropertiesRepository } from '@modules/properties/repositories/properties.repository';
import { LeadsRepository } from '@modules/leads/repositories/leads.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Property, CropType } from '@modules/properties/entities/property.entity';
import { CreatePropertyDto } from '@modules/properties/dto/create-property.dto';
import { UpdatePropertyDto } from '@modules/properties/dto/update-property.dto';
import { FilterPropertyDto } from '@modules/properties/dto/filter-property.dto';
import { Lead, LeadStatus } from '@modules/leads/entities/lead.entity';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let propertiesRepository: jest.Mocked<PropertiesRepository>;
  let leadsRepository: jest.Mocked<LeadsRepository>;

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

  const mockProperty: Property = {
    id: '1',
    leadId: '1',
    name: 'Fazenda Teste',
    cropType: CropType.SOJA,
    areaHectares: 150,
    city: 'Uberlândia',
    latitude: -18.912753,
    longitude: -48.275484,
    geometry: null,
    notes: 'Test property',
    lead: mockLead,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPropertiesRepository = {
    findWithFilters: jest.fn(),
    findById: jest.fn(),
    findByLeadId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findLargeProperties: jest.fn(),
    findPropertiesWithCoordinates: jest.fn(),
  };

  const mockLeadsRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PropertiesRepository,
          useValue: mockPropertiesRepository,
        },
        {
          provide: LeadsRepository,
          useValue: mockLeadsRepository,
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    propertiesRepository = module.get(PropertiesRepository);
    leadsRepository = module.get(LeadsRepository);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar propriedades paginadas', async () => {
      const filters: FilterPropertyDto = { page: 0, pageSize: 10 };
      const mockProperties = [mockProperty];
      const total = 1;

      propertiesRepository.findWithFilters.mockResolvedValue([mockProperties, total]);

      const result = await service.findAll(filters);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(total);
      expect(result.page).toBe(0);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma propriedade por ID', async () => {
      propertiesRepository.findById.mockResolvedValue(mockProperty);

      const result = await service.findOne('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
    });

    it('deve lançar NotFoundException quando propriedade não existe', async () => {
      propertiesRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByLeadId', () => {
    it('deve retornar propriedades por leadId', async () => {
      propertiesRepository.findByLeadId.mockResolvedValue([mockProperty]);

      const result = await service.findByLeadId('1');

      expect(result).toHaveLength(1);
      expect(result[0].leadId).toBe('1');
    });
  });

  describe('create', () => {
    it('deve criar uma nova propriedade', async () => {
      const createDto: CreatePropertyDto = {
        leadId: '1',
        name: 'Fazenda Teste',
        cropType: CropType.SOJA,
        areaHectares: 150,
        city: 'Uberlândia',
        latitude: -18.912753,
        longitude: -48.275484,
      };

      leadsRepository.findById.mockResolvedValue(mockLead);
      propertiesRepository.create.mockResolvedValue(mockProperty);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Fazenda Teste');
      expect(propertiesRepository.create).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando lead não existe', async () => {
      const createDto: CreatePropertyDto = {
        leadId: '999',
        name: 'Fazenda Teste',
        cropType: CropType.SOJA,
        areaHectares: 150,
        city: 'Uberlândia',
      };

      leadsRepository.findById.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('deve atualizar uma propriedade existente', async () => {
      const updateDto: UpdatePropertyDto = {
        name: 'Fazenda Atualizada',
      };

      const updatedProperty: Property = {
        ...mockProperty,
        name: 'Fazenda Atualizada',
      };

      propertiesRepository.findById.mockResolvedValue(mockProperty);
      propertiesRepository.update.mockResolvedValue(updatedProperty);

      const result = await service.update('1', updateDto);

      expect(result.name).toBe('Fazenda Atualizada');
      expect(propertiesRepository.update).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando propriedade não existe', async () => {
      propertiesRepository.findById.mockResolvedValue(null);

      await expect(service.update('999', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma propriedade (soft delete)', async () => {
      propertiesRepository.findById.mockResolvedValue(mockProperty);
      propertiesRepository.softDelete.mockResolvedValue(undefined);

      await service.remove('1');

      expect(propertiesRepository.softDelete).toHaveBeenCalledWith('1');
    });

    it('deve lançar NotFoundException quando propriedade não existe', async () => {
      propertiesRepository.findById.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getLargeProperties', () => {
    it('deve retornar propriedades grandes', async () => {
      propertiesRepository.findLargeProperties.mockResolvedValue([mockProperty]);

      const result = await service.getLargeProperties(10);

      expect(result).toHaveLength(1);
      expect(propertiesRepository.findLargeProperties).toHaveBeenCalledWith(100, 10);
    });
  });

  describe('getPropertiesForMap', () => {
    it('deve retornar propriedades com coordenadas para mapa', async () => {
      const filters: FilterPropertyDto = {};
      propertiesRepository.findPropertiesWithCoordinates.mockResolvedValue([mockProperty]);

      const result = await service.getPropertiesForMap(filters);

      expect(result).toHaveLength(1);
      expect(result[0].latitude).toBeDefined();
      expect(result[0].longitude).toBeDefined();
    });
  });
});
