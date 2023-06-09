import { MiddlewareConsumer, Module } from '@nestjs/common';
import { EmpleadosRestaurantesController } from '../api/empleados_restaurantes.controller';
import { EmpleadosRestaurantesService } from '../../applications/empleados_restaurantes.service';
import { EmpleadoRestauranteEntity } from '../../../../database/typeorm/entities/EmpeladoRestaurante.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenVerification } from '../../../../middleware/auth.middleware';
import { RestauranteEntity } from '../../../../database/typeorm/entities/Restaurante.entity';
import { RestauranteRepository } from '../../../restaurantes/domain/repositories/RestauranteRepository';
import { EmpleadosRestaurantesRepository } from '../repositories/EmpleadoRestauranteRepository';
import { UsuariosMicroserviceService } from '../infrastructure/axios/usuarios_micro.service';
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
