import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../entities';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/create-program.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private programsRepository: Repository<Program>,
  ) {}

  async create(createProgramDto: CreateProgramDto): Promise<Program> {
    const program = this.programsRepository.create({
      ...createProgramDto,
      status: 'draft',
    });

    return this.programsRepository.save(program);
  }

  async findAll(filters?: { status?: string }): Promise<Program[]> {
    const query = this.programsRepository.createQueryBuilder('program');

    if (filters?.status) {
      query.where('program.status = :status', { status: filters.status });
    }

    return query.orderBy('program.createdAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<Program> {
    const program = await this.programsRepository.findOne({
      where: { id },
      relations: ['donations'],
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return program;
  }

  async update(
    id: string,
    updateProgramDto: UpdateProgramDto,
  ): Promise<Program> {
    const program = await this.findById(id);

    Object.assign(program, updateProgramDto);

    return this.programsRepository.save(program);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);

    await this.programsRepository.delete(id);
  }

  async publishProgram(id: string): Promise<Program> {
    const program = await this.findById(id);

    program.status = 'active';

    return this.programsRepository.save(program);
  }

  async completeProgram(id: string): Promise<Program> {
    const program = await this.findById(id);

    program.status = 'completed';

    return this.programsRepository.save(program);
  }

  async getProgramStats(id: string) {
    const program = await this.findById(id);

    const donationPercentage =
      program.targetAmount > 0
        ? Math.round((program.collectedAmount / program.targetAmount) * 100)
        : 0;

    return {
      title: program.title,
      targetAmount: program.targetAmount,
      collectedAmount: program.collectedAmount,
      donorCount: program.donorCount,
      donationPercentage,
      status: program.status,
      startDate: program.startDate,
      endDate: program.endDate,
    };
  }
}
