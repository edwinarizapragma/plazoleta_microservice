import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { axiosErrorHandler } from '../../../../util/errors/axiosErrorsHandler';
@Injectable()
export class CreateEmpleadoService {
  async createEmployee(employeeData) {
    return {
      id: 1,
      nombre: 'Sarah',
      apellido: 'Smith',
      numero_documento: 31578902,
      celular: '+573155680091',
      correo: 'sarahsmith@example.com',
      id_rol: 4,
      rol: {
        id: 1,
        nombre: 'Empleado',
      },
    };
  }
}
