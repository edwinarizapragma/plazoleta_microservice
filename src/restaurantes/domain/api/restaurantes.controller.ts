import { Controller, Post, Body, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RestaurantesService } from '../../application/restaurantes.service';
import { createRestauranteDto } from '../../dto/restaurante.dto';
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
}
