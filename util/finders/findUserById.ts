// import axios from 'axios';
// import { axiosErrorHandler } from '../errors/axiosErrorsHandler';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class UserMicroService {
  async getDataUserById(idUsuario: number) {
    return {
      id: 89,
      nombre: 'Sarah',
      apellido: 'Smith',
      numero_documento: 31578902,
      celular: '+573155680091',
      correo: 'sarahsmith@example.com',
      id_rol: 4,
      rol: {
        id: 1,
        nombre: 'Cliente',
      },
    };
    /*const urlAuth = `${process.env.URL_USUARIOS_MICROSERVICE}/auth/sing-in`;
    const infoAuth = await axios
      .post(urlAuth, {
        correo: process.env.EMAIL_SING_IN_MANUAL,
        clave: process.env.PASSWORD_SING_IN_MANUAL,
      })
      .then(({ data }) => {
        return data;
      })
      .catch((error) => {
        return axiosErrorHandler(error);
      });
    if (!infoAuth.hasOwnProperty('token')) {
      return false;
    }
    const url = `${process.env.URL_USUARIOS_MICROSERVICE}/usuarios/find/${idUsuario}`;
    return axios
      .get(url, {
        headers: { authorization: `Bearer ${infoAuth.token}` },
      })
      .then(({ data }) => {
        return data;
      })
      .catch((err) => {
        const e = axiosErrorHandler(err);
        throw new HttpException(
          {
            message: 'Error al obtener información del usuario',
            error: e,
          },
          e.statusCode ? e.statusCode : HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });*/
  }
}
