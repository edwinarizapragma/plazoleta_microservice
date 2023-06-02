import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PlatoEntity } from '../../../../database/typeorm/entities/Plato.entity';
import { createPlatoDto } from '../../dto/createPlato.dto';
@Injectable()
export class PlatoRepository extends Repository<PlatoEntity> {
  constructor(public readonly dataSource: DataSource) {
    super(PlatoEntity, dataSource.createEntityManager());
  }

  async createNewPlato(fields: createPlatoDto): Promise<PlatoEntity> {
    const newPlato = new PlatoEntity();
    Object.assign(newPlato, fields);
    return this.save(newPlato);
  }

  async findPLatoById(id: number): Promise<PlatoEntity> {
    return await this.findOneBy({ id });
  }

  async updatePlato(plato: PlatoEntity): Promise<PlatoEntity> {
    return await this.save(plato);
  }
}
