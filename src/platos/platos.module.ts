import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PlatosController } from './interfaces/controllers/platos.controller';
import { PlatosService } from './application/use_cases/platos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { PlatoEntity } from '../../database/typeorm/entities/Plato.entity';
import { CategoriaEntity } from '../../database/typeorm/entities/Categoria.entity';
import { PlatoRepository } from './infrastructure/repositories/PlatoRepository';
import { CategoriaRepository } from './infrastructure/repositories/CategoriaRepository';
import { RestauranteRepository } from '../restaurantes/infrastructure/repositories/RestauranteRepository';
import { TokenVerification } from '../../middleware/auth.middleware';
import { RestaurantesService } from '../restaurantes/application/use_cases/restaurantes.service';
import { UserMicroService } from '../../util/finders/findUserById';
@Module({
  imports: [
    TypeOrmModule.forFeature([RestauranteEntity, PlatoEntity, CategoriaEntity]),
  ],
  controllers: [PlatosController],
  providers: [
    PlatosService,
    RestaurantesService,
    UserMicroService,
    PlatoRepository,
    RestauranteRepository,
    CategoriaRepository,
  ],
})
export class PlatosModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenVerification).forRoutes('platos');
  }
}
