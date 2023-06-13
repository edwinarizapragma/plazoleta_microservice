import { MiddlewareConsumer, Module } from '@nestjs/common';
import { EmpleadosRestaurantesController } from './interfaces/controllers/empleados_restaurantes.controller';
import { EmpleadosRestaurantesService } from './applications/use_cases/empleados_restaurantes.service';
import { EmpleadoRestauranteEntity } from '../../database/typeorm/entities/EmpeladoRestaurante.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenVerification } from '../../middleware/auth.middleware';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { RestauranteRepository } from '../restaurantes/infrastructure/repositories/RestauranteRepository';
import { EmpleadosRestaurantesRepository } from './infrastructure/repositories/EmpleadoRestauranteRepository';
import { UsuariosMicroserviceService } from './infrastructure/axios/usuarios_micro.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([EmpleadoRestauranteEntity, RestauranteEntity]),
  ],
  controllers: [EmpleadosRestaurantesController],
  providers: [
    EmpleadosRestaurantesService,
    EmpleadosRestaurantesRepository,
    RestauranteRepository,
    UsuariosMicroserviceService,
  ],
})
export class EmpleadosRestaurantesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenVerification).forRoutes('empleados-restaurantes');
  }
}
