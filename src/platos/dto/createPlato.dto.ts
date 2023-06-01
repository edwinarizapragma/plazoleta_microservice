import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsPositive, IsNotEmpty } from 'class-validator';
export class cretePlatoDto {
  @ApiProperty({
    example: 'Arroz chino',
    description: 'Nombre del plato ',
    required: true,
  })
  @IsString({
    message: 'El nombre debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El nombre es requerido',
  })
  nombre: string;

  @ApiProperty({
    example: '1',
    description: 'id de la categoría a la que pertenece el plato',
    required: true,
  })
  @IsInt({
    message: 'El id de categoría debe ser un número entero',
  })
  @IsPositive({
    message: 'El id de categoría debe ser positivo',
  })
  @IsNotEmpty({
    message: 'El id de categoría es requerido',
  })
  id_categoria: number;

  @ApiProperty({
    example: 'Arroz chino con camarones, carne de cerdo, pollo y raíces',
    description: 'Descripción del plato',
    required: true,
  })
  @IsString({
    message: 'La descripción del plato debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'La descripción del plato es requerida',
  })
  descripcion: string;

  @ApiProperty({
    example: '35000',
    description: 'Precio del plato ',
    required: true,
  })
  @IsInt({
    message: 'El precio debe ser un número entero',
  })
  @IsPositive({
    message: 'El precio debe ser mayor a 0',
  })
  @IsNotEmpty({
    message: 'El precio del plato es requerido',
  })
  precio: number;

  @ApiProperty({
    example: '1',
    description: 'id del restaurante a la que pertenece el plato',
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
    example: '/storage/foto_arroz.png',
    description: 'Url de la imagen del plato',
    required: true,
  })
  @IsString({
    message: 'El url de la imagen debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El url de la imagen es requerido',
  })
  url_imagen: string;
}
