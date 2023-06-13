import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsPositive,
  IsNotEmpty,
  IsString,
  IsDate,
  IsEmail,
  Matches,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
export class CreateEmpleadoRestauranteDto {
  @ApiProperty({
    example: 'Edwin Tobias',
    description: 'Nombre del usuario ',
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
    example: 'Ariza Tellez',
    description: 'Apellido del usuario ',
    required: true,
  })
  @IsString({
    message: 'El apellido debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El apellido es requerido',
  })
  apellido: string;

  @ApiProperty({
    example: '12345687987',
    description: 'Número de identificación del usuario',
    required: true,
  })
  @IsInt({
    message: 'El número de identificación debe ser un número entero',
  })
  @IsPositive({
    message: 'El número de identificación debe ser positivo',
  })
  @IsNotEmpty({
    message: 'El número de identificación es requerido',
  })
  numero_documento: number;

  @ApiProperty({
    example: '+573156487925',
    description: 'Número de celular del usuario',
    required: true,
  })
  @IsString({
    message: 'El número celular debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'El número celular es requerido',
  })
  @Matches(/^\+?[0-9]{10,13}$/, {
    message:
      'El número de celular debe tener entre 10 y 13 dígitos y puede contener el símbolo +',
  })
  celular: string;

  @ApiProperty({
    example: '1997-08-23',
    description: 'Fecha de nacimiento del usuario en format YYYY-MM-DD',
    required: true,
  })
  @Transform(
    ({ value }) => (typeof value === 'string' ? new Date(value) : value),
    { toClassOnly: true },
  )
  @Type(() => Date)
  @IsDate({
    message: 'La fecha de nacimiento debe ser una fecha',
  })
  @IsDate({
    message: 'La fecha de nacimiento debe ser una fecha',
  })
  @IsNotEmpty({
    message: 'La fecha de nacimiento es requerida',
  })
  fecha_nacimiento: Date;

  @ApiProperty({
    example: 'ejemplo@ejemplo.com',
    description: 'Correo electrónico con formato valido',
    required: true,
  })
  @IsString({
    message: 'El correo debe ser una cadena de texto',
  })
  @IsEmail(
    {},
    {
      message: 'El correo debe ser un correo valido',
    },
  )
  correo: string;

  @ApiProperty({
    example: '132453',
    description: 'Contraseña para usuario',
    required: true,
  })
  @IsString({
    message: 'La contraseña debe ser una cadena de texto',
  })
  @IsNotEmpty({
    message: 'La contraseña es requerida',
  })
  clave: string;

  @ApiProperty({
    example: 1,
    description: 'id del restaurante',
    required: true,
  })
  @IsInt({ message: 'El id del restaurante debe ser un número entero' })
  @IsPositive({ message: 'El id del restaurante debe ser positivo' })
  @IsNotEmpty({
    message: 'El id del restaurante es requerido',
  })
  id_restaurante: number;
}
