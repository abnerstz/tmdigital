import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LeadsService } from 'src/app/core/services/leads.service';
import { environment } from 'src/environments/environment';
import { Lead, LeadFilters, PaginationParams, LeadStatus } from 'src/app/core/models';

describe('LeadsService', () => {
  let service: LeadsService;
  let httpMock: HttpTestingController;

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LeadsService],
    });

    service = TestBed.inject(LeadsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('getLeads', () => {
    it('deve buscar leads com paginação', () => {
      const mockResponse = {
        data: [mockLead],
        total: 1,
        page: 0,
        pageSize: 10,
        totalPages: 1,
      };

      service.getLeads().subscribe(response => {
        expect(response.data).toEqual([mockLead]);
        expect(response.total).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/leads?page=0&pageSize=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('deve adicionar filtros aos parâmetros', () => {
      const filters: LeadFilters = {
        searchTerm: 'João',
        status: [LeadStatus.NEW],
        city: ['Uberlândia'],
      };

      service.getLeads(filters).subscribe();

      const req = httpMock.expectOne(
        (request) => {
          const statusParams = request.params.getAll('status');
          const cityParams = request.params.getAll('city');
          return !!(request.url === `${environment.apiUrl}/leads` &&
            request.params.get('searchTerm') === 'João' &&
            statusParams && statusParams.includes('new') &&
            cityParams && cityParams.includes('Uberlândia'));
        }
      );
      expect(req).toBeTruthy();
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0, page: 0, pageSize: 10, totalPages: 0 });
    });

    it('deve adicionar ordenação aos parâmetros', () => {
      const pagination: PaginationParams = {
        page: 0,
        pageSize: 10,
        sortField: 'name',
        sortOrder: 'asc',
      };

      service.getLeads({}, pagination).subscribe();

      const req = httpMock.expectOne(
        (request) => {
          return request.url === `${environment.apiUrl}/leads` &&
            request.params.get('sortField') === 'name' &&
            request.params.get('sortOrder') === 'asc';
        }
      );
      expect(req).toBeTruthy();
      expect(req.request.method).toBe('GET');
      req.flush({ data: [], total: 0, page: 0, pageSize: 10, totalPages: 0 });
    });
  });

  describe('getLeadById', () => {
    it('deve buscar um lead por ID', () => {
      service.getLeadById('1').subscribe(lead => {
        expect(lead).toEqual(mockLead);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/leads/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLead);
    });
  });

  describe('createLead', () => {
    it('deve criar um novo lead', () => {
      const createDto = {
        name: 'João Silva',
        cpf: '12345678909',
        city: 'Uberlândia',
        status: LeadStatus.NEW,
      };

      service.createLead(createDto).subscribe(lead => {
        expect(lead).toEqual(mockLead);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/leads`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockLead);
    });
  });

  describe('updateLead', () => {
    it('deve atualizar um lead', () => {
      const updateDto = {
        name: 'João Silva Atualizado',
      };

      service.updateLead('1', updateDto).subscribe(lead => {
        expect(lead.name).toBe('João Silva Atualizado');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/leads/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.lastInteraction).toBeDefined();
      req.flush({ ...mockLead, ...updateDto });
    });
  });

  describe('deleteLead', () => {
    it('deve deletar um lead', () => {
      service.deleteLead('1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/leads/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getLeadStats', () => {
    it('deve buscar estatísticas de leads', () => {
      const mockStats = {
        totalLeads: 10,
        totalProperties: 5,
        totalAreaHectares: 1000,
        leadsByStatus: [],
        leadsByCity: [],
        areaByCrop: [],
      };

      service.getLeadStats().subscribe(stats => {
        expect(stats).toEqual(mockStats);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/leads/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStats);
    });
  });

  describe('exportLeads', () => {
    it('deve exportar leads em formato Excel', () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      service.exportLeads('excel').subscribe(blob => {
        expect(blob).toBeDefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/leads/export?format=excel`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('deve exportar leads em formato CSV', () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });

      service.exportLeads('csv').subscribe(blob => {
        expect(blob).toBeDefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/leads/export?format=csv`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBlob);
    });
  });

  describe('getPriorityLeads', () => {
    it('deve buscar leads prioritários', () => {
      service.getPriorityLeads(10).subscribe(leads => {
        expect(leads).toEqual([mockLead]);
      });

      const req = httpMock.expectOne(
        (request) => {
          return request.url === `${environment.apiUrl}/leads/priority` &&
            request.params.get('limit') === '10';
        }
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockLead]);
    });
  });

  describe('getRecentLeads', () => {
    it('deve buscar leads recentes', () => {
      service.getRecentLeads(7).subscribe(leads => {
        expect(leads).toEqual([mockLead]);
      });

      const req = httpMock.expectOne(
        (request) => {
          return request.url === `${environment.apiUrl}/leads/recent` &&
            request.params.get('days') === '7';
        }
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockLead]);
    });
  });

  describe('getLeadsWithoutContact', () => {
    it('deve buscar leads sem contato', () => {
      service.getLeadsWithoutContact(30).subscribe(leads => {
        expect(leads).toEqual([mockLead]);
      });

      const req = httpMock.expectOne(
        (request) => {
          return request.url === `${environment.apiUrl}/leads/no-contact` &&
            request.params.get('days') === '30';
        }
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockLead]);
    });
  });
});

