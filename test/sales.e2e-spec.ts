import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Client } from '../src/clients/entities/clients.entity';
import { Vehicle } from '../src/vehicles/entities/vehicles.entity';
import { VehicleStatus } from '../src/vehicles/enums/vehicle-status.enum';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '../src/shared/filters/http-exception.filter';

describe('Sales (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let savedClient: Client;
  let savedVehicle: Vehicle;

  // Setup Global
  beforeAll(async () => {
    // Sobe a aplicação real, com todos os módulos reais
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Igual ao main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
    dataSource = app.get<DataSource>(DataSource);
  });

  // Fecha a conexão após os testes
  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  // Limpa o banco e prepara novos dados ANTES DE CADA teste
  beforeEach(async () => {
    // Apaga os dados antigos em ordem para não ferir foreign keys
    await dataSource.query('DELETE FROM financings');
    await dataSource.query('DELETE FROM sales');
    await dataSource.query('DELETE FROM vehicles');
    await dataSource.query('DELETE FROM clients');

    // 1. Injetamos um Cliente de Teste via TypeORM direto
    const client = dataSource.manager.create(Client, {
      name: 'João da Silva',
      document: '12345678901',
      creditLimit: 100000,
    });
    savedClient = await dataSource.manager.save(client);

    // 2. Injetamos um Veículo de Teste
    const vehicle = dataSource.manager.create(Vehicle, {
      brand: 'Honda',
      model: 'Civic',
      year: 2024,
      chassi: 'XYZ123ABC',
      price: 80000,
      status: VehicleStatus.AVAILABLE,
    });
    savedVehicle = await dataSource.manager.save(vehicle);
  });

  // O TESTE E2E (Simulando a chamada HTTP real)
  it('/sales (POST) - Deve faturar com sucesso e gerar status HTTP 201', async () => {
    // Dispara a requisição HTTP falsa com os dados
    const response = await request(app.getHttpServer())
      .post('/sales/invoice')
      .send({
        client_id: savedClient.id,
        vehicle_id: savedVehicle.id,
      })
      .expect(201); // Valida se o status HTTP está correto

    // Valida o corpo da resposta HTTP (envolvido pelo TransformInterceptor em .data)
    expect(response.body.data).toHaveProperty('invoiceId');
    expect(response.body.data).toHaveProperty('status', 'COMPLETED');
    expect(Number(response.body.data.amount)).toBe(80000);
  });

  it('/sales/invoice (POST) - Deve retornar erro 422 ao tentar comprar carro sem limite', async () => {
    // Cadastramos uma BMW de 200 mil. O João tem só 100 mil.
    const carroCaro = await dataSource.manager.save(
      dataSource.manager.create(Vehicle, {
        brand: 'BMW',
        model: 'X6',
        year: 2024,
        chassi: 'CARO123',
        price: 200000,
        status: VehicleStatus.AVAILABLE,
      }),
    );

    // Dispara a requisição tentando comprar
    const response = await request(app.getHttpServer())
      .post('/sales/invoice')
      .send({
        client_id: savedClient.id, // Cliente com limite de 100k
        vehicle_id: carroCaro.id, // Carro custando 200k
      })
      .expect(422); // Rejeitado corretamente por falta de saldo

    // Valida a mensagem de erro formatada pelo GlobalExceptionFilter
    expect(response.body.message).toContain('Limite de crédito insuficiente');
    expect(response.body.code).toBe(422);
  });

  it('/sales/invoice (POST) - Deve retornar erro 404 se o cliente não existir', async () => {
    const response = await request(app.getHttpServer())
      .post('/sales/invoice')
      .send({
        client_id: '00000000-0000-0000-0000-000000000000', // UUID falso
        vehicle_id: savedVehicle.id,
      })
      .expect(404);

    expect(response.body.code).toBe(404);
    expect(response.body.message).toContain('Cliente não encontrado');
  });

  it('/sales/invoice (POST) - Deve retornar erro 409 se o veículo já estiver vendido', async () => {
    // Vamos marcar o veículo salvo como vendido
    savedVehicle.status = VehicleStatus.SOLD;
    await dataSource.manager.save(savedVehicle);

    const response = await request(app.getHttpServer())
      .post('/sales/invoice')
      .send({
        client_id: savedClient.id,
        vehicle_id: savedVehicle.id,
      })
      .expect(409);

    expect(response.body.code).toBe(409);
    expect(response.body.message).toContain(
      'Veículo não disponível para venda',
    );
  });
});
