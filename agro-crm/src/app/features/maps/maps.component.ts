import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { PropertiesService } from '../../core/services/properties.service';
import { LoggerService } from '../../core/services/logger.service';
import { Property, CropType } from '../../core/models';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, MultiSelectModule, FormsModule],
  template: `
    <div class="maps-container">
      <div class="page-header">
        <div>
          <h1>Visualização de áreas de cultivo</h1>
          <p class="subtitle">Localização das propriedades rurais em Minas Gerais</p>
        </div>
      </div>

      <p-card styleClass="map-card">
        <div class="map-controls">
          <p-multiSelect
            [(ngModel)]="selectedCrops"
            [options]="cropOptions"
            (ngModelChange)="filterProperties()"
            optionLabel="label"
            optionValue="value"
            placeholder="Filtrar por cultura"
            [showClear]="true"
            styleClass="filter-select">
          </p-multiSelect>

          <div class="legend">
            <span class="legend-title">Legenda:</span>
            <div class="legend-items">
              <span class="legend-item">
                <span class="legend-marker soja"></span> Soja
              </span>
              <span class="legend-item">
                <span class="legend-marker milho"></span> Milho
              </span>
              <span class="legend-item">
                <span class="legend-marker algodao"></span> Algodão
              </span>
              <span class="legend-item">
                <span class="legend-marker outros"></span> Outros
              </span>
            </div>
          </div>
        </div>

        <div id="map" class="map-container"></div>
      </p-card>
    </div>
  `,
  styles: [`
    .maps-container {
      animation: fadeIn 0.3s ease-in;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: var(--text-color-secondary);
      margin: 0;
    }

    .map-card {
      height: calc(100vh - 200px);
      min-height: 500px;
    }

    .map-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filter-select {
      min-width: 250px;
    }

    .legend {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .legend-title {
      font-weight: 600;
      color: var(--text-color-secondary);
    }

    .legend-items {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .legend-marker {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
    }

    .legend-marker.soja {
      background: #10B981;
    }

    .legend-marker.milho {
      background: #F59E0B;
    }

    .legend-marker.algodao {
      background: #8B5CF6;
    }

    .legend-marker.outros {
      background: #6B7280;
    }

    .map-container {
      height: calc(100% - 60px);
      min-height: 400px;
      border-radius: 8px;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .map-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-select {
        width: 100%;
      }

      .legend {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class MapsComponent implements OnInit, AfterViewInit {
  private propertiesService = inject(PropertiesService);
  private logger = inject(LoggerService);

  private map!: L.Map;
  private markers: L.Marker[] = [];
  private geometries: L.GeoJSON[] = [];
  properties: Property[] = [];
  selectedCrops: CropType[] = [];

  cropOptions = [
    { label: 'Soja', value: CropType.SOJA },
    { label: 'Milho', value: CropType.MILHO },
    { label: 'Algodão', value: CropType.ALGODAO },
    { label: 'Outros', value: CropType.OUTROS }
  ];

  ngOnInit(): void {
    this.loadProperties();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([-18.5122, -44.5550], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    
    L.Icon.Default.prototype.options.iconRetinaUrl = iconRetinaUrl;
    L.Icon.Default.prototype.options.iconUrl = iconUrl;
    L.Icon.Default.prototype.options.shadowUrl = shadowUrl;
  }

  private loadProperties(): void {
    this.propertiesService.getPropertiesForMap().subscribe({
      next: (data) => {
        this.properties = data;
        this.updateMarkers();
      },
      error: (error) => {
        this.logger.error('Erro ao carregar propriedades', error);
        this.properties = [];
      }
    });
  }

  filterProperties(): void {
    if (this.selectedCrops === null) {
      this.selectedCrops = [];
    }
    this.updateMarkers();
  }

  private updateMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.geometries.forEach(geo => geo.remove());
    this.geometries = [];

    const selectedCrops = this.selectedCrops || [];
    const filtered = selectedCrops.length > 0
      ? this.properties.filter(p => selectedCrops.includes(p.cropType))
      : this.properties;

    const bounds: L.LatLngBounds[] = [];

    filtered.forEach(prop => {
      if (prop.geometry && prop.geometry.coordinates) {
        const color = this.getCropColor(prop.cropType);
        const geoJSONLayer = L.geoJSON(prop.geometry as any, {
          style: {
            color: color,
            fillColor: color,
            fillOpacity: 0.3,
            weight: 2
          }
        }).addTo(this.map);

        geoJSONLayer.bindPopup(`
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 0.5rem 0;">${prop.name || 'Sem nome'}</h4>
            <p style="margin: 0.25rem 0;"><strong>Cultura:</strong> ${prop.cropType}</p>
            <p style="margin: 0.25rem 0;"><strong>Área:</strong> ${prop.areaHectares} ha</p>
            <p style="margin: 0.25rem 0;"><strong>Município:</strong> ${prop.city}</p>
          </div>
        `);

        this.geometries.push(geoJSONLayer);
        bounds.push(geoJSONLayer.getBounds());
      } else if (prop.latitude && prop.longitude) {
        const icon = this.getCropIcon(prop.cropType);
        const marker = L.marker([prop.latitude, prop.longitude], { icon })
          .addTo(this.map)
          .bindPopup(`
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 0.5rem 0;">${prop.name || 'Sem nome'}</h4>
              <p style="margin: 0.25rem 0;"><strong>Cultura:</strong> ${prop.cropType}</p>
              <p style="margin: 0.25rem 0;"><strong>Área:</strong> ${prop.areaHectares} ha</p>
              <p style="margin: 0.25rem 0;"><strong>Município:</strong> ${prop.city}</p>
            </div>
          `);
        
        this.markers.push(marker);
        bounds.push(L.latLngBounds([[prop.latitude, prop.longitude], [prop.latitude, prop.longitude]]));
      }
    });

    if (bounds.length > 0) {
      const group = L.featureGroup([...this.markers, ...this.geometries]);
      this.map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }

  private getCropColor(cropType: CropType): string {
    const colors: Record<CropType, string> = {
      [CropType.SOJA]: '#10B981',
      [CropType.MILHO]: '#F59E0B',
      [CropType.ALGODAO]: '#8B5CF6',
      [CropType.OUTROS]: '#6B7280'
    };
    return colors[cropType] || '#6B7280';
  }

  private getCropIcon(cropType: CropType): L.Icon {
    const colors: Record<CropType, string> = {
      [CropType.SOJA]: '#10B981',
      [CropType.MILHO]: '#F59E0B',
      [CropType.ALGODAO]: '#8B5CF6',
      [CropType.OUTROS]: '#6B7280'
    };

    return L.icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path fill="${colors[cropType]}" stroke="#fff" stroke-width="2" 
                d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/>
          <circle cx="12.5" cy="12.5" r="5" fill="#fff"/>
        </svg>
      `)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }
}

