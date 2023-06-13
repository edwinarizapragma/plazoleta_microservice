import { Module, MiddlewareConsumer } from '@nestjs/common';
import { RestaurantesController } from './interfaces/controllers/restaurantes.controller';
import { RestaurantesService } from './application/use_cases/restaurantes.service';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteRepository } from './infrastructure/repositories/RestauranteRepository';
import { TokenVerification } from '../../middleware/auth.middleware';
@Module({
  imports: [TypeOrmModule.forFeature([RestauranteEntity])],
  controllers: [RestaurantesController],
  providers: [RestaurantesService, RestauranteRepository],
})
export class RestaurantesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenVerification).forRoutes('restaurantes');
  }
}
