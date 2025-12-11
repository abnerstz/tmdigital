import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService, DashboardMetrics, ChartData } from 'src/app/core/services/dashboard.service';
import { environment } from 'src/environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DashboardService],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('getMetrics', () => {
    it('deve buscar métricas do dashboard', () => {
      const mockMetrics: DashboardMetrics = {
        totalLeads: 10,
        totalProperties: 5,
        totalAreaHectares: 1000,
        newLeads: 2,
        leadsInNegotiation: 3,
        convertedLeads: 4,
        priorityLeads: 1,
        leadsWithoutContact: 2,
      };

      service.getMetrics().subscribe(metrics => {
        expect(metrics).toEqual(mockMetrics);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/metrics`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMetrics);
    });
  });

  describe('getLeadsByStatus', () => {
    it('deve buscar dados de leads por status', () => {
      const mockChartData: ChartData = {
        labels: ['Novo', 'Convertido'],
        datasets: [{
          label: 'Leads por Status',
          data: [5, 3],
          backgroundColor: ['#3B82F6', '#22C55E'],
          borderColor: ['#3B82F6', '#22C55E'],
        }],
      };

      service.getLeadsByStatus().subscribe(data => {
        expect(data).toEqual(mockChartData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/leads-by-status`);
      expect(req.request.method).toBe('GET');
      req.flush(mockChartData);
    });
  });

  describe('getLeadsByCity', () => {
    it('deve buscar dados de leads por cidade', () => {
      const mockChartData: ChartData = {
        labels: ['Uberlândia', 'Belo Horizonte'],
        datasets: [{
          label: 'Leads por Cidade',
          data: [5, 3],
        }],
      };

      service.getLeadsByCity(10).subscribe((data: ChartData) => {
        expect(data).toEqual(mockChartData);
      });

      const req = httpMock.expectOne(
        (request) => {
          return request.url === `${environment.apiUrl}/dashboard/leads-by-city` &&
            request.params.get('limit') === '10';
        }
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockChartData);
    });
  });

  describe('getAreaByCropType', () => {
    it('deve buscar dados de área por tipo de cultura', () => {
      const mockChartData: ChartData = {
        labels: ['Soja', 'Milho'],
        datasets: [{
          label: 'Área (hectares)',
          data: [500, 300],
        }],
      };

      service.getAreaByCropType().subscribe((data: ChartData) => {
        expect(data).toEqual(mockChartData);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/dashboard/area-by-crop-type`);
      expect(req.request.method).toBe('GET');
      req.flush(mockChartData);
    });
  });

  describe('getPriorityLeads', () => {
    it('deve buscar leads prioritários', () => {
      const mockLeads = [
        { id: '1', name: 'Lead 1' } as any,
        { id: '2', name: 'Lead 2' } as any,
      ];

      service.getPriorityLeads(10).subscribe(leads => {
        expect(leads).toEqual(mockLeads);
      });

      const req = httpMock.expectOne(
        (request) => {
          return request.url === `${environment.apiUrl}/dashboard/priority-leads` &&
            request.params.get('limit') === '10';
        }
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockLeads);
    });
  });

  describe('getRecentLeads', () => {
    it('deve buscar leads recentes', () => {
      const mockLeads = [
        { id: '1', name: 'Lead 1' } as any,
      ];

      service.getRecentLeads(7).subscribe(leads => {
        expect(leads).toEqual(mockLeads);
      });

      const req = httpMock.expectOne(
        (request) => {
          return request.url === `${environment.apiUrl}/dashboard/recent-leads` &&
            request.params.get('days') === '7';
        }
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockLeads);
    });
  });

  describe('getLeadsWithoutContact', () => {
    it('deve buscar leads sem contato', () => {
      const mockLeads = [
        { id: '1', name: 'Lead 1' } as any,
      ];

      service.getLeadsWithoutContact(30).subscribe(leads => {
        expect(leads).toEqual(mockLeads);
      });

      const req = httpMock.expectOne(
        (request) => {
          return request.url === `${environment.apiUrl}/dashboard/leads-no-contact` &&
            request.params.get('days') === '30';
        }
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockLeads);
    });
  });
});

