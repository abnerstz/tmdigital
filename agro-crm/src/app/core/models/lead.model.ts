import { Property } from './property.model';

export enum LeadStatus {
  NEW = 'new',
  INITIAL_CONTACT = 'initial_contact',
  IN_NEGOTIATION = 'in_negotiation',
  CONVERTED = 'converted',
  LOST = 'lost'
}

export interface Lead {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  city: string;
  status: LeadStatus;
  firstContactDate?: Date;
  lastInteraction?: Date;
  comments?: string;
  tags?: string[];
  properties?: Property[];
  totalAreaHectares?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadCreateDto {
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  city: string;
  status: LeadStatus;
  firstContactDate?: Date;
  comments?: string;
  tags?: string[];
}

export interface LeadUpdateDto extends Partial<LeadCreateDto> {
  lastInteraction?: Date;
}

export interface LeadFilters {
  searchTerm?: string;
  status?: LeadStatus[];
  city?: string[];
  areaMin?: number;
  areaMax?: number;
  cropType?: string;
}

export interface LeadStats {
  totalLeads: number;
  totalProperties: number;
  totalAreaHectares: number;
  leadsByStatus: { status: LeadStatus; count: number }[];
  leadsByCity: { city: string; count: number }[];
  areaByCrop: { cropType: string; area: number }[];
}
