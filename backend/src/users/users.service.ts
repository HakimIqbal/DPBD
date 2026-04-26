import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'email',
        'name',
        'role',
        'status',
        'avatar',
        'totalDonation',
        'createdAt',
      ],
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async updateStatus(id: string, status: 'active' | 'suspended' | 'deleted') {
    const user = await this.findById(id);

    user.status = status;

    return this.usersRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // Verify user exists before deleting

    await this.usersRepository.delete(id);
  }

  async getDonationStats(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['donations'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      totalDonations: user.donations.length,
      totalAmount: user.totalDonation,
      lastDonation: user.lastDonation,
    };
  }
}
