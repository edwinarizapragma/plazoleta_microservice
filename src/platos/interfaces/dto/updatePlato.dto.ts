import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsPositive, IsOptional } from 'class-validator';
export class updatePlatoDto {
  @ApiProperty({
    example: 'Arroz chino con camarones',
    description: 'Descripción del plato',
  })
  @IsString({
    message: 'La descripción del plato debe ser una cadena de texto',
  })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    example: '39000',
    description: 'Precio del plato ',
  })
  @IsInt({
    message: 'El precio debe ser un número entero',
  })
  @IsPositive({
    message: 'El precio debe ser mayor a 0',
  })
  @IsOptional()
  precio?: number;
}
