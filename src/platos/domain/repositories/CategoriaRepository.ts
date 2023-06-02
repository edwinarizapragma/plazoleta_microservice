import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CategoriaEntity } from '../../../../database/typeorm/entities/Categoria.entity';
// import { createRestauranteDto } from '../../dto/restaurante.dto';
@Injectable()
export class CategoriaRepository extends Repository<CategoriaEntity> {
  constructor(public readonly dataSource: DataSource) {
    super(CategoriaEntity, dataSource.createEntityManager());
  }
  async findOnlyIdCategory(id_categoria: number): Promise<CategoriaEntity> {
    return this.findOne({
      select: { id: true },
      where: {
        id: id_categoria,
      },
    });
  }
  /*async createNewRestaurant(
        fields: createRestauranteDto,
    ): Promise<RestauranteEntity> {
        const newRestaurant = new RestauranteEntity();
        Object.assign(newRestaurant, fields);
        return this.save(newRestaurant);
    }*/
}
