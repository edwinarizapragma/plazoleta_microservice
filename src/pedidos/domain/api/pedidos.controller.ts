import { Controller, Post, Body, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PedidosService } from '../../application/pedidos.service';
import { createPedidoDto } from '../../dto/createPedido.dto';

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
}
