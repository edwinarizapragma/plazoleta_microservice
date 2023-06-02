import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createPlatoDto } from '../dto/createPlato.dto';
import { validate } from 'class-validator';
import { updatePlatoDto } from '../dto/updatePlato.dto';
import { PlatoRepository } from '../domain/repositories/PlatoRepository';
import { CategoriaRepository } from '../domain/repositories/CategoriaRepository';
import { RestauranteRepository } from '../../restaurantes/domain/repositories/RestauranteRepository';
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

  async restaurantNotExists(id_restaurante: number): Promise<boolean> {
    const searchRestaurante =
      await this.restauranteRepository.findOnlyIdRestaurant(id_restaurante);
    return [null, undefined].includes(searchRestaurante);
  }

  async createPlato(fields: createPlatoDto): Promise<any> {
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
      if (await this.restaurantNotExists(fields.id_restaurante)) {
        errores.push('El restaurante proporcionado no se encuentra registrado');
      }
      if (errores.length) {
        throw {
          message: 'Errores de validación',
          errors: errores,
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
  async platoNotExists(id: number): Promise<boolean> {
    const result = await this.findPLatoById(id);
    return [null, undefined].includes(result);
  }
  async updatePlato(id: number, fields: updatePlatoDto) {
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
      if (await this.platoNotExists(id)) {
        throw { message: 'El id del plato proporcionado no existe' };
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
      const platoToUpdate = await this.findPLatoById(id);
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
}
