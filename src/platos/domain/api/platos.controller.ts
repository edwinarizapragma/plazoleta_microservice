import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PlatosService } from '../../application/platos.service';
import { createPlatoDto } from '../../dto/createPlato.dto';
import { updatePlatoDto } from '../../dto/updatePlato.dto';
import { updateStatusPlatoDto } from '../../dto/updateStatusPlato.dto';
import { listByRestaurantDto } from '../../dto/listByRestaraunt.dto';
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

  @Get('/list-by-restaurant/:id')
  @ApiOperation({ summary: 'Listar platos por el id del restaurante' })
  @ApiResponse({
    status: 202,
    description: 'Litado de platos                             ',
  })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para modificar plato',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @ApiParam({
    name: 'id',
    description: 'id del restaurante ',
    required: true,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    description: 'Cantidad de registros por página',
    required: true,
    example: 10,
    type: 'number',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: true,
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'id_categoria',
    description: 'id de la categoría que desea filtrar',
    required: false,
    example: null,
    type: 'number',
  })
  async listByRestaurant(
    @Param('id') id: number,
    @Query('perPage', ParseIntPipe) perPage: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('id_categoria') id_categoria?: number,
  ) {
    const params: listByRestaurantDto = { id, perPage, page, id_categoria };
    return this.platoService.listByRestaurant(params);
  }
}
