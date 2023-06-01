import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlatoEntity } from '../../../database/typeorm/entities/Plato.entity';
import { Repository } from 'typeorm';
import { cretePlatoDto } from '../dto/createPlato.dto';
import { validate } from 'class-validator';
import { CategoriaEntity } from '../../../database/typeorm/entities/Categoria.entity';
import { RestauranteEntity } from '../../../database/typeorm/entities/Restaurante.entity';
import { updatePlatoDto } from '../dto/updatePlato.dto';

@Injectable()
export class PlatosService {
  constructor(
    @InjectRepository(PlatoEntity)
    private platoRepository: Repository<PlatoEntity>,
    @InjectRepository(CategoriaEntity)
    private categoriaRepository: Repository<CategoriaEntity>,
    @InjectRepository(RestauranteEntity)
    private restauranteRepository: Repository<RestauranteEntity>,
  ) {}

  async categoryNotExists(id_categoria: number): Promise<boolean> {
    const searchCategoria = await this.categoriaRepository.findOne({
      select: { id: true },
      where: {
        id: id_categoria,
      },
    });
    return [null, undefined].includes(searchCategoria);
  }

  async restaurantNotExists(id_restaurante: number): Promise<boolean> {
    const searchRestaurante = await this.restauranteRepository.findOne({
      select: { id: true },
      where: {
        id: id_restaurante,
      },
    });
    return [null, undefined].includes(searchRestaurante);
  }

  async createPlato(fields: cretePlatoDto): Promise<any> {
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
      const newPlato = new PlatoEntity();
      Object.assign(newPlato, fields);
      newPlato.activo = true;
      const { nombre, precio, descripcion } = await this.platoRepository.save(
        newPlato,
      );
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
    return await this.platoRepository.findOne({ where: { id } });
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
      const platoToUpdate = await this.findPLatoById(id);
      if (fields.precio) {
        platoToUpdate.precio = fields.precio;
      }
      if (fields.descripcion) {
        platoToUpdate.descripcion = fields.descripcion;
      }
      const { precio, descripcion } = await this.platoRepository.save(
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
