import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from '../entities/faq.entity';
import { CreateFaqDto, UpdateFaqDto } from './dto/create-faq.dto';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(Faq)
    private faqsRepository: Repository<Faq>,
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    const faq = this.faqsRepository.create({
      ...createFaqDto,
      displayOrder: createFaqDto.displayOrder || 0,
      isActive: createFaqDto.isActive ?? true,
    });

    return this.faqsRepository.save(faq);
  }

  async findAll(onlyActive = true): Promise<Faq[]> {
    const query = this.faqsRepository.createQueryBuilder('faq');

    if (onlyActive) {
      query.where('faq.isActive = :isActive', { isActive: true });
    }

    return query.orderBy('faq.displayOrder', 'ASC').getMany();
  }

  async findByCategory(category: string): Promise<Faq[]> {
    return this.faqsRepository.find({
      where: { category, isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async findById(id: string): Promise<Faq> {
    const faq = await this.faqsRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findById(id);
    Object.assign(faq, updateFaqDto);
    return this.faqsRepository.save(faq);
  }

  async delete(id: string): Promise<void> {
    const faq = await this.findById(id);
    await this.faqsRepository.remove(faq);
  }

  async toggleStatus(id: string): Promise<Faq> {
    const faq = await this.findById(id);
    faq.isActive = !faq.isActive;
    return this.faqsRepository.save(faq);
  }
}
