import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProgramsModule } from './programs/programs.module';
import { DonationsModule } from './donations/donations.module';
import { PartnersModule } from './partners/partners.module';
import { NewsModule } from './news/news.module';
import { FaqsModule } from './faqs/faqs.module';
import { PaymentsModule } from './payments/payments.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportingModule } from './reporting/reporting.module';
import { AdminModule } from './admin/admin.module';
import { DonorModule } from './donors/donor.module';
import { AuditModule } from './audit/audit.module';
import { InvestmentModule } from './investment/investment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = configService.get<TypeOrmModuleOptions>('database');
        if (!dbConfig) {
          throw new Error('Database configuration not found');
        }
        return dbConfig;
      },
    }),
    AuthModule,
    UsersModule,
    ProgramsModule,
    DonationsModule,
    PartnersModule,
    NewsModule,
    FaqsModule,
    PaymentsModule,
    AnalyticsModule,
    ReportingModule,
    AdminModule,
    DonorModule,
    AuditModule,
    InvestmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
