import {
  Body,
  Controller,
  Post,
  Query,
  Get,
  Param,
  Headers,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmpleadosRestaurantesService } from '../../applications/use_cases/empleados_restaurantes.service';
import { CreateEmpleadoRestauranteDto } from '../dto/CreateEmpleadoRestaurante.dto';

@ApiTags('empleados_restaurantes')
@ApiBearerAuth()
@Controller('empleados-restaurantes')
export class EmpleadosRestaurantesController {
  constructor(
    private empleadoRestauranteService: EmpleadosRestaurantesService,
  ) {}
  @Post('/create')
  @ApiOperation({
    summary:
      'registrar un usuario de tipo empleado y asociarlo a un restaurante',
  })
  @ApiResponse({ status: 202, description: 'Usuario creado creado' })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para realizar esta acción',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async createRow(
    @Body() fieldsToCreate: CreateEmpleadoRestauranteDto,
    @Query('usuario')
    usuario,
  ) {
    return this.empleadoRestauranteService.create(fieldsToCreate, usuario);
  }

  @Get('/find-by-employee/:id')
  @ApiOperation({
    summary: 'Obtener id del restaurante asociado al id del empleado',
  })
  @ApiResponse({
    status: 202,
    description: 'Información de relación empleado restaurante',
  })
  @ApiResponse({ status: 400, description: 'Error de validación de campos' })
  @ApiResponse({
    status: 403,
    description: 'No posee permisos para realizar esta acción',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findByEmployee(@Param('id') id: number) {
    return this.empleadoRestauranteService.findByEmployee(id);
  }
}
