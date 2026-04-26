import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Partner } from '../entities/partner.entity';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/create-partner.dto';

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(Partner)
    private partnersRepository: Repository<Partner>,
  ) {}

  async create(createPartnerDto: CreatePartnerDto): Promise<Partner> {
    const partner = this.partnersRepository.create({
      ...createPartnerDto,
      displayOrder: createPartnerDto.displayOrder || 0,
      isActive: createPartnerDto.isActive ?? true,
    });

    return this.partnersRepository.save(partner);
  }

  async findAll(onlyActive = true): Promise<Partner[]> {
    const query = this.partnersRepository.createQueryBuilder('partner');

    if (onlyActive) {
      query.where('partner.isActive = :isActive', { isActive: true });
    }

    return query.orderBy('partner.displayOrder', 'ASC').getMany();
  }

  async findById(id: string): Promise<Partner> {
    const partner = await this.partnersRepository.findOne({ where: { id } });
    if (!partner) {
      throw new NotFoundException(`Partner with ID ${id} not found`);
    }
    return partner;
  }

  async update(
    id: string,
    updatePartnerDto: UpdatePartnerDto,
  ): Promise<Partner> {
    const partner = await this.findById(id);
    Object.assign(partner, updatePartnerDto);
    return this.partnersRepository.save(partner);
  }

  async delete(id: string): Promise<void> {
    const partner = await this.findById(id);
    await this.partnersRepository.remove(partner);
  }

  async toggleStatus(id: string): Promise<Partner> {
    const partner = await this.findById(id);
    partner.isActive = !partner.isActive;
    return this.partnersRepository.save(partner);
  }
}
