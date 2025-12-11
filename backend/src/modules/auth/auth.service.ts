import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

export interface SanitizedUser {
  id: string;
  nome: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  user: SanitizedUser;
  accessToken: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private static readonly INVALID_CREDENTIALS = 'Invalid credentials';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(dto);
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.validateCredentials(dto.email, dto.password);
    return this.buildAuthResponse(user);
  }

  private async validateCredentials(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException(AuthService.INVALID_CREDENTIALS);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException(AuthService.INVALID_CREDENTIALS);
    }

    return user;
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const [sanitizedUser, accessToken] = await Promise.all([
      Promise.resolve(this.sanitizeUser(user)),
      this.generateToken(user),
    ]);

    return { user: sanitizedUser, accessToken };
  }

  private generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }

  private sanitizeUser(user: User): SanitizedUser {
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  async getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }
}
