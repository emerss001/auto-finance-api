import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode;

    // Define a default message based on the HTTP method or status code
    let message = 'Operação realizada com sucesso';
    if (statusCode === 201) {
      message = 'Registro criado com sucesso';
    }

    return next.handle().pipe(
      map((data) => ({
        code: statusCode,
        message,
        data: data || null,
      })),
    );
  }
}
