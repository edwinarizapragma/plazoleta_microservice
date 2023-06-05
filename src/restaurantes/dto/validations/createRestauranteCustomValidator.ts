import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import axios from 'axios';
import { axiosErrorHandler } from '../../../../util/errors/axiosErrorsHandler';
import * as dotenv from 'dotenv';
dotenv.config();

@ValidatorConstraint({ name: 'validarUsuarioPropietario', async: false })
export class checkUsuarioIsPropietario implements ValidatorConstraintInterface {
  async getUsuario(idUsuario: number) {
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
        headers: {
          authorization: `Bearer ${infoAuth.token}`,
        },
      })
      .then(({ data }) => {
        return data;
      })
      .catch((error) => {
        return axiosErrorHandler(error);
      });
  }
  async validate(idUsuario: number): Promise<boolean> {
    const userFind = await this.getUsuario(idUsuario);
    return (
      userFind.hasOwnProperty('rol') && userFind.rol.nombre === 'Propietario'
    );
  }
}

@ValidatorConstraint({ name: 'validarNombreRestaurante', async: false })
export class checkNombreRestaurante implements ValidatorConstraintInterface {
  validate(nombre: string): boolean {
    if (!isNaN(Number(nombre))) {
      return false;
    }
    return /\D/.test(nombre);
  }
}
