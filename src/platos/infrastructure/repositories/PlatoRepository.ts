import { DataSource, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PlatoEntity } from '../../../../database/typeorm/entities/Plato.entity';
@Injectable()
export class PlatoRepository extends Repository<PlatoEntity> {
  constructor(public readonly dataSource: DataSource) {
    super(PlatoEntity, dataSource.createEntityManager());
  }

  async findById(id: number): Promise<PlatoEntity> {
    return await this.findOne({
      relations: {
        restaurante: true,
      },
      where: {
        id,
      },
    });
  }

  async listByRestaurantId(options): Promise<PlatoEntity[]> {
    return await this.find(options);
  }

  async searchPlatosByIds(ids: Array<number>): Promise<PlatoEntity[]> {
    return this.find({
      select: {
        nombre: true,
        id_restaurante: true,
      },
      where: {
        activo: true,
        id: In(ids),
      },
    });
  }

  async createNewPlato(fields): Promise<PlatoEntity> {
    const newPlato = new PlatoEntity();
    Object.assign(newPlato, fields);
    return this.save(newPlato);
  }

  async updatePlato(plato: PlatoEntity): Promise<PlatoEntity> {
    return await this.save(plato);
  }
}
