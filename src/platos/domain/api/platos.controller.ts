import { Controller, Post, Patch, Param, Body, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlatosService } from '../../application/platos.service';
import { createPlatoDto } from '../../dto/createPlato.dto';
import { updatePlatoDto } from '../../dto/updatePlato.dto';
import { updateStatusPlatoDto } from '../../dto/updateStatusPlato.dto';
@ApiTags('platos')
@ApiBearerAuth()
@Controller('platos')
export class PlatosController {
  constructor(private platoService: PlatosService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Crear plato' })
  @ApiResponse({ status: 202, description: 'Plato creado' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para crear plato',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(
    @Body() fieldsToCretePlato: createPlatoDto,
    @Query('usuario') usuario,
  ) {
    return this.platoService.createPlato(fieldsToCretePlato, usuario);
  }
  @Patch('/update/:id')
  @ApiOperation({ summary: 'Actualizar plato existente' })
  @ApiResponse({ status: 202, description: 'Plato actualizado' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para modificar plato',
  })
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
    @Query('usuario') usuario,
  ) {
    return this.platoService.updatePlato(id, fieldsToUpdate, usuario);
  }

  @Patch('/update-status/:id')
  @ApiOperation({ summary: 'Actualizar estado del plato existente' })
  @ApiResponse({ status: 202, description: 'Plato actualizado' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para modificar plato',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @ApiParam({
    name: 'id',
    description: 'id del plato ',
    required: true,
    type: 'number',
    example: 1,
  })
  async updateStatus(
    @Param('id') id: number,
    @Body() fieldsToUpdate: updateStatusPlatoDto,
    @Query('usuario') usuario,
  ) {
    return this.platoService.updateStatusPlato(id, fieldsToUpdate, usuario);
  }
}
