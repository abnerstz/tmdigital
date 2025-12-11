import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PropertiesService } from 'src/app/core/services/properties.service';
import { environment } from 'src/environments/environment';
import { Property, CropType } from 'src/app/core/models';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let httpMock: HttpTestingController;

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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PropertiesService],
    });

    service = TestBed.inject(PropertiesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('getProperties', () => {
    it('deve buscar propriedades com paginação', () => {
      const mockResponse = {
        data: [mockProperty],
        total: 1,
        page: 0,
        pageSize: 10,
        totalPages: 1,
      };

      service.getProperties().subscribe(response => {
        expect(response.data).toEqual([mockProperty]);
        expect(response.total).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties?page=0&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getPropertyById', () => {
    it('deve buscar uma propriedade por ID', () => {
      service.getPropertyById('1').subscribe(property => {
        expect(property).toEqual(mockProperty);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProperty);
    });
  });

  describe('getPropertiesByLeadId', () => {
    it('deve buscar propriedades por leadId', () => {
      service.getPropertiesByLeadId('1').subscribe(properties => {
        expect(properties).toEqual([mockProperty]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties/by-lead/1`);
      expect(req.request.method).toBe('GET');
      req.flush([mockProperty]);
    });
  });

  describe('createProperty', () => {
    it('deve criar uma nova propriedade', () => {
      const createDto = {
        leadId: '1',
        name: 'Fazenda Teste',
        cropType: CropType.SOJA,
        areaHectares: 150,
        city: 'Uberlândia',
      };

      service.createProperty(createDto).subscribe(property => {
        expect(property).toEqual(mockProperty);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockProperty);
    });
  });

  describe('updateProperty', () => {
    it('deve atualizar uma propriedade', () => {
      const updateDto = {
        name: 'Fazenda Atualizada',
      };

      service.updateProperty('1', updateDto).subscribe(property => {
        expect(property.name).toBe('Fazenda Atualizada');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto);
      req.flush({ ...mockProperty, ...updateDto });
    });
  });

  describe('deleteProperty', () => {
    it('deve deletar uma propriedade', () => {
      service.deleteProperty('1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/properties/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getPropertiesForMap', () => {
    it('deve buscar propriedades para mapa', () => {
      service.getPropertiesForMap().subscribe(properties => {
        expect(properties).toEqual([mockProperty]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/properties/map`);
      expect(req.request.method).toBe('GET');
      req.flush([mockProperty]);
    });
  });
});

