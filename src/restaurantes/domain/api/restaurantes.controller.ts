import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RestaurantesService } from '../../application/restaurantes.service';
import { createRestauranteDto } from '../../dto/restaurante.dto';
@ApiTags('restaurantes')
@Controller('restaurantes')
export class RestaurantesController {
  constructor(private restaurantesService: RestaurantesService) {}
  @Post('/create')
  @ApiOperation({ summary: 'Crear restaurante' })
  @ApiResponse({ status: 202, description: 'Restaurante creado' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async create(@Body() fieldsToCreate: createRestauranteDto) {
    return await this.restaurantesService.create(fieldsToCreate);
  }
}
