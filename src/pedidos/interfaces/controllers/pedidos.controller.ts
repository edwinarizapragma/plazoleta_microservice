import { Controller, Post, Body, Query, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PedidosService } from '../../application/use_cases/pedidos.service';
import { createPedidoDto } from '../dto/createPedido.dto';
import { listPedidosDto } from '../dto/listPedidos.dto';
import { takeOrderDto } from '../dto/takeOrderDto.dto';
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

  @Patch('/take-orders')
  @ApiOperation({ summary: 'Tomar uno o varios pedidos' })
  @ApiResponse({ status: 202, description: 'Pedidos tomados' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 401,
    description: 'No posee token o esta vencido',
  })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para tomar los pedidos',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async takeOrders(@Body() orders: takeOrderDto, @Query('usuario') usuario) {
    return await this.pedidoService.tomarPedidos(orders, usuario);
  }
}
