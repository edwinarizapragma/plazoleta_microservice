import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
export class listRestaurantDto {
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
}
