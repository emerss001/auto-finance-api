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

  it('/clients (POST) - Deve retornar erro (409) se o documento já existir', async () => {
    // Cria o primeiro cliente
    await request(app.getHttpServer())
      .post('/clients')
      .send({
        name: 'Cliente Original',
        document: '11122233344',
        creditLimit: 50000,
      })
      .expect(201);

    // Tenta criar outro com o mesmo documento
    const response = await request(app.getHttpServer())
      .post('/clients')
      .send({
        name: 'Cliente Duplicado',
        document: '11122233344',
        creditLimit: 60000,
      })
      .expect(409);

    expect(response.body.code).toBe(409);
    expect(response.body.message).toContain('Já existe um cliente com este documento');
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

  it('/clients/:id (GET) - Deve retornar o cliente quando o ID existir (200)', async () => {
    // Cria um cliente
    const createResponse = await request(app.getHttpServer())
      .post('/clients')
      .send({
        name: 'Cliente Para Busca',
        document: '55566677788',
        creditLimit: 75000,
      });

    const clientId = createResponse.body.data.id;

    const response = await request(app.getHttpServer())
      .get(`/clients/${clientId}`)
      .expect(200);

    expect(response.body.data).toHaveProperty('id', clientId);
    expect(response.body.data).toHaveProperty('name', 'Cliente Para Busca');
    expect(response.body.data).toHaveProperty('document', '55566677788');
  });

  it('/clients/:id (GET) - Deve retornar erro (404) se o UUID for válido mas não existir', async () => {
    const response = await request(app.getHttpServer())
      .get('/clients/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')
      .expect(404);

    expect(response.body.code).toBe(404);
    expect(response.body.message).toContain('Cliente não encontrado');
  });

  it('/clients/:id (GET) - Deve retornar erro (400) se ID for um UUID inválido', async () => {
    const response = await request(app.getHttpServer())
      .get('/clients/invalid-uuid')
      .expect(400);

    expect(response.body.code).toBe(400);
    expect(response.body.message).toContain('Validation failed');
  });
});
