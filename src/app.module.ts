import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { SalesModule } from './sales/sales.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './shared/env.validation';
import { SellersModule } from './sellers/sellers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
      validate: validate,
    }),
    DatabaseModule,
    ClientsModule,
    VehiclesModule,
    SalesModule,
    SellersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
