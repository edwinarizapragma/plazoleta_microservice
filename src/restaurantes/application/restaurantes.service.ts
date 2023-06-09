import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createRestauranteDto } from '../dto/createRestaurant.dto';
import { listRestaurantDto } from '../dto/listRestaurant.dto';
import { validate } from 'class-validator';
import { RestauranteRepository } from '../domain/repositories/RestauranteRepository';
@Injectable()
export class RestaurantesService {
  constructor(private restauranteRepository: RestauranteRepository) {}

  async create(fieldsToCreate: createRestauranteDto, usuario) {
    if (usuario.nombreRol !== 'Admin') {
      throw new HttpException(
        {
          message: 'No tiene permisos para crear el restaurante',
        },
        HttpStatus.FORBIDDEN,
      );
    }
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

  async listRestaurants(paginate: listRestaurantDto, usuario) {
    if (usuario.nombreRol !== 'Cliente') {
      throw new HttpException(
        {
          message: 'No tiene permisos para crear el restaurante',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const validationPaginate = await validate(paginate);

      if (validationPaginate.length) {
        throw {
          message: 'Errores de validación',
          errors: validationPaginate
            .map((error) => Object.values(error.constraints))
            .flat(),
        };
      }
      const options = {
        select: {
          nombre: true,
          url_logo: true,
        },
        order: {
          nombre: 'ASC',
        },
        skip: (paginate.page - 1) * paginate.perPage,
        take: paginate.perPage,
      };
      return await this.restauranteRepository
        .paginateRestaurants(options)
        .catch((err) => {
          throw err;
        });
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
