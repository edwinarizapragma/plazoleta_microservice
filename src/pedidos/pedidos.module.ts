import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PedidosController } from './interfaces/controllers/pedidos.controller';
import { PedidosService } from './application/use_cases/pedidos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoEntity } from '../../database/typeorm/entities/Pedido.entity';
import { PedidoPLatoEntity } from '../../database/typeorm/entities/PedidoPlato.entity';
import { TokenVerification } from '../middleware/auth.middleware';
import { PedidoRepository } from './infrastructure/repositories/PedidoRepository';
import { PedidosPlatosRepository } from './infrastructure/repositories/PedidosPlatosRepository';
import { RestauranteRepository } from '../restaurantes/infrastructure/repositories/RestauranteRepository';
import { PlatoRepository } from '../platos/infrastructure/repositories/PlatoRepository';
import { EmpleadosRestaurantesService } from '../empleados_restaurantes/applications/use_cases/empleados_restaurantes.service';
import { EmpleadosRestaurantesRepository } from '../empleados_restaurantes/infrastructure/repositories/EmpleadoRestauranteRepository';
import { CreateEmpleadoService } from '../empleados_restaurantes/infrastructure/axios/createEmpleado.service';
import { EmpleadoRestauranteEntity } from '../../database/typeorm/entities/EmpeladoRestaurante.entity';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { MensajeriaMicroServiceService } from './infrastructure/axios/mensajeria-micro.service';
import { UserMicroService } from '../../util/finders/findUserById';
import { RestaurantesService } from '../restaurantes/application/use_cases/restaurantes.service';
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
    RestaurantesService,
    PedidoRepository,
    RestauranteRepository,
    PedidosPlatosRepository,
    PlatoRepository,
    EmpleadosRestaurantesService,
    EmpleadosRestaurantesRepository,
    CreateEmpleadoService,
    MensajeriaMicroServiceService,
    UserMicroService,
  ],
})
export class PedidosModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenVerification).forRoutes('pedidos');
  }
}
