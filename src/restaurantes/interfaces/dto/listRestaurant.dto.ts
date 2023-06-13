import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
export class listRestaurantDto {
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
}
