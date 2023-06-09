import { Controller, Post, Body, Query, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PedidosService } from '../../application/pedidos.service';
import { createPedidoDto } from '../../dto/createPedido.dto';
import { listPedidosDto } from '../../dto/listPedidos.dto';
@ApiTags('pedidos')
@ApiBearerAuth()
@Controller('pedidos')
export class PedidosController {
  constructor(private pedidoService: PedidosService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Crear pedido' })
  @ApiResponse({ status: 202, description: 'pedido creado con éxito' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 401,
    description: 'No posee token o esta vencido',
  })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para crear pedido',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async createPedido(
    @Body() pedidoDetail: createPedidoDto,
    @Query('usuario') usuario,
  ) {
    return this.pedidoService.createPedido(pedidoDetail, usuario);
  }

  @Get('/list')
  @ApiOperation({ summary: 'Listar pedidos' })
  @ApiResponse({ status: 202, description: 'Listado de pedidos' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 401,
    description: 'No posee token o esta vencido',
  })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para listar los pedidos',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
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
    name: 'estado',
    description: 'Estado por el que desea filtrar el listado de pedidos',
    required: false,
    example: null,
    type: 'string',
  })
  async listPedidos(
    @Query('usuario') usuario,
    @Query() params: listPedidosDto,
  ) {
    return this.pedidoService.listPedidos(params, usuario);
  }
}
