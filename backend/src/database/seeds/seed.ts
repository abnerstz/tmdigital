import { DataSource } from 'typeorm';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { Lead, LeadStatus } from '../../modules/leads/entities/lead.entity';
import { Property, CropType } from '../../modules/properties/entities/property.entity';
import * as bcrypt from 'bcrypt';

const seedDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'agro_crm_db',
  entities: [User, Lead, Property],
  synchronize: true,
  logging: false,
});

async function seed() {
  try {
    await seedDataSource.initialize();
    console.log('Database connection established');
    console.log('Tables synchronized successfully');

    const userRepository = seedDataSource.getRepository(User);
    const leadRepository = seedDataSource.getRepository(Lead);
    const propertyRepository = seedDataSource.getRepository(Property);

    // Seed Users
    const adminExists = await userRepository.findOne({
      where: { email: 'admin@agrocrm.com' },
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = userRepository.create({
        email: 'admin@agrocrm.com',
        nome: 'Administrator',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isActive: true,
      });

      await userRepository.save(admin);
      console.log('Admin user created successfully');
      console.log('Email: admin@agrocrm.com');
      console.log('Password: admin123');
    } else {
      console.log('Admin user already exists');
    }

    const vendedorExists = await userRepository.findOne({
      where: { email: 'vendedor@agrocrm.com' },
    });

    if (!vendedorExists) {
      const hashedPassword = await bcrypt.hash('vendedor123', 10);

      const vendedor = userRepository.create({
        email: 'vendedor@agrocrm.com',
        nome: 'Sales Representative',
        password: hashedPassword,
        role: UserRole.VENDEDOR,
        isActive: true,
      });

      await userRepository.save(vendedor);
      console.log('Vendedor user created successfully');
      console.log('Email: vendedor@agrocrm.com');
      console.log('Password: vendedor123');
    } else {
      console.log('Vendedor user already exists');
    }

    // Seed Leads and Properties
    const leadCount = await leadRepository.count();

    if (leadCount === 0) {
      console.log('Creating sample leads and properties...');

      const sampleLeads = [
        {
          name: 'João Silva',
          cpf: '12345678901',
          email: 'joao.silva@email.com',
          phone: '(11) 98765-4321',
          city: 'Sorriso',
          status: LeadStatus.NEW,
          notes: 'Interessado em expandir cultivo de soja',
        },
        {
          name: 'Maria Santos',
          cpf: '98765432109',
          email: 'maria.santos@email.com',
          phone: '(65) 99876-5432',
          city: 'Lucas do Rio Verde',
          status: LeadStatus.IN_NEGOTIATION,
          notes: 'Produtora de milho e algodão',
        },
        {
          name: 'Pedro Oliveira',
          cpf: '45678912301',
          email: 'pedro.oliveira@email.com',
          phone: '(66) 98888-7777',
          city: 'Primavera do Leste',
          status: LeadStatus.CONVERTED,
          notes: 'Cliente convertido - produtor de soja',
        },
        {
          name: 'Ana Costa',
          cpf: '78912345601',
          email: 'ana.costa@email.com',
          phone: '(67) 97777-6666',
          city: 'Dourados',
          status: LeadStatus.INITIAL_CONTACT,
          notes: 'Primeira visita agendada',
        },
        {
          name: 'Carlos Ferreira',
          cpf: '32165498701',
          email: 'carlos.ferreira@email.com',
          phone: '(62) 96666-5555',
          city: 'Rio Verde',
          status: LeadStatus.NEW,
          notes: 'Lead de alta prioridade - grande área',
        },
      ];

      for (const leadData of sampleLeads) {
        const lead = leadRepository.create(leadData);
        const savedLead = await leadRepository.save(lead);

        // Create properties for each lead
        const numProperties = Math.floor(Math.random() * 3) + 1;
        const cropTypes = [CropType.SOJA, CropType.MILHO, CropType.ALGODAO, CropType.OUTROS];
        const cities = [
          'Sorriso',
          'Lucas do Rio Verde',
          'Primavera do Leste',
          'Dourados',
          'Rio Verde',
        ];

        for (let i = 0; i < numProperties; i++) {
          const baseLat = -15.0 + Math.random() * 5;
          const baseLng = -55.0 + Math.random() * 5;
          const offset = 0.01;

          const geometry = {
            type: 'Polygon',
            coordinates: [
              [
                [baseLng - offset, baseLat - offset],
                [baseLng + offset, baseLat - offset],
                [baseLng + offset, baseLat + offset],
                [baseLng - offset, baseLat + offset],
                [baseLng - offset, baseLat - offset],
              ],
            ],
          };

          const property = propertyRepository.create({
            name: `Fazenda ${savedLead.name} ${i + 1}`,
            leadId: savedLead.id,
            cropType: cropTypes[Math.floor(Math.random() * cropTypes.length)],
            areaHectares: Math.floor(Math.random() * 500) + 50,
            city: cities[Math.floor(Math.random() * cities.length)],
            latitude: baseLat,
            longitude: baseLng,
            geometry: geometry,
            notes: `Propriedade ${i + 1} de ${savedLead.name}`,
          });

          await propertyRepository.save(property);
        }
      }

      console.log(`Created ${sampleLeads.length} sample leads with properties`);
    } else {
      console.log('Sample leads already exist');
    }

    await seedDataSource.destroy();
    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seed();
