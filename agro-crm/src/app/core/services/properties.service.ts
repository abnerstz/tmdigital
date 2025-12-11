import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Property,
  PropertyCreateDto,
  PropertyUpdateDto,
  PropertyFilters,
  PaginatedResponse,
  PaginationParams
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class PropertiesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/properties`;

  getProperties(
    filters: PropertyFilters = {},
    pagination: PaginationParams = { page: 0, pageSize: 10 }
  ): Observable<PaginatedResponse<Property>> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('pageSize', pagination.pageSize.toString());

    if (pagination.sortField) {
      params = params.set('sortField', pagination.sortField);
      params = params.set('sortOrder', pagination.sortOrder || 'asc');
    }

    if (filters.leadId) {
      params = params.set('leadId', filters.leadId);
    }

    if (filters.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }

    if (filters.cropType && filters.cropType.length > 0) {
      filters.cropType.forEach((type, index) => {
        params = params.append('cropType', type);
      });
    }

    if (filters.areaMin !== undefined) {
      params = params.set('areaMin', filters.areaMin.toString());
    }

    if (filters.areaMax !== undefined) {
      params = params.set('areaMax', filters.areaMax.toString());
    }

    if (filters.city && filters.city.length > 0) {
      params = params.set('city', filters.city.join(','));
    }

    return this.http.get<PaginatedResponse<Property>>(this.baseUrl, { params });
  }

  getPropertyById(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.baseUrl}/${id}`);
  }

  getPropertiesByLeadId(leadId: string): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.baseUrl}/by-lead/${leadId}`);
  }

  createProperty(property: PropertyCreateDto): Observable<Property> {
    return this.http.post<Property>(this.baseUrl, property);
  }

  updateProperty(id: string, property: PropertyUpdateDto): Observable<Property> {
    return this.http.put<Property>(`${this.baseUrl}/${id}`, property);
  }

  deleteProperty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getLargeProperties(limit: number = 10): Observable<Property[]> {
    const params = new HttpParams()
      .set('areaMin', '100')
      .set('limit', limit.toString());
    
    return this.http.get<Property[]>(`${this.baseUrl}/large`, { params });
  }

  getPropertiesForMap(filters: PropertyFilters = {}): Observable<Property[]> {
    let params = new HttpParams();

    if (filters.cropType && filters.cropType.length > 0) {
      params = params.set('cropType', filters.cropType.join(','));
    }

    if (filters.city && filters.city.length > 0) {
      params = params.set('city', filters.city.join(','));
    }

    return this.http.get<Property[]>(`${this.baseUrl}/map`, { params });
  }
}

