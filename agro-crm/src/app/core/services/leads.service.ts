import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Lead,
  LeadCreateDto,
  LeadUpdateDto,
  LeadFilters,
  LeadStats,
  PaginatedResponse,
  PaginationParams
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/leads`;
  
  private leadsSubject = new BehaviorSubject<Lead[]>([]);
  public leads$ = this.leadsSubject.asObservable();

  getLeads(
    filters: LeadFilters = {},
    pagination: PaginationParams = { page: 0, pageSize: 10 }
  ): Observable<PaginatedResponse<Lead>> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('pageSize', pagination.pageSize.toString());

    if (pagination.sortField) {
      params = params.set('sortField', pagination.sortField);
      params = params.set('sortOrder', pagination.sortOrder || 'asc');
    }

    if (filters.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }

    if (filters.status && filters.status.length > 0) {
      filters.status.forEach(status => {
        params = params.append('status', status);
      });
    }

    if (filters.city && filters.city.length > 0) {
      filters.city.forEach(city => {
        params = params.append('city', city);
      });
    }

    if (filters.areaMin !== undefined) {
      params = params.set('areaMin', filters.areaMin.toString());
    }

    if (filters.areaMax !== undefined) {
      params = params.set('areaMax', filters.areaMax.toString());
    }

    if (filters.cropType) {
      params = params.set('cropType', filters.cropType);
    }

    return this.http.get<PaginatedResponse<Lead>>(this.baseUrl, { params }).pipe(
      tap(response => this.leadsSubject.next(response.data))
    );
  }

  getLeadById(id: string): Observable<Lead> {
    return this.http.get<Lead>(`${this.baseUrl}/${id}`);
  }

  createLead(lead: LeadCreateDto): Observable<Lead> {
    return this.http.post<Lead>(this.baseUrl, lead);
  }

  updateLead(id: string, lead: LeadUpdateDto): Observable<Lead> {
    return this.http.put<Lead>(`${this.baseUrl}/${id}`, {
      ...lead,
      lastInteraction: new Date()
    });
  }

  deleteLead(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getLeadStats(): Observable<LeadStats> {
    return this.http.get<LeadStats>(`${this.baseUrl}/stats`);
  }

  exportLeads(format: 'excel' | 'csv', filters: LeadFilters = {}): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    if (filters.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }

    if (filters.status && filters.status.length > 0) {
      params = params.set('status', filters.status.join(','));
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  getPriorityLeads(limit: number = 10): Observable<Lead[]> {
    const params = new HttpParams()
      .set('areaMin', '100')
      .set('limit', limit.toString());
    
    return this.http.get<Lead[]>(`${this.baseUrl}/priority`, { params });
  }

  getRecentLeads(days: number = 7): Observable<Lead[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<Lead[]>(`${this.baseUrl}/recent`, { params });
  }

  getLeadsWithoutContact(days: number = 30): Observable<Lead[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<Lead[]>(`${this.baseUrl}/no-contact`, { params });
  }
}
