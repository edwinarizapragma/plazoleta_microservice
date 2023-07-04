import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { axiosErrorHandler } from '../../../../util/errors/axiosErrorsHandler';
@Injectable()
export class CreateEmpleadoService {
  // async createEmployee(employeeData, token) {
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
    /*const url = `${process.env.URL_USUARIOS_MICROSERVICE}/usuarios/create`;
    return await axios
      .post(url, employeeData, {
        headers: { authorization: token },
      })
      .then(({ data }) => {
        return data;
      })
      .catch((err) => {
        const e = axiosErrorHandler(err);
        throw {
          message: 'Error al crear el usuario empleado',
          errors: e.detail ? e.detail : e,
        };
      });*/
  }
}
