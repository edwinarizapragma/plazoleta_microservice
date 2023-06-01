import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RestauranteEntity } from '../../../database/typeorm/entities/Restaurante.entity';
import { createRestauranteDto } from '../dto/restaurante.dto';
import { validate } from 'class-validator';
@Injectable()
export class RestaurantesService {
  constructor(
    @InjectRepository(RestauranteEntity)
    private restauranteRepository: Repository<RestauranteEntity>,
  ) {}

  async create(fieldsToCreate: createRestauranteDto) {
    try {
      const validationErrors = await validate(fieldsToCreate);

      if (validationErrors.length) {
        throw {
          message: 'Errores de validación',
          errors: validationErrors
            .map((error) => Object.values(error.constraints))
            .flat(),
        };
      }
      const newRestaurant = new RestauranteEntity();
      Object.assign(newRestaurant, fieldsToCreate);
      const { nombre, direccion, nit } = await this.restauranteRepository.save(
        newRestaurant,
      );
      return { nombre, direccion, nit };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message
            ? error.message
            : 'Error al crear el restaurante',
          error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
