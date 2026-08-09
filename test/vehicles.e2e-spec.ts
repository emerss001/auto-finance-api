import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '../src/shared/filters/http-exception.filter';

describe('Vehicles (e2e)', () => {
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
  });

  it('/vehicles (POST) - Deve criar um veículo com sucesso (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: 'Ford',
        model: 'Ka',
        year: 2020,
        chassi: '12345678901234567',
        price: 35000,
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.brand).toBe('Ford');
    expect(response.body.data.status).toBe('AVAILABLE'); // Verifica enum automático
  });

  it('/vehicles (POST) - Deve retornar erro (400) se o chassi não tiver 17 caracteres', async () => {
    const response = await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: 'Ford',
        model: 'Ka',
        year: 2020,
        chassi: '1234', // Chassi inválido
        price: 35000,
      })
      .expect(400);

    expect(response.body.code).toBe(400);
    // Verifica se a mensagem de erro específica do class-validator retornou
    expect(response.body.message).toContain('O chassi deve ter exatamente 17 caracteres');
  });

  it('/vehicles (POST) - Deve retornar erro (400) se o preço for negativo', async () => {
    const response = await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: 'Ford',
        model: 'Ka',
        year: 2020,
        chassi: '12345678901234567',
        price: -5000, // Preço inválido
      })
      .expect(400);

    expect(response.body.code).toBe(400);
    expect(response.body.message).toContain('O preço não pode ser negativo');
  });

  it('/vehicles (GET) - Deve listar os veículos com sucesso (200)', async () => {
    await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: 'Ford',
        model: 'Ka',
        year: 2020,
        chassi: '12345678901234567',
        price: 35000,
      });

    const response = await request(app.getHttpServer())
      .get('/vehicles')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
