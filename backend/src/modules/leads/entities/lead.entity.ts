import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum LeadStatus {
  NEW = 'new',
  INITIAL_CONTACT = 'initial_contact',
  IN_NEGOTIATION = 'in_negotiation',
  CONVERTED = 'converted',
  LOST = 'lost',
}

@Entity('leads')
@Index(['status'])
@Index(['city'])
@Index(['deletedAt'])
export class Lead {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ unique: true })
  cpf: string;

  @ApiProperty()
  @Column({ nullable: true })
  email: string;

  @ApiProperty()
  @Column({ nullable: true })
  phone: string;

  @ApiProperty()
  @Column()
  city: string;

  @ApiProperty({ enum: LeadStatus })
  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @ApiProperty()
  @Column({ type: 'date', nullable: true })
  firstContactDate: Date;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  lastInteraction: Date;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  comments: string;

  @ApiProperty()
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @ApiProperty({ type: () => Property, isArray: true })
  @OneToMany(() => Property, property => property.lead, {
    cascade: true,
    eager: false,
  })
  properties: Property[];

  @ApiProperty()
  totalAreaHectares?: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
