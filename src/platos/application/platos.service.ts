import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createPlatoDto } from '../dto/createPlato.dto';
import { validate } from 'class-validator';
import { updatePlatoDto } from '../dto/updatePlato.dto';
import { updateStatusPlatoDto } from '../dto/updateStatusPlato.dto';
import { PlatoRepository } from '../domain/repositories/PlatoRepository';
import { CategoriaRepository } from '../domain/repositories/CategoriaRepository';
import { RestauranteRepository } from '../../restaurantes/domain/repositories/RestauranteRepository';
import { listByRestaurantDto } from '../dto/listByRestaraunt.dto';
@Injectable()
export class PlatosService {
  constructor(
    private platoRepository: PlatoRepository,
    private categoriaRepository: CategoriaRepository,
    private restauranteRepository: RestauranteRepository,
  ) {}

  async categoryNotExists(id_categoria: number): Promise<boolean> {
    const searchCategory = await this.categoriaRepository.findOnlyIdCategory(
      id_categoria,
    );
    return [null, undefined].includes(searchCategory);
  }

  async createPlato(fields: createPlatoDto, usuario): Promise<any> {
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
          errors: validationErrors
            .map((error) => Object.values(error.constraints))
            .flat(),
        };
      }
      const errores: Array<string> = [];
      if (await this.categoryNotExists(fields.id_categoria)) {
        errores.push('La categoría proporcionada no se encuentra registrada');
      }
      const searchRestaurante =
        await this.restauranteRepository.findRestaurantById(
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
      const { nombre, precio, descripcion } =
        await this.platoRepository.createNewPlato(fields);
      return { nombre, precio, descripcion };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message ? error.message : 'Error al crear el plato',
          error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findPLatoById(id: number): Promise<any> {
    return await this.platoRepository.findPLatoById(id);
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
          errors: validationErrors
            .map((error) => Object.values(error.constraints))
            .flat(),
        };
      }
      const platoToUpdate = await this.findPLatoById(id);
      if ([null, undefined].includes(platoToUpdate)) {
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
      const { precio, descripcion } = await this.platoRepository.updatePlato(
        platoToUpdate,
      );
      return { precio, descripcion };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message ? error.message : 'Error al crear el plato',
          error,
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
          errors: validation
            .map((error) => Object.values(error.constraints))
            .flat(),
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
          message: error.message ? error.message : 'Error al crear el plato',
          error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listByRestaurant(params: listByRestaurantDto) {
    try {
      const validationParams = await validate(params);

      if (validationParams.length) {
        throw {
          message: 'Errores de validación',
          errors: validationParams
            .map((error) => Object.values(error.constraints))
            .flat(),
        };
      }
      const searchRestaurant =
        await this.restauranteRepository.findRestaurantById(params.id);
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
          id_restaurante: params.id,
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
      return await this.platoRepository
        .listByRestaurantId(options)
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
