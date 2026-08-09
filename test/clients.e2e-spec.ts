import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { TransformInterceptor } from '../src/shared/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '../src/shared/filters/http-exception.filter';

describe('Clients (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdClientId: string;

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

  it('/clients (POST) - Deve criar um cliente com sucesso (201)', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .send({
        name: 'Cliente E2E',
        document: '99988877766',
        creditLimit: 50000,
      })
      .expect(201);

    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.name).toBe('Cliente E2E');
    createdClientId = response.body.data.id;
  });

  it('/clients (POST) - Deve retornar erro (400) de validação por falta de campos', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .send({
        name: 'Cliente E2E Incompleto',
      })
      .expect(400);

    // Valida se o formato do erro está correto (GlobalExceptionFilter)
    expect(response.body.code).toBe(400);
    // document e creditLimit estão faltando
    expect(response.body.message).toEqual(expect.any(Array));
  });

  it('/clients (GET) - Deve listar os clientes com sucesso (200)', async () => {
    // Insere um cliente antes de listar
    await request(app.getHttpServer())
      .post('/clients')
      .send({
        name: 'Cliente E2E',
        document: '99988877766',
        creditLimit: 50000,
      });

    const response = await request(app.getHttpServer())
      .get('/clients')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('/clients/:id (GET) - Deve retornar erro (400) se ID for um UUID inválido', async () => {
    const response = await request(app.getHttpServer())
      .get('/clients/invalid-uuid')
      .expect(400);

    expect(response.body.code).toBe(400);
    expect(response.body.message).toContain('Validation failed');
  });
});
