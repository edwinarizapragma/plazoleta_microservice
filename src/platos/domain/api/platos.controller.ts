import { Controller, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { PlatosService } from '../../application/platos.service';
import { createPlatoDto } from '../../dto/createPlato.dto';
import { updatePlatoDto } from '../../dto/updatePlato.dto';

@ApiTags('platos')
@Controller('platos')
export class PlatosController {
  constructor(private platoService: PlatosService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Crear plato' })
  @ApiResponse({ status: 202, description: 'Plato creado' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(@Body() fieldsToCretePlato: createPlatoDto) {
    return this.platoService.createPlato(fieldsToCretePlato);
  }
  @Patch('/update/:id')
  @ApiOperation({ summary: 'Actualizar plato existente' })
  @ApiResponse({ status: 202, description: 'Plato actualizado' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @ApiParam({
    name: 'id',
    description: 'id del plato ',
    required: true,
    type: 'number',
    example: 1,
  })
  async update(
    @Param('id') id: number,
    @Body() fieldsToUpdate: updatePlatoDto,
  ) {
    return this.platoService.updatePlato(id, fieldsToUpdate);
  }
}
