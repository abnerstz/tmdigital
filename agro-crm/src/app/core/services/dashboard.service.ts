import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LeadStats, Lead } from '../models';

export interface DashboardMetrics {
  totalLeads: number;
  totalProperties: number;
  totalAreaHectares: number;
  newLeads: number;
  leadsInNegotiation: number;
  convertedLeads: number;
  priorityLeads: number;
  leadsWithoutContact: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/dashboard`;

  /**
   * Busca métricas gerais do dashboard
   */
  getMetrics(): Observable<DashboardMetrics> {
    return this.http.get<DashboardMetrics>(`${this.baseUrl}/metrics`);
  }

  /**
   * Busca dados de leads por status para gráfico
   */
  getLeadsByStatus(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.baseUrl}/leads-by-status`);
  }

  /**
   * Busca dados de leads por cidade (top 10) para gráfico
   */
  getLeadsByCity(limit: number = 10): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.baseUrl}/leads-by-city`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Busca dados de área por tipo de cultura para gráfico
   */
  getAreaByCropType(): Observable<ChartData> {
    return this.http.get<ChartData>(`${this.baseUrl}/area-by-crop-type`);
  }

  /**
   * Busca leads prioritários (área > 100ha)
   */
  getPriorityLeads(limit: number = 10): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.baseUrl}/priority-leads`, {
      params: { limit: limit.toString() }
    });
  }

  /**
   * Busca leads recentes (últimos 7 dias)
   */
  getRecentLeads(days: number = 7): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.baseUrl}/recent-leads`, {
      params: { days: days.toString() }
    });
  }

  /**
   * Busca leads sem contato há mais de X dias
   */
  getLeadsWithoutContact(days: number = 30): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.baseUrl}/leads-no-contact`, {
      params: { days: days.toString() }
    });
  }
}

