import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
export class updateStatusPlatoDto {
  @ApiProperty({
    example: false,
    description: 'Nuevo estado del plato',
  })
  @IsBoolean({
    message: 'El nuevo estado del plato es requerido',
  })
  @IsOptional()
  activo: boolean;
}
