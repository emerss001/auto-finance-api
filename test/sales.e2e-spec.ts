import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Client } from '../src/clients/entities/clients.entity';
import { Vehicle } from '../src/vehicles/entities/vehicles.entity';
import { Seller } from '../src/sellers/entities/sellers.entity';
import { Financing } from '../src/sales/entities/financings.entity';
import { VehicleStatus } from '../src/vehicles/enums/vehicle-status.enum';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '../src/shared/filters/http-exception.filter';

describe('Sales (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let savedClient: Client;
  let savedVehicle: Vehicle;
  let savedSeller: Seller;

  // Setup Global
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

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

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  // Limpa o banco e prepara novos dados ANTES DE CADA teste
  beforeEach(async () => {
    await dataSource.query('DELETE FROM financings');
    await dataSource.query('DELETE FROM sales');
    await dataSource.query('DELETE FROM vehicles');
    await dataSource.query('DELETE FROM clients');
    await dataSource.query('DELETE FROM sellers');

    // 1. Injetamos um Cliente de Teste
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
      chassi: 'XYZ123ABC45678901',
      price: 80000,
      status: VehicleStatus.AVAILABLE,
    });
    savedVehicle = await dataSource.manager.save(vehicle);

    // 3. Injetamos um Vendedor de Teste
    const seller = dataSource.manager.create(Seller, {
      name: 'Vendedor Teste',
      commissionRate: 5,
    });
    savedSeller = await dataSource.manager.save(seller);
  });

  // ========== POST /sales/invoice ==========

  describe('POST /sales/invoice', () => {
    it('Deve faturar com sucesso sem desconto e gerar status HTTP 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/sales/invoice')
        .send({
          client_id: savedClient.id,
          vehicle_id: savedVehicle.id,
          seller_id: savedSeller.id,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('invoiceId');
      expect(response.body.data).toHaveProperty('status', 'COMPLETED');
      expect(Number(response.body.data.amount)).toBe(80000);
    });

    it('Deve faturar com desconto percentual com sucesso (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/sales/invoice')
        .send({
          client_id: savedClient.id,
          vehicle_id: savedVehicle.id,
          seller_id: savedSeller.id,
          discount: { type: 'PERCENTAGE', value: 10 },
        })
        .expect(201);

      // 80000 - (80000 * 10 / 100) = 72000
      expect(Number(response.body.data.amount)).toBe(72000);
    });

    it('Deve faturar com desconto em valor com sucesso (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/sales/invoice')
        .send({
          client_id: savedClient.id,
          vehicle_id: savedVehicle.id,
          seller_id: savedSeller.id,
          discount: { type: 'VALUE', value: 5000 },
        })
        .expect(201);

      // 80000 - 5000 = 75000
      expect(Number(response.body.data.amount)).toBe(75000);
    });

    it('Deve retornar erro 422 quando o desconto for maior ou igual ao preço', async () => {
      const response = await request(app.getHttpServer())
        .post('/sales/invoice')
        .send({
          client_id: savedClient.id,
          vehicle_id: savedVehicle.id,
          seller_id: savedSeller.id,
          discount: { type: 'VALUE', value: 80000 },
        })
        .expect(422);

      expect(response.body.code).toBe(422);
      expect(response.body.message).toContain(
        'desconto não pode ser maior ou igual',
      );
    });

    it('Deve retornar erro 422 ao tentar comprar carro sem limite', async () => {
      const carroCaro = await dataSource.manager.save(
        dataSource.manager.create(Vehicle, {
          brand: 'BMW',
          model: 'X6',
          year: 2024,
          chassi: 'CARO12345678901AB',
          price: 200000,
          status: VehicleStatus.AVAILABLE,
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/sales/invoice')
        .send({
          client_id: savedClient.id,
          vehicle_id: carroCaro.id,
          seller_id: savedSeller.id,
        })
        .expect(422);

      expect(response.body.message).toContain('Limite de crédito insuficiente');
      expect(response.body.code).toBe(422);
    });

    it('Deve retornar erro 404 se o cliente não existir', async () => {
      const response = await request(app.getHttpServer())
        .post('/sales/invoice')
        .send({
          client_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
          vehicle_id: savedVehicle.id,
          seller_id: savedSeller.id,
        })
        .expect(404);

      expect(response.body.code).toBe(404);
    });

    it('Deve retornar erro 404 se o vendedor não existir', async () => {
      const response = await request(app.getHttpServer())
        .post('/sales/invoice')
        .send({
          client_id: savedClient.id,
          vehicle_id: savedVehicle.id,
          seller_id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
        })
        .expect(404);

      expect(response.body.code).toBe(404);
    });

    it('Deve retornar erro 409 se o veículo já estiver vendido', async () => {
      savedVehicle.status = VehicleStatus.SOLD;
      await dataSource.manager.save(savedVehicle);

      const response = await request(app.getHttpServer())
        .post('/sales/invoice')
        .send({
          client_id: savedClient.id,
          vehicle_id: savedVehicle.id,
          seller_id: savedSeller.id,
        })
        .expect(409);

      expect(response.body.code).toBe(409);
      expect(response.body.message).toContain(
        'Veículo não disponível para venda',
      );
    });
  });

  // ========== Helpers ==========

  async function createSaleAndGetFinancing(): Promise<{
    saleId: string;
    financingId: string;
  }> {
    const saleResponse = await request(app.getHttpServer())
      .post('/sales/invoice')
      .send({
        client_id: savedClient.id,
        vehicle_id: savedVehicle.id,
        seller_id: savedSeller.id,
      });

    const saleId = saleResponse.body.data.invoiceId;
    const financing = await dataSource.manager.findOne(Financing, {
      where: { saleId: saleId },
    });

    return { saleId, financingId: financing!.id };
  }

  // ========== PATCH /sales/financings/:id/liquidate ==========

  describe('PATCH /sales/financings/:id/liquidate', () => {
    it('Deve liquidar o financiamento com sucesso (200)', async () => {
      const { financingId } = await createSaleAndGetFinancing();

      const response = await request(app.getHttpServer())
        .patch(`/sales/financings/${financingId}/liquidate`)
        .expect(200);

      expect(response.body.data).toHaveProperty('status', 'LIQUIDATED');
      expect(response.body.data).toHaveProperty('liquidatedAt');
      expect(response.body.data.liquidatedAt).not.toBeNull();
    });

    it('Deve retornar 404 se o financiamento não existir', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          '/sales/financings/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d/liquidate',
        )
        .expect(404);

      expect(response.body.code).toBe(404);
    });

    it('Deve retornar 422 se o financiamento já estiver liquidado', async () => {
      const { financingId } = await createSaleAndGetFinancing();

      // Liquidar a primeira vez
      await request(app.getHttpServer()).patch(
        `/sales/financings/${financingId}/liquidate`,
      );

      // Tentar liquidar novamente
      const response = await request(app.getHttpServer())
        .patch(`/sales/financings/${financingId}/liquidate`)
        .expect(422);

      expect(response.body.code).toBe(422);
      expect(response.body.message).toContain('já liquidado');
    });
  });

  // ========== PATCH /sales/financings/:id/reject ==========

  describe('PATCH /sales/financings/:id/reject', () => {
    it('Deve rejeitar o financiamento com sucesso e reverter saldo e veículo (200)', async () => {
      const creditLimitBefore = savedClient.creditLimit;
      const { financingId } = await createSaleAndGetFinancing();

      const response = await request(app.getHttpServer())
        .patch(`/sales/financings/${financingId}/reject`)
        .expect(200);

      expect(response.body.data).toHaveProperty('status', 'REJECTED');

      // Verificar que o saldo do cliente foi restaurado
      const updatedClient = await dataSource.manager.findOne(Client, {
        where: { id: savedClient.id },
      });
      expect(Number(updatedClient!.creditLimit)).toBe(creditLimitBefore);

      // Verificar que o veículo voltou a ficar disponível
      const updatedVehicle = await dataSource.manager.findOne(Vehicle, {
        where: { id: savedVehicle.id },
      });
      expect(updatedVehicle!.status).toBe(VehicleStatus.AVAILABLE);
    });

    it('Deve retornar 404 se o financiamento não existir', async () => {
      const response = await request(app.getHttpServer())
        .patch('/sales/financings/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d/reject')
        .expect(404);

      expect(response.body.code).toBe(404);
    });

    it('Deve retornar 422 se o financiamento já estiver rejeitado', async () => {
      const { financingId } = await createSaleAndGetFinancing();

      // Rejeitar a primeira vez
      await request(app.getHttpServer()).patch(
        `/sales/financings/${financingId}/reject`,
      );

      // Tentar rejeitar novamente
      const response = await request(app.getHttpServer())
        .patch(`/sales/financings/${financingId}/reject`)
        .expect(422);

      expect(response.body.code).toBe(422);
    });
  });

  // ========== GET /sales ==========

  describe('GET /sales', () => {
    it('Deve listar as vendas com sucesso (200)', async () => {
      await createSaleAndGetFinancing();

      const response = await request(app.getHttpServer())
        .get('/sales')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('clientName');
      expect(response.body.data[0]).toHaveProperty('vehicleModel');
      expect(response.body.data[0]).toHaveProperty('financingStatus');
    });

    it('Deve retornar array vazio quando não houver vendas (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/sales')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  // ========== GET /sales/financings ==========

  describe('GET /sales/financings', () => {
    it('Deve listar os financiamentos com sucesso (200)', async () => {
      await createSaleAndGetFinancing();

      const response = await request(app.getHttpServer())
        .get('/sales/financings')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('status');
      expect(response.body.data[0]).toHaveProperty('clientName');
      expect(response.body.data[0]).toHaveProperty('vehicleModel');
    });

    it('Deve retornar array vazio quando não houver financiamentos (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/sales/financings')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });
});
