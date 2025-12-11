import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@modules/users/users.service';
import { UsersRepository } from '@modules/users/repositories/users.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { User, UserRole } from '@modules/users/entities/user.entity';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { UpdateUserDto } from '@modules/users/dto/update-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser: User = {
    id: '1',
    nome: 'João Silva',
    email: 'joao@example.com',
    password: 'hashedPassword',
    role: UserRole.VENDEDOR,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo usuário', async () => {
      const createDto: CreateUserDto = {
        nome: 'João Silva',
        email: 'joao@example.com',
        password: 'password123',
        role: UserRole.VENDEDOR,
      };

      repository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.email).toBe('joao@example.com');
      expect(repository.create).toHaveBeenCalled();
    });

    it('deve lançar ConflictException para email duplicado', async () => {
      const createDto: CreateUserDto = {
        nome: 'João Silva',
        email: 'joao@example.com',
        password: 'password123',
        role: UserRole.VENDEDOR,
      };

      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários', async () => {
      repository.findAll.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('deve retornar um usuário por ID', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(result).toEqual(mockUser);
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar um usuário por email', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('joao@example.com');

      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('deve atualizar um usuário existente', async () => {
      const updateDto: UpdateUserDto = {
        nome: 'João Silva Atualizado',
      };

      const updatedUser: User = {
        ...mockUser,
        nome: 'João Silva Atualizado',
      };

      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(updatedUser);

      const result = await service.update('1', updateDto);

      expect(result.nome).toBe('João Silva Atualizado');
      expect(repository.update).toHaveBeenCalled();
    });

    it('deve lançar ConflictException para email duplicado ao atualizar', async () => {
      const updateDto: UpdateUserDto = {
        email: 'novo@example.com',
      };

      const existingUser: User = {
        ...mockUser,
        id: '2',
        email: 'novo@example.com',
      };

      repository.findById.mockResolvedValue(mockUser);
      repository.findByEmail.mockResolvedValue(existingUser);

      await expect(service.update('1', updateDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('deve remover um usuário', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.remove.mockResolvedValue(undefined);

      await service.remove('1');

      expect(repository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});

