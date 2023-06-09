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
import { EmpleadosRestaurantesService } from '../../../empleados_restaurantes/applications/empleados_restaurantes.service';
import { EmpleadosRestaurantesRepository } from '../../../empleados_restaurantes/domain/repositories/EmpleadoRestauranteRepository';
import { UsuariosMicroserviceService } from '../../../empleados_restaurantes/domain/infrastructure/axios/usuarios_micro.service';
import { EmpleadoRestauranteEntity } from '../../../../database/typeorm/entities/EmpeladoRestaurante.entity';
import { RestauranteEntity } from '../../../../database/typeorm/entities/Restaurante.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PedidoEntity,
      PedidoPLatoEntity,
      EmpleadoRestauranteEntity,
      RestauranteEntity,
    ]),
  ],
  controllers: [PedidosController],
  providers: [
    PedidosService,
    PedidoRepository,
    RestauranteRepository,
    PedidosPlatosRepository,
    PlatoRepository,
    EmpleadosRestaurantesService,
    EmpleadosRestaurantesRepository,
    UsuariosMicroserviceService,
  ],
})
export class PedidosModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenVerification).forRoutes('pedidos');
  }
}
