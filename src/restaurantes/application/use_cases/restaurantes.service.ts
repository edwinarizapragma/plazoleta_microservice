import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createRestauranteDto } from '../../interfaces/dto/createRestaurant.dto';
import { listRestaurantDto } from '../../interfaces/dto/listRestaurant.dto';
import { validate } from 'class-validator';
import { RestauranteRepository } from '../../infrastructure/repositories/RestauranteRepository';
import { getErrorMessages } from '../../../../util/errors/getValidationErrorMessages';
import { UserMicroService } from '../../../../util/finders/findUserById';
@Injectable()
export class RestaurantesService {
  constructor(
    private restauranteRepository: RestauranteRepository,
    private userMicroService: UserMicroService,
  ) {}

  async validateUserIsOwner(idUsuario: number): Promise<boolean> {
    const userFind = await this.userMicroService.getDataUserById(idUsuario);
    return (
      userFind.hasOwnProperty('rol') && userFind.rol.nombre === 'Propietario'
    );
  }

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
          errors: getErrorMessages(validationErrors),
        };
      }
      if (await this.validateUserIsOwner(fieldsToCreate.id_propietario)) {
        throw {
          message: 'Errores de validación',
          errors: [
            'El id proporcionado no existe o no corresponde a un usuario con rol propietario',
          ],
        };
      }
      await this.restauranteRepository
        .createNewRestaurant(fieldsToCreate)
        .catch((err) => {
          throw err;
        });
      return { message: 'restaurante creado exitosamente' };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message
            ? error.message
            : 'Error al crear el restaurante',
          error: error.errors ? error.errors : error,
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
          errors: getErrorMessages(validationPaginate),
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
          error: error.errors ? error.errors : error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findRestaurant(id: number): Promise<any> {
    return this.restauranteRepository.findRestaurantById(id);
  }
}
