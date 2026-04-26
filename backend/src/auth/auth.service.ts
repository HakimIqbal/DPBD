import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../entities';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword: string = await bcrypt.hash(registerDto.password, 10);

    // Create new user
    const user = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      role: registerDto.role,
      companyName: registerDto.companyName,
      npwp: registerDto.npwp,
      picName: registerDto.picName,
      companyAddress: registerDto.companyAddress,
      phone: registerDto.phone,
      website: registerDto.website,
      companyCountry: registerDto.companyCountry || 'Indonesia',
      industry: registerDto.industry,
    });

    await this.usersRepository.save(user);

    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch: boolean = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedException('Account is suspended');
    }

    if (user.status === 'deleted') {
      throw new UnauthorizedException('Account has been deleted');
    }

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: User): AuthResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // Create user response without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userResponse } = user;

    return {
      user: userResponse as Partial<User>,
      access_token,
      expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
