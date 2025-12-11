import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateInitialTables1735689600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create leads table
    await queryRunner.createTable(
      new Table({
        name: 'leads',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'cpf',
            type: 'varchar',
            length: '11',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['new', 'initial_contact', 'in_negotiation', 'converted', 'lost'],
            default: "'new'",
            isNullable: false,
          },
          {
            name: 'firstContactDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'lastInteraction',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'comments',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tags',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes for leads table
    await queryRunner.createIndex(
      'leads',
      new TableIndex({
        name: 'IDX_LEADS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'leads',
      new TableIndex({
        name: 'IDX_LEADS_CITY',
        columnNames: ['city'],
      }),
    );

    await queryRunner.createIndex(
      'leads',
      new TableIndex({
        name: 'IDX_LEADS_CPF',
        columnNames: ['cpf'],
      }),
    );

    await queryRunner.createIndex(
      'leads',
      new TableIndex({
        name: 'IDX_LEADS_DELETED_AT',
        columnNames: ['deletedAt'],
      }),
    );

    // Create properties table
    await queryRunner.createTable(
      new Table({
        name: 'properties',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'leadId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'cropType',
            type: 'enum',
            enum: ['soja', 'milho', 'algodao', 'outros'],
            isNullable: false,
          },
          {
            name: 'areaHectares',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'geometry',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'properties',
      new TableForeignKey({
        columnNames: ['leadId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'leads',
        onDelete: 'CASCADE',
        name: 'FK_PROPERTIES_LEAD',
      }),
    );

    // Create indexes for properties table
    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'IDX_PROPERTIES_LEAD_ID',
        columnNames: ['leadId'],
      }),
    );

    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'IDX_PROPERTIES_CROP_TYPE',
        columnNames: ['cropType'],
      }),
    );

    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'IDX_PROPERTIES_CITY',
        columnNames: ['city'],
      }),
    );

    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'IDX_PROPERTIES_AREA_HECTARES',
        columnNames: ['areaHectares'],
      }),
    );

    await queryRunner.createIndex(
      'properties',
      new TableIndex({
        name: 'IDX_PROPERTIES_DELETED_AT',
        columnNames: ['deletedAt'],
      }),
    );

    // Enable UUID extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('properties', 'IDX_PROPERTIES_DELETED_AT');
    await queryRunner.dropIndex('properties', 'IDX_PROPERTIES_AREA_HECTARES');
    await queryRunner.dropIndex('properties', 'IDX_PROPERTIES_CITY');
    await queryRunner.dropIndex('properties', 'IDX_PROPERTIES_CROP_TYPE');
    await queryRunner.dropIndex('properties', 'IDX_PROPERTIES_LEAD_ID');

    // Drop foreign key
    await queryRunner.dropForeignKey('properties', 'FK_PROPERTIES_LEAD');

    // Drop tables
    await queryRunner.dropTable('properties');
    await queryRunner.dropTable('leads');
  }
}
