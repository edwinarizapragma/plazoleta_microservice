import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RestauranteEntity } from '../../../../database/typeorm/entities/Restaurante.entity';
import { createRestauranteDto } from '../../interfaces/dto/createRestaurant.dto';
@Injectable()
export class RestauranteRepository extends Repository<RestauranteEntity> {
  constructor(public readonly dataSource: DataSource) {
    super(RestauranteEntity, dataSource.createEntityManager());
  }

  async createNewRestaurant(
    fields: createRestauranteDto,
  ): Promise<RestauranteEntity> {
    const newRestaurant = new RestauranteEntity();
    Object.assign(newRestaurant, fields);
    return this.save(newRestaurant);
  }

  async findOnlyIdRestaurant(
    id_restaurante: number,
  ): Promise<RestauranteEntity> {
    return await this.findOne({
      select: { id: true },
      where: {
        id: id_restaurante,
      },
    });
  }
  async findRestaurantById(id_restaurante: number): Promise<RestauranteEntity> {
    return await this.findOneBy({ id: id_restaurante });
  }

  async paginateRestaurants(options): Promise<RestauranteEntity[]> {
    return await this.find(options);
  }
}
