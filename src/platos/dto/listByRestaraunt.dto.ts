import { IsInt, IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
export class listByRestaurantDto {
  @IsInt({
    message: 'El id debe ser un número entero',
  })
  @IsPositive({
    message: 'El id debe ser positivo',
  })
  @IsNotEmpty({
    message: 'El id es requerido',
  })
  id: number;

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

  @IsInt({
    message: 'La categoría debe ser un número entero',
  })
  @IsPositive({
    message: 'La categoría debe ser positivo',
  })
  @IsOptional()
  id_categoria?: number;
}
