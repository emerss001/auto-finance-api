import { Injectable } from '@nestjs/common';

@Injectable()
export class VehiclesService {
  findAll() {
    return { message: 'Lista de veículos' };
  }
}
