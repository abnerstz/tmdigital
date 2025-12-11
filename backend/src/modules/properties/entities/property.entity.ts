import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Lead } from '../../leads/entities/lead.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum CropType {
  SOJA = 'soja',
  MILHO = 'milho',
  ALGODAO = 'algodao',
  OUTROS = 'outros',
}

@Entity('properties')
@Index(['leadId'])
@Index(['cropType'])
@Index(['city'])
@Index(['areaHectares'])
@Index(['deletedAt'])
export class Property {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ nullable: true })
  name: string;

  @ApiProperty()
  @Column()
  leadId: string;

  @ApiProperty({ type: () => Lead })
  @ManyToOne(() => Lead, lead => lead.properties, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'leadId' })
  lead: Lead;

  @ApiProperty({ enum: CropType })
  @Column({
    type: 'enum',
    enum: CropType,
  })
  cropType: CropType;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  areaHectares: number;

  @ApiProperty()
  @Column()
  city: string;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty()
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  geometry: any;

  @ApiProperty()
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
