import { Component, OnInit, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild, ElementRef, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime } from 'rxjs';
import * as L from 'leaflet';
import 'leaflet-draw';

@Component({
  selector: 'app-map-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #mapContainer class="map-drawer-container"></div>
  `,
  styles: [`
    .map-drawer-container {
      width: 100%;
      height: 100%;
      min-height: 400px;
      border-radius: 8px;
      overflow: hidden;
    }
  `]
})
export class MapDrawerComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  @Input() geometry?: any;
  @Input() readOnly: boolean = false;
  @Input() initialCenter: [number, number] = [-18.5122, -44.5550];
  @Input() initialZoom: number = 7;
  
  @Output() geometryChange = new EventEmitter<any>();
  @Output() centerChange = new EventEmitter<[number, number]>();
  @Output() cityChange = new EventEmitter<string>();

  private map!: L.Map;
  private drawControl?: L.Control.Draw;
  private drawnLayer?: L.GeoJSON;
  private featureGroup!: L.FeatureGroup;
  private geocodeSubject = new Subject<{ lat: number; lng: number }>();
  private destroyRef = inject(DestroyRef);
  private mapInitialized = false;

  ngOnInit(): void {
    // Debounce de 1 segundo para evitar múltiplas chamadas à API de geocoding
    this.geocodeSubject.pipe(
      debounceTime(1000),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({ lat, lng }) => {
      this.performReverseGeocode(lat, lng);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      this.mapInitialized = true;
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['geometry'] && !changes['geometry'].firstChange && this.mapInitialized && this.map) {
      if (this.geometry) {
        this.loadGeometry(this.geometry);
      } else {
        this.featureGroup.clearLayers();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView(this.initialCenter, this.initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.featureGroup = new L.FeatureGroup();
    this.map.addLayer(this.featureGroup);

    if (this.geometry) {
      this.loadGeometry(this.geometry);
    }

    if (!this.readOnly) {
      this.initDrawControls();
    }
  }

  private initDrawControls(): void {
    const drawOptions: any = {
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#6047DA',
            fillColor: '#6047DA',
            fillOpacity: 0.3
          }
        },
        polyline: false,
        rectangle: {
          shapeOptions: {
            color: '#6047DA',
            fillColor: '#6047DA',
            fillOpacity: 0.3
          }
        },
        circle: false,
        circlemarker: false,
        marker: false
      },
      edit: {
        featureGroup: this.featureGroup,
        remove: true
      }
    };

    this.drawControl = new L.Control.Draw(drawOptions);
    this.map.addControl(this.drawControl);

    this.map.on('draw:created' as any, (e: any) => {
      const layer = e.layer;
      this.featureGroup.clearLayers();
      this.featureGroup.addLayer(layer);
      
      const geoJSON = layer.toGeoJSON();
      this.geometryChange.emit(geoJSON.geometry);
      
      this.updateCenterAndCity(geoJSON.geometry);
    });

    this.map.on('draw:edited' as any, (e: any) => {
      const layers = e.layers;
      layers.eachLayer((layer: any) => {
        const geoJSON = layer.toGeoJSON();
        this.geometryChange.emit(geoJSON.geometry);
        this.updateCenterAndCity(geoJSON.geometry);
      });
    });

    this.map.on('draw:deleted' as any, () => {
      this.featureGroup.clearLayers();
      this.geometryChange.emit(null);
      this.cityChange.emit('');
    });
  }

  private loadGeometry(geometry: any): void {
    if (!geometry || !geometry.coordinates) return;

    this.featureGroup.clearLayers();
    
    const geoJSONLayer = L.geoJSON(geometry as any, {
      style: {
        color: '#6047DA',
        fillColor: '#6047DA',
        fillOpacity: 0.3,
        weight: 2
      }
    });

    this.featureGroup.addLayer(geoJSONLayer);
    this.map.fitBounds(this.featureGroup.getBounds(), { padding: [50, 50] });
    
    this.updateCenterAndCity(geometry);
  }

  private updateCenterAndCity(geometry: any): void {
    if (!geometry || !geometry.coordinates) return;

    let centerLat = 0;
    let centerLng = 0;
    let pointCount = 0;

    const extractCoordinates = (coords: any): void => {
      if (!Array.isArray(coords)) return;
      
      if (coords.length >= 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        centerLng += coords[0];
        centerLat += coords[1];
        pointCount++;
      } else {
        coords.forEach((coord: any) => {
          extractCoordinates(coord);
        });
      }
    };

    extractCoordinates(geometry.coordinates);

    if (pointCount > 0) {
      centerLat /= pointCount;
      centerLng /= pointCount;
      
      this.centerChange.emit([centerLat, centerLng]);
      
      this.reverseGeocode(centerLat, centerLng);
    }
  }

  private reverseGeocode(lat: number, lng: number): void {
    // Emite para o Subject que aplicará debounce
    this.geocodeSubject.next({ lat, lng });
  }

  private performReverseGeocode(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(response => response.json())
      .then(data => {
        const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.county || '';
        if (city) {
          this.cityChange.emit(city);
        }
      })
      .catch(error => {
        if (!error) return;
      });
  }

  public setGeometry(geometry: any): void {
    this.geometry = geometry;
    if (this.map) {
      this.loadGeometry(geometry);
    }
  }

  public clearGeometry(): void {
    this.featureGroup.clearLayers();
    this.geometry = null;
    this.geometryChange.emit(null);
  }
}

