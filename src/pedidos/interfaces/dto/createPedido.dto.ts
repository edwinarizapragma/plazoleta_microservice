import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PlatoListDto {
  @ApiProperty({
    example: 1,
    description: 'id del plato',
    required: true,
  })
  @IsInt({ message: 'El id plato debe ser un número entero' })
  @IsPositive({ message: 'El id plato debe ser positivo' })
  @IsNotEmpty({
    message: 'El plato es requerido',
  })
  id_plato: number;

  @ApiProperty({
    example: 2,
    description: 'Cantidad del plato',
    required: true,
  })
  @IsInt({ message: 'La cantidad del plato debe ser un número entero' })
  @IsPositive({ message: 'La cantidad del plato debe ser positiva' })
  @IsNotEmpty({
    message: 'La cantidad del plato es requerido',
  })
  cantidad: number;
}
export class createPedidoDto {
  @ApiProperty({
    example: '1',
    description: 'id del restaurante a la que pertenece el pedido',
    required: true,
  })
  @IsInt({
    message: 'El id del restaurante debe ser un número entero',
  })
  @IsPositive({
    message: 'El id del restaurante debe ser positivo',
  })
  @IsNotEmpty({
    message: 'El id del restaurante es requerido',
  })
  id_restaurante: number;

  @ApiProperty({
    type: [PlatoListDto],
    example: [
      {
        id_plato: 1,
        cantidad: 2,
      },
    ],
    description: 'Array de objetos que representan los platos del pedido',
    required: true,
  })
  @IsArray({ message: 'El campo "platos" debe ser un array' })
  @ArrayNotEmpty({
    message: 'El listado de platos a pedir no puede estar vacío',
  })
  @ValidateNested({ each: true })
  @Type(() => PlatoListDto)
  platos: PlatoListDto[];
}
