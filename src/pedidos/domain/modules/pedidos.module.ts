import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PedidosController } from '../api/pedidos.controller';
import { PedidosService } from '../../application/pedidos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoEntity } from '../../../../database/typeorm/entities/Pedido.entity';
import { PedidoPLatoEntity } from '../../../../database/typeorm/entities/PedidoPlato.entity';
import { TokenVerification } from '../../../../middleware/auth.middleware';
import { PedidoRepository } from '../repositories/PedidoRepository';
import { PedidosPlatosRepository } from '../repositories/PedidosPlatosRepository';
import { RestauranteRepository } from '../../../restaurantes/domain/repositories/RestauranteRepository';
import { PlatoRepository } from '../../../platos/domain/repositories/PlatoRepository';
@Module({
  imports: [TypeOrmModule.forFeature([PedidoEntity, PedidoPLatoEntity])],
  controllers: [PedidosController],
  providers: [
    PedidosService,
    PedidoRepository,
    RestauranteRepository,
    PedidosPlatosRepository,
    PlatoRepository,
  ],
})
export class PedidosModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenVerification).forRoutes('pedidos');
  }
}
