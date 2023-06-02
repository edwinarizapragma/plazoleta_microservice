import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createRestauranteDto } from '../dto/restaurante.dto';
import { validate } from 'class-validator';
import { RestauranteRepository } from '../domain/repositories/RestauranteRepository';
@Injectable()
export class RestaurantesService {
  constructor(private restauranteRepository: RestauranteRepository) {}

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
      const { nombre, direccion, nit } =
        await this.restauranteRepository.createNewRestaurant(fieldsToCreate);
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
