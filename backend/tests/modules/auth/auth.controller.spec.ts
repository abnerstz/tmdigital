import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { CreateUserDto } from '@modules/users/dto/create-user.dto';
import { UserPayload } from '@common/interfaces/user-payload.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockAuthResponse = {
    user: {
      id: '1',
      nome: 'João Silva',
      email: 'joao@example.com',
      role: 'VENDEDOR',
      isActive: true,
      createdAt: new Date(),
    },
    accessToken: 'mockToken',
  };

  const mockService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);

    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('deve registrar um novo usuário', async () => {
      const createDto: CreateUserDto = {
        nome: 'João Silva',
        email: 'joao@example.com',
        password: 'password123',
        role: 'VENDEDOR' as any,
      };

      service.register.mockResolvedValue(mockAuthResponse);

      const result = await controller.register(createDto);

      expect(result).toEqual(mockAuthResponse);
      expect(service.register).toHaveBeenCalledWith(createDto);
    });
  });

  describe('login', () => {
    it('deve fazer login', async () => {
      const loginDto: LoginDto = {
        email: 'joao@example.com',
        password: 'password123',
      };

      service.login.mockResolvedValue(mockAuthResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(service.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getMe', () => {
    it('deve retornar usuário atual', async () => {
      const userPayload: UserPayload = {
        id: '1',
        email: 'joao@example.com',
        nome: 'João Silva',
        role: 'VENDEDOR',
      };

      const result = await controller.getMe(userPayload);

      expect(result).toEqual(userPayload);
    });
  });

  describe('getProfile', () => {
    it('deve retornar perfil do usuário', async () => {
      const userPayload: UserPayload = {
        id: '1',
        email: 'joao@example.com',
        nome: 'João Silva',
        role: 'VENDEDOR',
      };

      const mockUser = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@example.com',
        role: 'VENDEDOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      service.getProfile.mockResolvedValue(mockUser as any);

      const result = await controller.getProfile(userPayload);

      expect(result).toEqual(mockUser);
      expect(service.getProfile).toHaveBeenCalledWith('1');
    });
  });
});

