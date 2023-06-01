import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlatosService } from '../../application/platos.service';
import { cretePlatoDto } from '../../dto/createPlato.dto';
@ApiTags('platos')
@Controller('platos')
export class PlatosController {
  constructor(private platoService: PlatosService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Crear plato' })
  @ApiResponse({ status: 202, description: 'Plato creado' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(@Body() fieldsToCretePlato: cretePlatoDto) {
    return this.platoService.createPlato(fieldsToCretePlato);
  }
}
