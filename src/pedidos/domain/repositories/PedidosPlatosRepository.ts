import { DataSource, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PedidoPLatoEntity } from '../../../../database/typeorm/entities/PedidoPlato.entity';
@Injectable()
export class PedidosPlatosRepository extends Repository<PedidoPLatoEntity> {
  constructor(public readonly dataSource: DataSource) {
    super(PedidoPLatoEntity, dataSource.createEntityManager());
  }

  async createPedidoPlatoWithTransaction(
    fields,
    entityManager,
  ): Promise<PedidoPLatoEntity> {
    const nuevoPedidoPlato = new PedidoPLatoEntity();
    Object.assign(nuevoPedidoPlato, fields);
    return entityManager.save(nuevoPedidoPlato);
  }
}
