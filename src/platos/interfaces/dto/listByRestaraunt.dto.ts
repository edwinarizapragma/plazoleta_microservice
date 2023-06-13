import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';
export class listByRestaurantDto {
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

  @Transform(
    ({ value }) => (typeof value === 'string' ? parseInt(value) : value),
    { toClassOnly: true },
  )
  @IsInt({
    message: 'La categoría debe ser un número entero',
  })
  @IsPositive({
    message: 'La categoría debe ser positivo',
  })
  @IsOptional()
  id_categoria?: number;
}
