import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class orderDeliveryDto {
  @ApiProperty({
    example: 'P-4578',
    description: 'Código de verificación',
  })
  @IsString({
    message: 'El código debe ser una cadena de texto',
  })
  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  codigo: string;
}
