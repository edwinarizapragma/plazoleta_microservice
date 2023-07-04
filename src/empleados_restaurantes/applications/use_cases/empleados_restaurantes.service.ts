import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import { getErrorMessages } from '../../../../util/errors/getValidationErrorMessages';
import { CreateEmpleadoRestauranteDto } from '../../interfaces/dto/CreateEmpleadoRestaurante.dto';
import { EmpleadosRestaurantesRepository } from '../../infrastructure/repositories/EmpleadoRestauranteRepository';
import { CreateEmpleadoService } from '../../infrastructure/axios/createEmpleado.service';
import { RestaurantesService } from '../../../restaurantes/application/use_cases/restaurantes.service';
@Injectable()
export class EmpleadosRestaurantesService {
  constructor(
    private restauranteService: RestaurantesService,
    private empleadoRestauranteRepository: EmpleadosRestaurantesRepository,
    private createEmpleadoService: CreateEmpleadoService,
  ) {}

  async getRestaurantById(id: number): Promise<any> {
    return this.restauranteService.findRestaurant(id);
  }
  // async create(fieldsToCreate: CreateEmpleadoRestauranteDto, token usuario) {
  async create(fieldsToCreate: CreateEmpleadoRestauranteDto, usuario) {
    if (usuario.nombreRol !== 'Propietario') {
      throw new HttpException(
        {
          message: 'No tiene permisos para realizar esta acción',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const validationCreate = await validate(fieldsToCreate);
      if (validationCreate.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validationCreate),
        };
      }
      const errores: Array<string> = [];

      const searchRestaurant = await this.getRestaurantById(
        fieldsToCreate.id_restaurante,
      );
      if ([null, undefined].includes(searchRestaurant)) {
        errores.push('El restaurante proporcionado no se encuentra registrado');
      }

      if (searchRestaurant && searchRestaurant.id_propietario !== usuario.id) {
        errores.push('Usted no es propietario del restaurante que proporciono');
      }

      if (errores.length) {
        throw {
          message: 'Errores de validación',
          errors: errores,
        };
      }
      const userEmployee = {
        nombre: fieldsToCreate.nombre,
        apellido: fieldsToCreate.apellido,
        numero_documento: fieldsToCreate.numero_documento,
        celular: fieldsToCreate.celular,
        fecha_nacimiento: fieldsToCreate.fecha_nacimiento,
        correo: fieldsToCreate.correo,
        clave: fieldsToCreate.clave,
        tipo: 'Empleado',
      };
      const employeeCreated = await this.createEmpleadoService.createEmployee(
        userEmployee,
      );
      // const employeeCreated = await this.createEmpleadoService.createEmployee(
      //   userEmployee,
      //   token
      // );
      await this.empleadoRestauranteRepository
        .createRow({
          id_empleado: employeeCreated.id,
          id_restaurante: fieldsToCreate.id_restaurante,
        })
        .catch((err) => {
          throw err;
        });
      return {
        message: `${userEmployee.nombre} ${userEmployee.apellido} ha sido registrado y asociado al restaurante exitosamente`,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message
            ? error.message
            : 'Error al relacionar al empleado con el restaurante',
          error: error.errors ? error.errors : error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findDataEmployeeId(id: number) {
    return this.empleadoRestauranteRepository.findByEmployeeId(id);
  }
  async findByEmployee(id: number): Promise<any> {
    if (!id) {
      throw new HttpException(
        {
          message: 'El id del empleado es requerido',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const record = await this.findDataEmployeeId(id);
    if ([null, undefined].includes(record)) {
      throw new HttpException(
        {
          message: 'El empleado no se encuentra asociado a ningún restaurante',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return record;
  }
}
