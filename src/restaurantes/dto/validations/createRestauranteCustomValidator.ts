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
    const url = `${process.env.URL_USUARIOS_MICROSERVICE}/usuarios/find/${idUsuario}`;
    return axios
      .get(url)
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
