import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from '../entities/news.entity';
import { CreateNewsDto, UpdateNewsDto } from './dto/create-news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  async create(createNewsDto: CreateNewsDto): Promise<News> {
    const news = this.newsRepository.create({
      ...createNewsDto,
      isPublished: createNewsDto.isPublished ?? false,
    });

    return this.newsRepository.save(news);
  }

  async findAll(onlyPublished = true): Promise<News[]> {
    const query = this.newsRepository.createQueryBuilder('news');

    if (onlyPublished) {
      query.where('news.isPublished = :isPublished', { isPublished: true });
    }

    return query.orderBy('news.publishedAt', 'DESC').getMany();
  }

  async findById(id: string): Promise<News> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return news;
  }

  async update(id: string, updateNewsDto: UpdateNewsDto): Promise<News> {
    const news = await this.findById(id);
    Object.assign(news, updateNewsDto);

    if (updateNewsDto.isPublished && !news.publishedAt) {
      news.publishedAt = new Date();
    }

    return this.newsRepository.save(news);
  }

  async delete(id: string): Promise<void> {
    const news = await this.findById(id);
    await this.newsRepository.remove(news);
  }

  async publish(id: string): Promise<News> {
    const news = await this.findById(id);
    news.isPublished = true;
    news.publishedAt = new Date();
    return this.newsRepository.save(news);
  }

  async unpublish(id: string): Promise<News> {
    const news = await this.findById(id);
    news.isPublished = false;
    return this.newsRepository.save(news);
  }
}
