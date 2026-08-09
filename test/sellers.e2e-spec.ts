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
});
