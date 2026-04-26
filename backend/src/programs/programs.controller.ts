import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/create-program.dto';

@Controller('programs')
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @Get()
  async findAll(@Query('status') status?: string) {
    return this.programsService.findAll({ status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.programsService.findById(id);
  }

  @Get(':id/stats')
  async getProgramStats(@Param('id') id: string) {
    return this.programsService.getProgramStats(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: any,
    @Body() createProgramDto: CreateProgramDto,
  ) {
    return this.programsService.create(createProgramDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return this.programsService.update(id, updateProgramDto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publishProgram(@Param('id') id: string) {
    return this.programsService.publishProgram(id);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  async completeProgram(@Param('id') id: string) {
    return this.programsService.completeProgram(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.programsService.delete(id);
  }
}
