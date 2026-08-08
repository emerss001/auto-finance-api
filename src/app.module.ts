import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { SalesModule } from './sales/sales.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './shared/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validate }),
    DatabaseModule,
    ClientsModule,
    VehiclesModule,
    SalesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
