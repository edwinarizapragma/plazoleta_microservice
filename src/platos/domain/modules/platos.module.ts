import { Module } from '@nestjs/common';
import { PlatosController } from '../api/platos.controller';
import { PlatosService } from '../../application/platos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteEntity } from '../../../../database/typeorm/entities/Restaurante.entity';
import { PlatoEntity } from '../../../../database/typeorm/entities/Plato.entity';
import { CategoriaEntity } from '../../../../database/typeorm/entities/Categoria.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([RestauranteEntity, PlatoEntity, CategoriaEntity]),
  ],
  controllers: [PlatosController],
  providers: [PlatosService],
})
export class PlatosModule {}
