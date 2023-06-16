import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PedidosController } from './interfaces/controllers/pedidos.controller';
import { PedidosService } from './application/use_cases/pedidos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoEntity } from '../../database/typeorm/entities/Pedido.entity';
import { PedidoPLatoEntity } from '../../database/typeorm/entities/PedidoPlato.entity';
import { TokenVerification } from '../../middleware/auth.middleware';
import { PedidoRepository } from './infrastructure/repositories/PedidoRepository';
import { PedidosPlatosRepository } from './infrastructure/repositories/PedidosPlatosRepository';
import { RestauranteRepository } from '../restaurantes/infrastructure/repositories/RestauranteRepository';
import { PlatoRepository } from '../platos/infrastructure/repositories/PlatoRepository';
import { EmpleadosRestaurantesService } from '../empleados_restaurantes/applications/use_cases/empleados_restaurantes.service';
import { EmpleadosRestaurantesRepository } from '../empleados_restaurantes/infrastructure/repositories/EmpleadoRestauranteRepository';
import { UsuariosMicroserviceService } from '../empleados_restaurantes/infrastructure/axios/usuarios_micro.service';
import { EmpleadoRestauranteEntity } from '../../database/typeorm/entities/EmpeladoRestaurante.entity';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { MensajeriaMicroServiceService } from './infrastructure/axios/mensajeria-micro.service';
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
    MensajeriaMicroServiceService,
  ],
})
export class PedidosModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenVerification).forRoutes('pedidos');
  }
}
