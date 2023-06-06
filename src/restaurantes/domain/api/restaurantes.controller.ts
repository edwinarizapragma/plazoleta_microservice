import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RestaurantesService } from '../../application/restaurantes.service';
import { createRestauranteDto } from '../../dto/createRestaurant.dto';
import { listRestaurantDto } from '../../dto/listRestaurant.dto';
@ApiTags('restaurantes')
@ApiBearerAuth()
@Controller('restaurantes')
export class RestaurantesController {
  constructor(private restaurantesService: RestaurantesService) {}
  @Post('/create')
  @ApiOperation({ summary: 'Crear restaurante' })
  @ApiResponse({ status: 202, description: 'Restaurante creado' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para crear restaurante',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(
    @Body() fieldsToCreate: createRestauranteDto,
    @Query('usuario') usuario,
  ) {
    return await this.restaurantesService.create(fieldsToCreate, usuario);
  }

  @Get('/list/:perPage/:page')
  @ApiOperation({ summary: 'Listar restaurantes alfabéticamente' })
  @ApiResponse({ status: 202, description: 'Listado de restaurantes' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 403,
    description: 'Error de inicio de sesión o token invalido',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @ApiParam({
    name: 'perPage',
    description: 'Cantidad de registros por página',
    required: true,
    example: 10,
    type: 'number',
  })
  @ApiParam({
    name: 'page',
    description: 'Número de página',
    required: true,
    example: 1,
    type: 'number',
  })
  async list(
    @Param('perPage', ParseIntPipe) perPage: number,
    @Param('page', ParseIntPipe) page: number,
  ) {
    const paginate: listRestaurantDto = { perPage, page };
    return await this.restaurantesService.listRestaurants(paginate);
  }
}
