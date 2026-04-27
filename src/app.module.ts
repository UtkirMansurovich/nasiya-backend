import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { PartnersModule } from './partners/partners.module';
import { CreditsModule } from './credits/credits.module';
import { PaymentsModule } from './payments/payments.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    // .env faylni o'qish
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // PostgreSQL ga ulanish
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: String(process.env.DB_PASS),
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // faqat development da!
    }),

    UsersModule,

    AuthModule,

    CustomersModule,

    PartnersModule,

    CreditsModule,

    PaymentsModule,

    ReportsModule,
  ],
})
export class AppModule {}
