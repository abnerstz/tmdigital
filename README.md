# 🌾 Sistema de Gerenciamento de Leads Agrícolas

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Angular](https://img.shields.io/badge/Angular-19.1.6-red)
![NestJS](https://img.shields.io/badge/NestJS-10.3.0-ea2845)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)

## 📋 Sobre o Projeto

Sistema full stack desenvolvido para gerenciamento de leads de um distribuidor de insumos agrícolas (fertilizantes) em Minas Gerais, com foco em culturas de soja, milho e algodão. A solução permite que o time comercial gerencie, priorize e acompanhe leads de forma eficiente, com visibilidade completa do histórico e status de cada contato.

### Contexto de Negócio

- **Persona:** Distribuidor de insumos agrícolas
- **Geografia:** Região de atuação em Minas Gerais
- **Produtos:** Fertilizantes para soja, milho e algodão

### Problemas Resolvidos

- ✅ Comercial explora novos leads além da carteira habitual
- ✅ Organização e priorização de clientes potenciais
- ✅ Visibilidade completa do histórico e status de cada lead
- ✅ Gestão de propriedades rurais vinculadas aos leads
- ✅ Dashboard com métricas e indicadores de performance
- ✅ Identificação automática de leads prioritários (área > 100ha)

---

## 🚀 Tecnologias Utilizadas

### Frontend

- **Angular** 19.1.6 - Framework principal
- **PrimeNG** 19.0.6 - Biblioteca de componentes UI
- **PrimeIcons** 7.0.0 - Ícones
- **Chart.js** 4.5.1 - Gráficos e visualizações
- **Leaflet** 1.9.4 - Mapas interativos
- **Leaflet Draw** 1.0.4 - Desenho de geometrias no mapa
- **RxJS** 7.8.0 - Programação reativa
- **date-fns** 4.1.0 - Manipulação de datas
- **@brazilian-utils/brazilian-utils** 1.1.0 - Utilitários brasileiros (CPF, etc.)

### Backend

- **NestJS** 10.3.0 - Framework Node.js
- **TypeORM** 0.3.19 - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **class-validator** 0.14.0 - Validação de DTOs
- **class-transformer** 0.5.1 - Transformação de objetos
- **@nestjs/swagger** 7.1.17 - Documentação da API
- **@nestjs/jwt** 10.2.0 - Autenticação JWT
- **bcrypt** 5.1.1 - Hash de senhas
- **exceljs** 4.4.0 - Exportação para Excel
- **csv-writer** 1.6.0 - Exportação para CSV
- **zod** 4.1.13 - Validação de schemas

### Ferramentas de Desenvolvimento

- **TypeScript** 5.3+ - Linguagem de programação
- **ESLint** - Linter
- **Prettier** - Formatador de código
- **Jest** - Framework de testes
- **Karma** - Test runner para Angular

---

## ✨ Funcionalidades

### Funcionalidades Essenciais ✅

#### CRUD de Leads

- **Cadastro completo** com nome, CPF (único), email, telefone, município, status e comentários
- **Listagem avançada** com filtros por:
  - Nome ou CPF (busca textual)
  - Status (múltipla seleção)
  - Município (múltipla seleção)
  - Área total (range slider)
- **Paginação** e ordenação
- **Edição** e remoção (soft delete) de leads
- **Status disponíveis:**
  - `new` - Novo
  - `initial_contact` - Contato inicial
  - `in_negotiation` - Em negociação
  - `converted` - Convertido
  - `lost` - Perdido

#### CRUD de Propriedades Rurais

- **Cadastro vinculado** aos leads
- **Campos principais:**
  - Nome da propriedade
  - Cultura (soja, milho, algodão, outros)
  - Área em hectares
  - Município
  - Coordenadas (latitude/longitude)
  - Geometria (GeoJSON) para visualização no mapa
  - Notas e observações
- **Listagem com filtros:**
  - Por cultura
  - Por área (range)
  - Por município
  - Por lead
- **Visualização no mapa** com Leaflet
- **Edição e remoção** (soft delete)

### Funcionalidades Complementares 🎯

#### Dashboard com Métricas

- **Total de leads** no sistema
- **Distribuição de leads por status** (gráfico)
- **Distribuição de leads por município** (gráfico top 10)
- **Distribuição de área por tipo de cultura** (gráfico)
- **Leads prioritários** (área total > 100ha)
- **Leads recentes** (últimos 7 dias)
- **Leads sem contato** (últimos 30 dias)

#### Indicador de Leads Prioritários

- **Destaque visual** para leads com propriedades somando mais de 100 hectares
- **Ícone de estrela** na listagem
- **Filtro específico** para leads prioritários

#### Exportação de Dados

- **Exportação para CSV**
- **Exportação para Excel** (.xlsx)
- **Filtros aplicados** são mantidos na exportação

#### Autenticação e Autorização

- **Sistema de login** com JWT
- **Roles:** Admin e Vendedor
- **Guards** para proteção de rotas
- **Interceptors** para adicionar token automaticamente

#### Integração com APIs Externas

- **IBGE API** - Busca de municípios brasileiros
- **ViaCEP** - Validação de CEP (preparado)

---

## 📁 Arquitetura do Projeto

### Estrutura Backend (NestJS)

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/              # Autenticação e autorização
│   │   │   ├── dto/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── leads/             # Módulo de leads
│   │   │   ├── entities/
│   │   │   │   └── lead.entity.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-lead.dto.ts
│   │   │   │   ├── update-lead.dto.ts
│   │   │   │   ├── filter-lead.dto.ts
│   │   │   │   └── paginated-lead-response.dto.ts
│   │   │   ├── repositories/
│   │   │   │   └── leads.repository.ts
│   │   │   ├── leads.controller.ts
│   │   │   ├── leads.service.ts
│   │   │   └── leads.module.ts
│   │   ├── properties/        # Módulo de propriedades
│   │   │   ├── entities/
│   │   │   │   └── property.entity.ts
│   │   │   ├── dto/
│   │   │   ├── repositories/
│   │   │   ├── properties.controller.ts
│   │   │   ├── properties.service.ts
│   │   │   └── properties.module.ts
│   │   ├── dashboard/         # Dashboard e métricas
│   │   │   ├── dto/
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── dashboard.module.ts
│   │   └── users/             # Gestão de usuários
│   │       ├── entities/
│   │       ├── dto/
│   │       ├── repositories/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       └── users.module.ts
│   ├── common/                # Código compartilhado
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── interfaces/
│   │   ├── utils/
│   │   └── validators/
│   ├── config/                 # Configurações
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── validation.schema.ts
│   ├── database/
│   │   ├── migrations/         # Migrations do banco
│   │   └── seeds/              # Seeds para dados iniciais
│   ├── app.module.ts
│   └── main.ts
├── tests/                      # Testes
├── .env                        # Variáveis de ambiente (não versionado)
├── .env.example                # Exemplo de variáveis de ambiente
├── package.json
├── tsconfig.json
└── nest-cli.json
```

### Estrutura Frontend (Angular)

```
agro-crm/
├── src/
│   ├── app/
│   │   ├── core/               # Serviços e lógica central
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── unsaved-changes.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── loading.interceptor.ts
│   │   │   ├── models/         # Modelos de dados
│   │   │   │   ├── lead.model.ts
│   │   │   │   ├── property.model.ts
│   │   │   │   └── pagination.model.ts
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── leads.service.ts
│   │   │       ├── properties.service.ts
│   │   │       ├── dashboard.service.ts
│   │   │       └── ibge.service.ts
│   │   ├── features/           # Módulos de funcionalidades
│   │   │   ├── auth/
│   │   │   │   └── login/
│   │   │   ├── leads/
│   │   │   │   ├── leads-list/
│   │   │   │   ├── lead-detail/
│   │   │   │   ├── lead-form/
│   │   │   │   └── leads.routes.ts
│   │   │   ├── properties/
│   │   │   │   ├── properties-list/
│   │   │   │   ├── property-detail/
│   │   │   │   ├── property-form/
│   │   │   │   └── properties.routes.ts
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.component.ts
│   │   │   └── maps/
│   │   │       └── maps.component.ts
│   │   ├── layout/             # Componentes de layout
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   └── main-layout/
│   │   ├── shared/             # Componentes compartilhados
│   │   │   ├── components/
│   │   │   │   ├── status-badge/
│   │   │   │   ├── metric-card/
│   │   │   │   ├── empty-state/
│   │   │   │   └── map-drawer/
│   │   │   ├── directives/
│   │   │   │   ├── cpf-mask.directive.ts
│   │   │   │   └── phone-mask.directive.ts
│   │   │   ├── pipes/
│   │   │   │   ├── cpf.pipe.ts
│   │   │   │   └── phone.pipe.ts
│   │   │   └── utils/
│   │   │       └── validators.ts
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   └── environment.ts
│   ├── assets/
│   └── styles.scss
├── public/
├── package.json
├── angular.json
└── tsconfig.json
```

### Fluxo de Dados

```
Frontend (Angular) 
    ↓ HTTP Requests (com JWT)
Backend (NestJS) 
    ↓ TypeORM
PostgreSQL Database
```

1. **Frontend** faz requisições HTTP através de serviços Angular
2. **Interceptors** adicionam token JWT automaticamente
3. **Backend** valida token, processa requisição
4. **TypeORM** executa queries no PostgreSQL
5. **Resposta** retorna ao frontend em formato JSON
6. **Componentes** atualizam a interface reativamente

### Relacionamento entre Entidades

```
Lead (1) ──────< (N) Property
  │
  ├── id (UUID, PK)
  ├── name
  ├── cpf (UNIQUE)
  ├── email
  ├── phone
  ├── city
  ├── status (enum)
  ├── firstContactDate
  ├── lastInteraction
  ├── comments
  ├── tags (array)
  ├── createdAt
  ├── updatedAt
  └── deletedAt (soft delete)

                    Property
                    │
                    ├── id (UUID, PK)
                    ├── name
                    ├── leadId (FK)
                    ├── cropType (enum: soja, milho, algodao, outros)
                    ├── areaHectares (decimal)
                    ├── city
                    ├── latitude
                    ├── longitude
                    ├── geometry (JSONB - GeoJSON)
                    ├── notes
                    ├── createdAt
                    ├── updatedAt
                    └── deletedAt (soft delete)
```

---

## 🔧 Pré-requisitos

Antes de começar, você precisará ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** (versão 9 ou superior) - vem com Node.js
- **Docker** (versão 20 ou superior)
- **Docker Compose** (versão 2 ou superior)
- **Git**

### Verificando as versões instaladas

```bash
node --version        # Deve retornar v18.x ou superior
npm --version         # Deve retornar 9.x ou superior
docker --version      # Deve retornar Docker version 20.x ou superior
docker compose version # Deve retornar Docker Compose version 2.x ou superior
```

---

## 🚀 Instalação e Execução

### 1️⃣ Clone o repositório

```bash
git clone [URL_DO_REPOSITORIO]
cd tmdigital
```

### 2️⃣ Configuração do Banco de Dados com Docker

O projeto utiliza Docker Compose para gerenciar o banco de dados PostgreSQL. Isso facilita a configuração e garante um ambiente consistente.

```bash
# Entre na pasta do backend
cd backend

# Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do backend com o seguinte conteúdo:

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=agro_crm_db

PORT=3000
API_PREFIX=api
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200

JWT_SECRET=vqwfbajqwiybnousafifhbwqubsafbw127fb8yfg6812n9uff28b1f6v8s
JWT_EXPIRES_IN=7d

# Inicie o banco de dados PostgreSQL usando Docker Compose
docker compose up -d

# Verifique se o container está rodando
docker compose ps
```

O PostgreSQL estará rodando em: `localhost:5432`

**Comandos úteis do Docker Compose:**

```bash
# Parar o banco de dados
docker compose down

# Parar e remover volumes (apaga os dados)
docker compose down -v

# Ver logs do banco de dados
docker compose logs -f postgres

# Reiniciar o banco de dados
docker compose restart postgres
```

**Nota:** O arquivo `docker-compose.yml` já está configurado com:
- PostgreSQL 15 Alpine
- Porta padrão: 5432
- Banco de dados: `agro_crm_db`
- Usuário: `postgres`
- Senha: `postgres` (padrão, altere em produção)

**Para alterar a senha do banco de dados:**

1. Edite o arquivo `backend/docker-compose.yml` e altere a variável `POSTGRES_PASSWORD`
2. Ou defina a variável de ambiente `DATABASE_PASSWORD` no arquivo `.env` do backend
3. Reinicie o container: `docker compose down && docker compose up -d`

### 3️⃣ Configuração do Backend

```bash
# Entre na pasta do backend
cd backend

# Instale as dependências
npm install

# Execute as migrations
npm run migration:run

# (Opcional) Execute o seed para popular com dados de exemplo
npm run seed
```

**Nota:** O seed cria dois usuários padrão:
- **Admin:** `admin@agrocrm.com` / `admin123`
- **Vendedor:** `vendedor@agrocrm.com` / `vendedor123`

**Inicie o servidor backend:**

```bash
npm run start:dev
```

O backend estará rodando em: `http://localhost:3000`

**Documentação Swagger:** `http://localhost:3000/api/docs`

### 4️⃣ Configuração do Frontend

```bash
# Em outro terminal, entre na pasta do frontend
cd agro-crm

# Instale as dependências
npm install

# Configure o ambiente (se necessário)
# O arquivo src/environments/environment.ts já está configurado para:
# apiUrl: 'http://localhost:3000/api'

# Inicie o servidor de desenvolvimento
npm start
# ou
ng serve
```

O frontend estará rodando em: `http://localhost:4200`

---

## 📊 Usando a Aplicação

### Acesso Inicial

1. Acesse `http://localhost:4200` no navegador
2. Faça login com uma das credenciais criadas pelo seed:
   - Email: `admin@agrocrm.com`
   - Senha: `admin123`

### Funcionalidades Principais

#### Dashboard

- Visualize métricas gerais do sistema
- Acompanhe distribuição de leads por status e município
- Veja leads prioritários e recentes

#### Gestão de Leads

1. **Listar Leads:**
   - Acesse "Leads" no menu lateral
   - Use os filtros para buscar leads específicos
   - Clique em "Novo Lead" para cadastrar

2. **Cadastrar Lead:**
   - Preencha nome, CPF, email, telefone e município
   - Selecione o status inicial
   - Adicione comentários se necessário
   - Salve o lead

3. **Visualizar/Editar Lead:**
   - Clique no ícone de olho ou lápis na listagem
   - Visualize todas as informações do lead
   - Edite os campos desejados
   - Gerencie propriedades vinculadas

4. **Filtrar Leads:**
   - Use a busca por nome ou CPF
   - Filtre por status (múltipla seleção)
   - Filtre por município
   - Ajuste o range de área total

5. **Exportar Leads:**
   - Clique em "Exportar" no topo da listagem
   - Escolha formato CSV ou Excel
   - Os filtros aplicados serão mantidos na exportação

#### Gestão de Propriedades

1. **Listar Propriedades:**
   - Acesse "Propriedades" no menu lateral
   - Filtre por cultura, área ou município

2. **Cadastrar Propriedade:**
   - Selecione o lead proprietário
   - Preencha cultura, área e município
   - Use o mapa para desenhar a geometria (opcional)
   - Adicione coordenadas manualmente ou pelo mapa

3. **Visualizar no Mapa:**
   - Acesse a visualização de propriedades no mapa
   - Veja todas as propriedades georreferenciadas
   - Clique em um marcador para ver detalhes

---

## 🧪 Testes

### Backend

```bash
cd backend

# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes e2e
npm run test:e2e

# Testes em modo watch
npm run test:watch
```

### Frontend

```bash
cd agro-crm

# Testes unitários
npm run test

# Testes com cobertura (se configurado)
ng test --code-coverage
```

---

## 📝 Endpoints da API

### Autenticação

- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual (requer autenticação)
- `GET /api/auth/profile` - Obter perfil completo (requer autenticação)

### Leads

- `GET /api/leads` - Lista todos os leads (com filtros e paginação)
  - Query params: `page`, `limit`, `search`, `status[]`, `city[]`, `areaMin`, `areaMax`, `sortBy`, `sortOrder`
- `GET /api/leads/:id` - Busca um lead específico
- `POST /api/leads` - Cria um novo lead
- `PUT /api/leads/:id` - Atualiza um lead
- `DELETE /api/leads/:id` - Remove um lead (soft delete)
- `GET /api/leads/stats` - Estatísticas gerais
- `GET /api/leads/stats/total` - Total de leads
- `GET /api/leads/stats/by-status` - Leads agrupados por status
- `GET /api/leads/stats/by-city` - Leads agrupados por município
- `GET /api/leads/priority` - Leads prioritários (área > 100ha)
- `GET /api/leads/recent` - Leads recentes (últimos 7 dias)
- `GET /api/leads/no-contact` - Leads sem contato (últimos 30 dias)
- `GET /api/leads/export?format=csv|excel` - Exportar leads

### Propriedades

- `GET /api/properties` - Lista todas as propriedades (com filtros e paginação)
  - Query params: `page`, `limit`, `leadId`, `cropType[]`, `city[]`, `areaMin`, `areaMax`
- `GET /api/properties/:id` - Busca uma propriedade específica
- `GET /api/properties/by-lead/:leadId` - Propriedades de um lead específico
- `GET /api/properties/large` - Propriedades grandes (área >= 100ha)
- `GET /api/properties/map` - Propriedades com coordenadas para mapa
- `POST /api/properties` - Cria uma nova propriedade
- `PUT /api/properties/:id` - Atualiza uma propriedade
- `DELETE /api/properties/:id` - Remove uma propriedade (soft delete)

### Dashboard

- `GET /api/dashboard/metrics` - Métricas gerais do dashboard
- `GET /api/dashboard/leads-by-status` - Distribuição de leads por status (gráfico)
- `GET /api/dashboard/leads-by-city` - Top cidades por quantidade de leads (gráfico)
- `GET /api/dashboard/area-by-crop-type` - Área total por tipo de cultura (gráfico)
- `GET /api/dashboard/priority-leads` - Leads prioritários
- `GET /api/dashboard/recent-leads` - Leads recentes
- `GET /api/dashboard/leads-no-contact` - Leads sem contato

**Documentação completa:** Acesse `http://localhost:3000/api/docs` quando o backend estiver rodando.

---

## 🛠️ Scripts Disponíveis

### Backend

```bash
npm run start:dev      # Inicia em modo desenvolvimento (watch mode)
npm run start          # Inicia em modo produção
npm run start:prod     # Inicia em modo produção (após build)
npm run build          # Gera build de produção
npm run migration:generate  # Gera nova migration
npm run migration:run       # Executa migrations pendentes
npm run migration:revert    # Reverte última migration
npm run seed                # Executa seed do banco de dados
npm run test            # Executa testes unitários
npm run test:cov        # Testes com cobertura
npm run test:e2e        # Testes end-to-end
npm run lint            # Executa ESLint
npm run format          # Formata código com Prettier
```

### Frontend

```bash
npm start               # Inicia servidor de desenvolvimento
npm run build           # Gera build de produção
ng serve                # Alternativa para iniciar servidor
ng build --configuration production  # Build otimizado para produção
npm run test            # Executa testes unitários
```

---

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
# Database (configuração padrão do Docker Compose)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=agro_crm_db

# Application
PORT=3000
API_PREFIX=api
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d
```

**⚠️ IMPORTANTE:** 
- Nunca commite o arquivo `.env` no repositório
- Use um `.env.example` como template
- Em produção, use variáveis de ambiente do servidor ou um gerenciador de secrets

---

## 🗄️ Migrations e Seeds

### Executando Migrations

```bash
cd backend

# Executar todas as migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert

# Gerar nova migration (após alterar entidades)
npm run migration:generate -- src/database/migrations/NomeDaMigration
```

### Executando Seeds

```bash
cd backend

# Popular banco com dados de exemplo
npm run seed
```

O seed cria:
- 2 usuários (admin e vendedor)
- 5 leads de exemplo
- Propriedades vinculadas aos leads

---

## 🤝 Contribuindo

Este projeto foi desenvolvido como parte do processo seletivo. Para contribuições futuras:

1. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
2. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
3. Push para a branch (`git push origin feature/nova-funcionalidade`)
4. Abra um Pull Request

---

## 📄 Licença

Este projeto foi desenvolvido para fins de avaliação técnica no processo seletivo da TM Digital.

---

## 👨‍💻 Autor

**Abner Santos**

- WhatsApp: [82 9 81018391](https://wa.me/5582981018391)
- Email: [seu-email@exemplo.com]

---

## 📞 Contato

Para dúvidas ou sugestões sobre o projeto, entre em contato:

- **WhatsApp:** 82 9 81018391
- **Email:** [seu-email@exemplo.com]

---

## 🎯 Observações do Desenvolvimento

### Decisões Técnicas

#### Arquitetura

- **Clean Architecture:** Separação clara entre camadas (controllers, services, repositories)
- **Repository Pattern:** Abstração da camada de dados para facilitar testes e manutenção
- **DTO Pattern:** Validação e transformação de dados na entrada/saída da API
- **Soft Delete:** Preservação de dados históricos sem remoção física

#### Backend

- **NestJS:** Escolhido pela estrutura modular, TypeScript nativo e excelente suporte a testes
- **TypeORM:** ORM maduro com suporte a migrations e relacionamentos complexos
- **Swagger:** Documentação automática da API para facilitar integração
- **JWT:** Autenticação stateless e escalável
- **Class Validator:** Validação declarativa e reutilizável

#### Frontend

- **Angular Standalone Components:** Arquitetura moderna sem NgModules
- **Signals:** Gerenciamento de estado reativo (Angular 19)
- **PrimeNG:** Biblioteca de componentes rica e consistente
- **Leaflet:** Mapas interativos com suporte a GeoJSON
- **Interceptors:** Centralização de lógica de autenticação e tratamento de erros

#### Banco de Dados

- **PostgreSQL:** Banco relacional robusto com suporte a JSONB e tipos geométricos
- **Índices estratégicos:** Otimização de queries frequentes (status, cidade, área)
- **Enum Types:** Validação de dados no nível do banco
- **UUID:** Identificadores únicos globais para segurança

### Melhorias Futuras

- [ ] Implementar testes e2e completos
- [ ] Adicionar cache (Redis) para métricas do dashboard
- [ ] Implementar notificações em tempo real (WebSockets)
- [ ] Adicionar upload de documentos/contratos
- [ ] Implementar sistema de tarefas/lembretes para leads
- [ ] Adicionar relatórios avançados (PDF)
- [ ] Implementar busca full-text no PostgreSQL
- [ ] Adicionar autenticação com refresh tokens
- [ ] Implementar rate limiting mais granular
- [ ] Adicionar suporte a múltiplos idiomas (i18n)
- [ ] Implementar testes de carga e otimizações de performance
- [ ] Adicionar CI/CD pipeline
- [ ] Implementar monitoramento e logging estruturado

### Desafios Encontrados

1. **Geometria no Banco:** Implementação de GeoJSON para armazenar polígonos de propriedades
2. **Filtros Complexos:** Criação de query builder flexível para múltiplos filtros combinados
3. **Paginação Lazy:** Implementação de paginação server-side no PrimeNG Table
4. **Validação de CPF:** Criação de validador customizado para CPF brasileiro
5. **Performance:** Otimização de queries com joins e agregações para dashboard

### Soluções Implementadas

- **GeoJSON:** Uso de JSONB no PostgreSQL para flexibilidade e consultas espaciais
- **Query Builder:** Repository pattern com TypeORM QueryBuilder para filtros dinâmicos
- **Lazy Loading:** Integração PrimeNG Table com backend paginado
- **Validators Customizados:** Decorators e pipes para validação de CPF
- **Índices e Agregações:** Otimização de queries com índices estratégicos e agregações SQL

---

**Desenvolvido como parte do processo seletivo de Engenharia - TM Digital 2025** 🌾

