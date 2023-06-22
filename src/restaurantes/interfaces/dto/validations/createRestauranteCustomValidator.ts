import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'validarNombreRestaurante', async: false })
export class checkNombreRestaurante implements ValidatorConstraintInterface {
  validate(nombre: string): boolean {
    if (!isNaN(Number(nombre))) {
      return false;
    }
    return /\D/.test(nombre);
  }
}
