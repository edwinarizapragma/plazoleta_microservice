import { Module } from '@nestjs/common';
import { RestaurantesController } from '../api/restaurantes.controller';
import { RestaurantesService } from '../../application/restaurantes.service';
import { RestauranteEntity } from '../../../../database/typeorm/entities/Restaurante.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteRepository } from '../repositories/RestauranteRepository';
@Module({
  imports: [TypeOrmModule.forFeature([RestauranteEntity])],
  controllers: [RestaurantesController],
  providers: [RestaurantesService, RestauranteRepository],
})
export class RestaurantesModule {}
