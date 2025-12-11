import { Lead } from './lead.model';

export enum CropType {
  SOJA = 'soja',
  MILHO = 'milho',
  ALGODAO = 'algodao',
  OUTROS = 'outros'
}

export interface Property {
  id: string;
  name?: string;
  leadId: string;
  lead?: Lead;
  cropType: CropType;
  areaHectares: number;
  city: string;
  latitude?: number;
  longitude?: number;
  geometry?: any;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyCreateDto {
  name?: string;
  leadId: string;
  cropType: CropType;
  areaHectares: number;
  city: string;
  latitude?: number;
  longitude?: number;
  geometry?: any;
  notes?: string;
}

export interface PropertyUpdateDto extends Partial<PropertyCreateDto> {}

export interface PropertyFilters {
  leadId?: string;
  searchTerm?: string;
  cropType?: CropType[];
  areaMin?: number;
  areaMax?: number;
  city?: string[];
}

