import { DataSource, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PedidoEntity } from '../../../../database/typeorm/entities/Pedido.entity';
import { PedidosPlatosRepository } from './PedidosPlatosRepository';
@Injectable()
export class PedidoRepository extends Repository<PedidoEntity> {
  constructor(
    public readonly dataSource: DataSource,
    private pedidoPlatosRepository: PedidosPlatosRepository,
  ) {
    super(PedidoEntity, dataSource.createEntityManager());
  }

  async createPedido(pedidoToSave, pedidoPlatosToSave): Promise<PedidoEntity> {
    return this.dataSource.transaction(
      async (entityManager): Promise<PedidoEntity> => {
        try {
          const nuevoPedido = new PedidoEntity();
          Object.assign(nuevoPedido, pedidoToSave);
          const pedidoSaved: PedidoEntity = await entityManager.save(
            nuevoPedido,
          );
          for (const pedidoPlato of pedidoPlatosToSave) {
            pedidoPlato.id_pedido = pedidoSaved.id;
            await this.pedidoPlatosRepository.createPedidoPlatoWithTransaction(
              pedidoPlato,
              entityManager,
            );
          }
          return pedidoSaved;
        } catch (e) {
          throw e;
        }
      },
    );
  }

  async searchPedidoByEstadoAndCliente(
    id_cliente: number,
    estados: Array<string>,
  ): Promise<PedidoEntity> {
    return this.findOne({
      where: { id_cliente: id_cliente, estado: In(estados) },
    });
  }
}
