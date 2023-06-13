import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import * as dotenv from 'dotenv';
dotenv.config();
import { getDataUserById } from '../../../../../util/finders/findUserById';
@ValidatorConstraint({ name: 'validarUsuarioPropietario', async: false })
export class checkUsuarioIsPropietario implements ValidatorConstraintInterface {
  async validate(idUsuario: number): Promise<boolean> {
    const userFind = await getDataUserById(idUsuario);
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
