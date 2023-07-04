import { MiddlewareConsumer, Module } from '@nestjs/common';
import { EmpleadosRestaurantesController } from './interfaces/controllers/empleados_restaurantes.controller';
import { EmpleadosRestaurantesService } from './applications/use_cases/empleados_restaurantes.service';
import { EmpleadoRestauranteEntity } from '../../database/typeorm/entities/EmpeladoRestaurante.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenVerification } from '../../middleware/auth.middleware';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { RestauranteRepository } from '../restaurantes/infrastructure/repositories/RestauranteRepository';
import { EmpleadosRestaurantesRepository } from './infrastructure/repositories/EmpleadoRestauranteRepository';
import { CreateEmpleadoService } from './infrastructure/axios/createEmpleado.service';
import { RestaurantesService } from '../restaurantes/application/use_cases/restaurantes.service';
import { UserMicroService } from '../../util/finders/findUserById';
@Module({
  imports: [
    TypeOrmModule.forFeature([EmpleadoRestauranteEntity, RestauranteEntity]),
  ],
  controllers: [EmpleadosRestaurantesController],
  providers: [
    EmpleadosRestaurantesService,
    RestaurantesService,
    EmpleadosRestaurantesRepository,
    RestauranteRepository,
    CreateEmpleadoService,
    UserMicroService,
  ],
})
export class EmpleadosRestaurantesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenVerification).forRoutes('empleados-restaurantes');
  }
}
