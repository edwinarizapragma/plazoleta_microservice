import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createPlatoDto } from '../../interfaces/dto/createPlato.dto';
import { validate } from 'class-validator';
import { updatePlatoDto } from '../../interfaces/dto/updatePlato.dto';
import { updateStatusPlatoDto } from '../../interfaces/dto/updateStatusPlato.dto';
import { PlatoRepository } from '../../infrastructure/repositories/PlatoRepository';
import { CategoriaRepository } from '../../infrastructure/repositories/CategoriaRepository';
import { RestauranteRepository } from '../../../restaurantes/infrastructure/repositories/RestauranteRepository';
import { listByRestaurantDto } from '../../interfaces/dto/listByRestaraunt.dto';
import { getErrorMessages } from '../../../../util/errors/getValidationErrorMessages';
import { RestaurantesService } from '../../../restaurantes/application/use_cases/restaurantes.service';
@Injectable()
export class PlatosService {
  constructor(
    private readonly platoRepository: PlatoRepository,
    private readonly categoriaRepository: CategoriaRepository,
    private readonly restauranteRepository: RestauranteRepository,
    private readonly restauranteService: RestaurantesService,
  ) {}

  async categoryNotExists(id_categoria: number): Promise<boolean> {
    const searchCategory = await this.categoriaRepository.findOnlyIdCategory(
      id_categoria,
    );
    return [null, undefined].includes(searchCategory);
  }

  async getRestaurantById(id: number): Promise<any> {
    return this.restauranteService.findRestaurant(id);
  }

  async createPlato(fields: createPlatoDto, usuario) {
    if (usuario.nombreRol !== 'Propietario') {
      throw new HttpException(
        {
          message: 'No tiene permisos para crear el plato',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const validationErrors = await validate(fields);
      if (validationErrors.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validationErrors),
        };
      }
      const errores: Array<string> = [];
      if (await this.categoryNotExists(fields.id_categoria)) {
        errores.push('La categoría proporcionada no se encuentra registrada');
      }
      const searchRestaurante = await this.getRestaurantById(
        fields.id_restaurante,
      );
      if ([null, undefined].includes(searchRestaurante)) {
        errores.push('El restaurante proporcionado no se encuentra registrado');
      }
      if (errores.length) {
        throw {
          message: 'Errores de validación',
          errors: errores,
        };
      }
      if (searchRestaurante.id_propietario !== usuario.id) {
        throw {
          message: 'Errores de validación',
          errors: [
            `El usuario ${usuario.nombre} no es propietario del restaurante proporcionado`,
          ],
        };
      }
      fields.activo = true;
      // const { nombre, precio, descripcion } =
      //   await this.platoRepository.createNewPlato(fields);
      // return { nombre, precio, descripcion };
      await this.platoRepository.createNewPlato(fields).catch((e) => {
        throw e;
      });
      return { message: 'Plato creado exitosamente' };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message ? error.message : 'Error al crear el plato',
          error: error.errors ? error.errors : error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPLatoById(id: number): Promise<any> {
    return await this.platoRepository.findById(id);
  }

  async updatePlato(id: number, fields: updatePlatoDto, usuario) {
    if (usuario.nombreRol !== 'Propietario') {
      throw new HttpException(
        {
          message: 'No tiene permisos para actualizar el plato',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const validationErrors = await validate(fields);
      if (validationErrors.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validationErrors),
        };
      }
      const platoToUpdate = await this.findPLatoById(id);
      if (!platoToUpdate) {
        throw { message: 'El id del plato proporcionado no existe' };
      }

      if (platoToUpdate.restaurante.id_propietario !== usuario.id) {
        throw {
          message: 'Errores de validación',
          errors: [
            `El usuario ${usuario.nombre} no es propietario del restaurante asociado al plato que desea modificar`,
          ],
        };
      }
      // propiedades diferentes a las aceptadas
      if (
        Object.keys(fields).some(
          (key) => !['descripcion', 'precio'].includes(key),
        )
      ) {
        throw {
          message:
            'Solo esta permitido actualizar el precio y la descripción del plato',
        };
      }
      if (fields.precio) {
        platoToUpdate.precio = fields.precio;
      }
      if (fields.descripcion) {
        platoToUpdate.descripcion = fields.descripcion;
      }
      await this.platoRepository.updatePlato(platoToUpdate).catch((e) => {
        throw e;
      });
      return { message: 'Plato actualizado correctamente' };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message
            ? error.message
            : 'Error al actualizar el plato',
          error: error.errors ? error.errors : error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateStatusPlato(id: number, fields: updateStatusPlatoDto, usuario) {
    if (usuario.nombreRol !== 'Propietario') {
      throw new HttpException(
        {
          message:
            'No tiene permisos para actualizar el estado del plato plato',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const validation = await validate(fields);
      if (validation.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validation),
        };
      }
      const platoToUpdate = await this.findPLatoById(id);
      if ([null, undefined].includes(platoToUpdate)) {
        throw { message: 'El plato proporcionado no existe' };
      }

      if (platoToUpdate.restaurante.id_propietario !== usuario.id) {
        throw {
          message: 'Errores de validación',
          errors: [
            `El usuario ${usuario.nombre} no es propietario del restaurante asociado al plato que desea modificar`,
          ],
        };
      }
      // propiedades diferentes a las aceptadas
      if (Object.keys(fields).some((key) => !['activo'].includes(key))) {
        throw {
          message: 'Solo esta permitido actualizar el estado del plato',
        };
      }
      platoToUpdate.activo = fields.activo;
      await this.platoRepository.updatePlato(platoToUpdate);
      return {
        message: `Se ${
          platoToUpdate.activo ? 'activo' : 'desactivo'
        } el plato exitosamente`,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message
            ? error.message
            : 'Error al actualizar el estado del plato',
          error: error.errors ? error.errors : error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listByRestaurant(id: number, params: listByRestaurantDto, usuario) {
    if (usuario.nombreRol !== 'Cliente') {
      throw new HttpException(
        {
          message: 'No tiene permisos para crear el restaurante',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const validationParams = await validate(params);

      if (validationParams.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validationParams),
        };
      }
      const searchRestaurant = await this.getRestaurantById(id);
      if ([null, undefined].includes(searchRestaurant)) {
        throw {
          message: 'Errores de validación',
          errors: [`El restaurante proporcionado no se encuentra registrado`],
        };
      }
      const options = {
        select: {
          nombre: true,
          descripcion: true,
          precio: true,
          url_imagen: true,
        },
        where: {
          activo: true,
          id_restaurante: id,
        },
        order: {
          nombre: 'ASC',
        },
        skip: (params.page - 1) * params.perPage,
        take: params.perPage,
      };
      if (params.id_categoria) {
        options.where['id_categoria'] = params.id_categoria;
      }
      return this.platoRepository.listByRestaurantId(options).catch((err) => {
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
}
