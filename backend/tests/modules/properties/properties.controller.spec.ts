import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from '@modules/properties/properties.controller';
import { PropertiesService } from '@modules/properties/properties.service';
import { Property, CropType } from '@modules/properties/entities/property.entity';
import { CreatePropertyDto } from '@modules/properties/dto/create-property.dto';
import { UpdatePropertyDto } from '@modules/properties/dto/update-property.dto';

describe('PropertiesController', () => {
  let controller: PropertiesController;
  let service: jest.Mocked<PropertiesService>;

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
    lead: null as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByLeadId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getLargeProperties: jest.fn(),
    getPropertiesForMap: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertiesController],
      providers: [
        {
          provide: PropertiesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
    service = module.get(PropertiesService);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar lista paginada de propriedades', async () => {
      const mockResponse = {
        data: [mockProperty],
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
    it('deve retornar uma propriedade por ID', async () => {
      service.findOne.mockResolvedValue(mockProperty);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockProperty);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findByLeadId', () => {
    it('deve retornar propriedades por leadId', async () => {
      service.findByLeadId.mockResolvedValue([mockProperty]);

      const result = await controller.findByLeadId('1');

      expect(result).toEqual([mockProperty]);
      expect(service.findByLeadId).toHaveBeenCalledWith('1');
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
      };

      service.create.mockResolvedValue(mockProperty);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockProperty);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('deve atualizar uma propriedade', async () => {
      const updateDto: UpdatePropertyDto = {
        name: 'Fazenda Atualizada',
      };

      const updatedProperty: Property = {
        ...mockProperty,
        name: 'Fazenda Atualizada',
      };

      service.update.mockResolvedValue(updatedProperty);

      const result = await controller.update('1', updateDto);

      expect(result.name).toBe('Fazenda Atualizada');
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('deve remover uma propriedade', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getLargeProperties', () => {
    it('deve retornar propriedades grandes', async () => {
      service.getLargeProperties.mockResolvedValue([mockProperty]);

      const result = await controller.getLargeProperties(10);

      expect(result).toEqual([mockProperty]);
      expect(service.getLargeProperties).toHaveBeenCalledWith(10);
    });
  });

  describe('getPropertiesForMap', () => {
    it('deve retornar propriedades para mapa', async () => {
      service.getPropertiesForMap.mockResolvedValue([mockProperty]);

      const result = await controller.getPropertiesForMap({});

      expect(result).toEqual([mockProperty]);
      expect(service.getPropertiesForMap).toHaveBeenCalledWith({});
    });
  });
});

