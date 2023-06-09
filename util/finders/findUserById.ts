import axios from 'axios';
import { axiosErrorHandler } from '../errors/axiosErrorsHandler';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
export async function getDataUserById(idUsuario: number) {
  const urlAuth = `${process.env.URL_USUARIOS_MICROSERVICE}/auth/sing-in`;
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
    console.log('Error, no se obtuvo el token');
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
    });
}
