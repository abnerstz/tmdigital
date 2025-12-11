import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@modules/auth/auth.service';
import { UsersService } from '@modules/users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from '@modules/users/entities/user.entity';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

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

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('deve registrar um novo usuário e retornar token', async () => {
      const createDto: CreateUserDto = {
        nome: 'João Silva',
        email: 'joao@example.com',
        password: 'password123',
        role: UserRole.VENDEDOR,
      };

      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('mockToken');

      const result = await service.register(createDto);

      expect(result.user.email).toBe('joao@example.com');
      expect(result.accessToken).toBe('mockToken');
      expect(usersService.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const loginDto: LoginDto = {
        email: 'joao@example.com',
        password: 'password123',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mockToken');

      const result = await service.login(loginDto);

      expect(result.user.email).toBe('joao@example.com');
      expect(result.accessToken).toBe('mockToken');
    });

    it('deve lançar UnauthorizedException para email inválido', async () => {
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'password123',
      };

      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para usuário inativo', async () => {
      const inactiveUser: User = {
        ...mockUser,
        isActive: false,
      };

      const loginDto: LoginDto = {
        email: 'joao@example.com',
        password: 'password123',
      };

      usersService.findByEmail.mockResolvedValue(inactiveUser);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException para senha inválida', async () => {
      const loginDto: LoginDto = {
        email: 'joao@example.com',
        password: 'wrongPassword',
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('deve retornar perfil do usuário', async () => {
      usersService.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('1');

      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith('1');
    });
  });
});

