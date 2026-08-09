import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita a validação global e a transformação de tipos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );

  // Padroniza as respostas de erro
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Padroniza as respostas de sucesso
  app.useGlobalInterceptors(new TransformInterceptor());

  // Configuração do OpenAPI (Swagger)
  const config = new DocumentBuilder()
    .setTitle('Auto Finance API')
    .setDescription(
      'API para gerenciamento de financiamento automotivo. ' +
        'Permite o cadastro de clientes, veículos e vendedores, ' +
        'além do faturamento de vendas, gerenciamento de financiamentos ' +
        '(liquidação e rejeição) e consulta de operações.',
    )
    .setVersion('1.0.0')
    .addTag('Clientes', 'Gerenciamento de clientes e limites de crédito')
    .addTag('Veículos', 'Cadastro e consulta de veículos disponíveis')
    .addTag('Vendedores', 'Cadastro e consulta de vendedores')
    .addTag('Vendas', 'Faturamento de vendas e consulta de operações')
    .addTag('Financiamentos', 'Liquidação, rejeição e consulta de financiamentos')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  // Disponibiliza o JSON do OpenAPI em /api (sem o Swagger UI padrão)
  SwaggerModule.setup('api', app, documentFactory, {
    jsonDocumentUrl: '/api-json',
  });

  // Scalar API Reference em /api-docs
  app.use(
    '/api-docs',
    apiReference({
      theme: 'kepler',
      spec: {
        content: documentFactory(),
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
