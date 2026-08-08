import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Erro interno no servidor';
    if (exceptionResponse) {
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = (exceptionResponse as any).message;
      }
    } else {
      // Se não tem exceptionResponse, é um erro não controlado (Bug, Banco, etc).
      this.logger.error(
        `[500 Internal Server Error] ${
          exception instanceof Error ? exception.message : 'Unknown Error'
        }`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // Retorna no mesmo padrão de envelopamento do TransformInterceptor
    response.status(status).json({
      code: status,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
