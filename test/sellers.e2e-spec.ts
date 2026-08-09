import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '../src/shared/filters/http-exception.filter';

describe('Sellers (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

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

  beforeEach(async () => {
    await dataSource.query('DELETE FROM financings');
    await dataSource.query('DELETE FROM sales');
    await dataSource.query('DELETE FROM vehicles');
    await dataSource.query('DELETE FROM clients');
    await dataSource.query('DELETE FROM sellers');
  });

  it('/sellers (POST) - Deve criar um vendedor com sucesso (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/sellers')
      .send({
        name: 'Vendedor E2E',
        commissionRate: 5,
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe('Vendedor E2E');
    expect(Number(response.body.data.commissionRate)).toBe(5);
  });

  it('/sellers (POST) - Deve criar um vendedor com comissão zero (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/sellers')
      .send({
        name: 'Vendedor Sem Comissão',
        commissionRate: 0,
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(Number(response.body.data.commissionRate)).toBe(0);
  });

  it('/sellers (POST) - Deve retornar erro (400) se o nome estiver faltando', async () => {
    const response = await request(app.getHttpServer())
      .post('/sellers')
      .send({
        commissionRate: 5,
      })
      .expect(400);

    expect(response.body.code).toBe(400);
  });

  it('/sellers (POST) - Deve retornar erro (400) se a comissão for negativa', async () => {
    const response = await request(app.getHttpServer())
      .post('/sellers')
      .send({
        name: 'Vendedor Inválido',
        commissionRate: -5,
      })
      .expect(400);

    expect(response.body.code).toBe(400);
  });

  it('/sellers (POST) - Deve retornar erro (400) se a comissão estiver faltando', async () => {
    const response = await request(app.getHttpServer())
      .post('/sellers')
      .send({
        name: 'Vendedor Sem Comissão',
      })
      .expect(400);

    expect(response.body.code).toBe(400);
  });

  it('/sellers (GET) - Deve listar os vendedores com sucesso (200)', async () => {
    // Insere um vendedor antes de listar
    await request(app.getHttpServer()).post('/sellers').send({
      name: 'Vendedor E2E',
      commissionRate: 5,
    });

    const response = await request(app.getHttpServer())
      .get('/sellers')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('/sellers (GET) - Deve retornar array vazio quando não houver vendedores (200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/sellers')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });

  describe('GET /sellers/:id/commission', () => {
    it('deve retornar resumo de comissões com sucesso (200)', async () => {
      // 1. Criar vendedor
      const sellerRes = await request(app.getHttpServer())
        .post('/sellers')
        .send({ name: 'Vendedor Comissao', commissionRate: 10 })
        .expect(201);
      const sellerId = sellerRes.body.data.id;

      // Buscar comissões sem vendas deve retornar 0
      const summaryRes = await request(app.getHttpServer())
        .get(
          `/sellers/${sellerId}/commission?startDate=2020-01-01&endDate=2030-12-31`,
        )
        .expect(200);

      expect(summaryRes.body.data.totalSales).toBe(0);
      expect(summaryRes.body.data.totalCommission).toBe(0);
    });

    it('deve retornar 404 se o vendedor não existir', async () => {
      const response = await request(app.getHttpServer())
        .get(
          '/sellers/invalid-uuid/commission?startDate=2020-01-01&endDate=2030-12-31',
        )
        .expect(400);

      expect(response.body.code).toBe(400);

      // Testando com UUID válido mas inexistente
      const res404 = await request(app.getHttpServer())
        .get(
          '/sellers/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d/commission?startDate=2020-01-01&endDate=2030-12-31',
        )
        .expect(404);

      expect(res404.body.code).toBe(404);
    });

    it('deve retornar 400 se as datas não forem fornecidas', async () => {
      // 1. Criar vendedor
      const sellerRes = await request(app.getHttpServer())
        .post('/sellers')
        .send({ name: 'Vendedor Comissao', commissionRate: 10 })
        .expect(201);
      const sellerId = sellerRes.body.data.id;

      const res400 = await request(app.getHttpServer())
        .get(`/sellers/${sellerId}/commission`)
        .expect(400);

      expect(res400.body.code).toBe(400);
      expect(res400.body.message).toEqual(expect.any(Array));
    });
  });
});
