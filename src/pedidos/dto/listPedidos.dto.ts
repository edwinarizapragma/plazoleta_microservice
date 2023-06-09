import {
  IsInt,
  IsPositive,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class listPedidosDto {
  @Transform(
    ({ value }) => (typeof value === 'string' ? parseInt(value) : value),
    { toClassOnly: true },
  )
  @IsInt({
    message: 'La cantidad de registros por página debe ser un número entero',
  })
  @IsPositive({
    message: 'La cantidad de registros debe ser positivo',
  })
  @IsNotEmpty({
    message: 'La cantidad de registros por página es requerido',
  })
  perPage: number;

  @Transform(
    ({ value }) => (typeof value === 'string' ? parseInt(value) : value),
    { toClassOnly: true },
  )
  @IsInt({
    message: 'El número de página debe ser un número entero',
  })
  @IsPositive({
    message: 'El número de página debe ser positivo',
  })
  @IsNotEmpty({
    message: 'El número de página es requerido',
  })
  page: number;

  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @IsIn(['pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado'], {
    message:
      'El estado debe estar dentro de uno de los siguientes valores: pendiente, en_preparacion, listo, entregado, cancelado',
  })
  @IsOptional()
  estado?: string;
}
