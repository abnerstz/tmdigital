import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { City } from '../models';

@Injectable({
  providedIn: 'root'
})
export class IbgeService {
  private http = inject(HttpClient);
  private baseUrl = environment.ibgeApiUrl;
  private citiesCache: City[] | null = null;

  getCitiesMG(): Observable<City[]> {
    const cachedData = sessionStorage.getItem('cities_mg');
    if (cachedData) {
      this.citiesCache = JSON.parse(cachedData);
      return of(this.citiesCache!);
    }

    if (this.citiesCache) {
      return of(this.citiesCache);
    }

    return this.http
      .get<City[]>(`${this.baseUrl}/localidades/estados/MG/municipios`)
      .pipe(
        tap(cities => {
          cities.sort((a, b) => a.nome.localeCompare(b.nome));
          this.citiesCache = cities;
          sessionStorage.setItem('cities_mg', JSON.stringify(cities));
        }),
        catchError(() => {
          return of([]);
        })
      );
  }

  getCityByName(name: string): Observable<City | undefined> {
    return new Observable(observer => {
      this.getCitiesMG().subscribe(cities => {
        const city = cities.find(
          c => c.nome.toLowerCase() === name.toLowerCase()
        );
        observer.next(city);
        observer.complete();
      });
    });
  }

  clearCache(): void {
    this.citiesCache = null;
    sessionStorage.removeItem('cities_mg');
  }
}
