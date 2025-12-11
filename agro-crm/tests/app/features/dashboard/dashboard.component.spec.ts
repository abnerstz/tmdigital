import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from 'src/app/features/dashboard/dashboard.component';
import { DashboardService } from 'src/app/core/services/dashboard.service';
import { LeadsService } from 'src/app/core/services/leads.service';
import { LeadStatus } from 'src/app/core/models';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;
  let leadsService: jasmine.SpyObj<LeadsService>;

  const mockMetrics = {
    totalLeads: 10,
    totalProperties: 5,
    totalAreaHectares: 1000,
    newLeads: 2,
    leadsInNegotiation: 3,
    convertedLeads: 4,
    priorityLeads: 1,
    leadsWithoutContact: 2,
  };

  const mockChartData = {
    labels: ['Novo', 'Convertido'],
    datasets: [{
      label: 'Leads por Status',
      data: [5, 3],
      backgroundColor: ['#3B82F6', '#22C55E'],
      borderColor: ['#3B82F6', '#22C55E'],
    }],
  };

  const mockLeads = [
    {
      id: '1',
      name: 'João Silva',
      city: 'Uberlândia',
      totalAreaHectares: 150,
      status: LeadStatus.NEW,
      createdAt: new Date(),
    } as any,
  ];

  beforeEach(async () => {
    const dashboardServiceSpy = jasmine.createSpyObj('DashboardService', [
      'getMetrics',
      'getLeadsByStatus',
      'getLeadsByCity',
      'getAreaByCropType',
      'getPriorityLeads',
      'getRecentLeads',
      'getLeadsWithoutContact',
    ]);

    const leadsServiceSpy = jasmine.createSpyObj('LeadsService', [
      'getPriorityLeads',
      'getRecentLeads',
      'getLeadsWithoutContact',
    ]);

    // Configure return values BEFORE TestBed.configureTestingModule
    dashboardServiceSpy.getMetrics.and.returnValue(of(mockMetrics));
    dashboardServiceSpy.getLeadsByStatus.and.returnValue(of(mockChartData));
    dashboardServiceSpy.getLeadsByCity.and.returnValue(of(mockChartData));
    dashboardServiceSpy.getAreaByCropType.and.returnValue(of(mockChartData));
    dashboardServiceSpy.getPriorityLeads.and.returnValue(of(mockLeads));
    dashboardServiceSpy.getRecentLeads.and.returnValue(of(mockLeads));
    dashboardServiceSpy.getLeadsWithoutContact.and.returnValue(of(mockLeads));
    leadsServiceSpy.getPriorityLeads.and.returnValue(of(mockLeads));
    leadsServiceSpy.getRecentLeads.and.returnValue(of(mockLeads));
    leadsServiceSpy.getLeadsWithoutContact.and.returnValue(of(mockLeads));

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: LeadsService, useValue: leadsServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService) as jasmine.SpyObj<DashboardService>;
    leadsService = TestBed.inject(LeadsService) as jasmine.SpyObj<LeadsService>;
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar métricas na inicialização', () => {
    fixture.detectChanges();

    expect(dashboardService.getMetrics).toHaveBeenCalled();
    expect(component.metrics()).toEqual(mockMetrics);
  });

  it('deve carregar dados dos gráficos na inicialização', () => {
    fixture.detectChanges();

    expect(dashboardService.getLeadsByStatus).toHaveBeenCalled();
    expect(dashboardService.getLeadsByCity).toHaveBeenCalled();
    expect(dashboardService.getAreaByCropType).toHaveBeenCalled();
  });

  it('deve carregar leads prioritários na inicialização', () => {
    fixture.detectChanges();

    expect(dashboardService.getPriorityLeads).toHaveBeenCalled();
    expect(component.priorityLeads().length).toBeGreaterThan(0);
  });

  it('deve carregar leads recentes na inicialização', () => {
    fixture.detectChanges();

    expect(dashboardService.getRecentLeads).toHaveBeenCalled();
    expect(component.recentLeads().length).toBeGreaterThan(0);
  });

  it('deve carregar leads sem contato na inicialização', () => {
    fixture.detectChanges();

    expect(dashboardService.getLeadsWithoutContact).toHaveBeenCalled();
    expect(component.leadsWithoutContact().length).toBeGreaterThan(0);
  });

  it('deve definir loadingMetrics como false após carregar métricas', () => {
    fixture.detectChanges();

    expect(component.loadingMetrics()).toBe(false);
  });

  it('deve definir loadingCharts como false após carregar gráficos', () => {
    fixture.detectChanges();

    expect(component.loadingCharts()).toBe(false);
  });
});

