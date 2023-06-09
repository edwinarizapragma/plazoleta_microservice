import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { axiosErrorHandler } from '../../../../../util/errors/axiosErrorsHandler';
@Injectable()
export class UsuariosMicroserviceService {
  async createEmployee(employeeData, token) {
    const url = `${process.env.URL_USUARIOS_MICROSERVICE}/usuarios/create`;
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
      });
  }
}
