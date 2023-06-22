import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsPositive,
  IsNotEmpty,
  IsNumber,
  Matches,
  Validate,
} from 'class-validator';
import { checkNombreRestaurante } from './validations/createRestauranteCustomValidator';
import { Injectable } from '@nestjs/common';
@Injectable()
export class createRestauranteDto {
  @ApiProperty({
    example: 'Los pollos hermanos',
    description: 'Nombre del restaurante ',
    required: true,
  })
  @IsString({
    message: 'El nombre debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El nombre es requerido',
  })
  @Validate(checkNombreRestaurante, {
    message:
      'El nombre del restaurante puede contener números, pero no se permiten nombres con sólo números',
  })
  nombre: string;

  @ApiProperty({
    example: 'carrera 1 # 100-10',
    description: 'Dirección del restaurante ',
    required: true,
  })
  @IsString({
    message: 'La dirección debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'La dirección es requerida',
  })
  direccion: string;

  @ApiProperty({
    example: '31',
    description: 'id del usuario con rol administrador propietario',
    required: true,
  })
  @IsInt({
    message: 'El id debe ser un número entero',
  })
  @IsPositive({
    message: 'El id debe ser positivo',
  })
  @IsNotEmpty({
    message: 'El id de propietario es requerido',
  })
  id_propietario: number;

  @ApiProperty({
    example: '+573156487925',
    description: 'Número de telefono del restaurante',
    required: true,
  })
  @IsString({
    message: 'El número telefono debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El número telefono es requerido',
  })
  @Matches(/^\+?[0-9]{10,13}$/, {
    message:
      'El número de telefono debe tener entre 10 y 13 dígitos y puede contener el símbolo +',
  })
  telefono: string;

  @ApiProperty({
    example: '/storage/foto.jpg',
    description: 'Url del logo del restaurante',
    required: true,
  })
  @IsString({
    message: 'El url del logo debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El url del logo es requerido',
  })
  url_logo: string;

  @ApiProperty({
    example: '9545462145',
    description: 'Nit del restaurante',
    required: true,
  })
  @IsNumber({}, { message: 'El nit del restaurante debe ser un número' })
  @IsNotEmpty({
    message: 'El nit del restaurante  es requerido',
  })
  nit: number;
}
