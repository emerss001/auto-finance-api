import { Injectable } from '@nestjs/common';

@Injectable()
export class SalesService {
  findAll() {
    return { message: 'Lista de vendas' };
  }
}
