import { DataSource, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EmpleadoRestauranteEntity } from '../../../../database/typeorm/entities/EmpeladoRestaurante.entity';
@Injectable()
export class EmpleadosRestaurantesRepository extends Repository<EmpleadoRestauranteEntity> {
  constructor(public readonly dataSource: DataSource) {
    super(EmpleadoRestauranteEntity, dataSource.createEntityManager());
  }

  async createRow(fields): Promise<EmpleadoRestauranteEntity> {
    const newRow = new EmpleadoRestauranteEntity();
    Object.assign(newRow, fields);
    return this.save(newRow);
  }

  async findByEmployeeId(id: number): Promise<EmpleadoRestauranteEntity> {
    return this.findOne({
      where: {
        id_empleado: id,
      },
    });
  }
}
