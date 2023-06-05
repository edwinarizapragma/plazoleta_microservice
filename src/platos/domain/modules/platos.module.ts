import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PlatosController } from '../api/platos.controller';
import { PlatosService } from '../../application/platos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteEntity } from '../../../../database/typeorm/entities/Restaurante.entity';
import { PlatoEntity } from '../../../../database/typeorm/entities/Plato.entity';
import { CategoriaEntity } from '../../../../database/typeorm/entities/Categoria.entity';
import { PlatoRepository } from '../repositories/PlatoRepository';
import { CategoriaRepository } from '../repositories/CategoriaRepository';
import { RestauranteRepository } from '../../../restaurantes/domain/repositories/RestauranteRepository';
import { TokenVerification } from '../../../../middleware/auth.middleware';
@Module({
  imports: [
    TypeOrmModule.forFeature([RestauranteEntity, PlatoEntity, CategoriaEntity]),
  ],
  controllers: [PlatosController],
  providers: [
    PlatosService,
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
