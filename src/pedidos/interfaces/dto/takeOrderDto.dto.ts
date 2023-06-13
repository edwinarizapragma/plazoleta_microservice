import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsInt, IsPositive } from 'class-validator';

export class takeOrderDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'id(s) de los pedidos a tomar',
    required: true,
  })
  @ArrayMinSize(1, {
    message: 'Debe proporcionar al menos un pedido',
  })
  @IsInt({
    message: 'Los elementos del array deben ser números enteros',
    each: true,
  })
  @IsPositive({
    message: 'Los elementos del array deben ser positivos',
    each: true,
  })
  pedidos: number[];
}
