import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createPedidoDto } from '../dto/createPedido.dto';
import { listPedidosDto } from '../dto/listPedidos.dto';
import { PedidoRepository } from '../domain/repositories/PedidoRepository';
import { RestauranteRepository } from '../../restaurantes/domain/repositories/RestauranteRepository';
import * as dayjs from 'dayjs';
import { PlatoRepository } from '../../platos/domain/repositories/PlatoRepository';
import { validate } from 'class-validator';
import { getErrorMessages } from '../../../util/errors/getValidationErrorMessages';
import { EmpleadosRestaurantesService } from '../../empleados_restaurantes/applications/empleados_restaurantes.service';
@Injectable()
export class PedidosService {
  constructor(
    private pedidoRepository: PedidoRepository,
    private restauranteRepository: RestauranteRepository,
    private platoRepository: PlatoRepository,
    private empleadoRestauranteService: EmpleadosRestaurantesService,
  ) {}
  async createPedido(pedidoDetail: createPedidoDto, usuario) {
    if (usuario.nombreRol !== 'Cliente') {
      throw new HttpException(
        {
          message: 'No tiene permisos para crear el restaurante',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const validationPedidoDetail = await validate(pedidoDetail);
      if (validationPedidoDetail.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validationPedidoDetail),
        };
      }
      const searchRestaurante =
        await this.restauranteRepository.findRestaurantById(
          pedidoDetail.id_restaurante,
        );
      const errores: Array<string> = [];
      if ([null, undefined].includes(searchRestaurante)) {
        errores.push('El restaurante proporcionado no se encuentra registrado');
      }
      const pedidosEnProceso =
        await this.pedidoRepository.searchPedidoByEstadoAndCliente(usuario.id, [
          'en_preparacion',
          'pendiente',
          'listo',
        ]);
      if (![null, undefined].includes(pedidosEnProceso)) {
        errores.push(
          'Tienes pedidos aún en proceso, no puedes realizar mas pedidos',
        );
      }
      const platosIds = pedidoDetail.platos.map((x) => x.id_plato);
      const searchPlatosExistentes =
        await this.platoRepository.searchPlatosByIds(platosIds);

      if (searchPlatosExistentes.length !== pedidoDetail.platos.length) {
        errores.push(
          'No es posible crear el pedido ya que contiene platos no registrados o no se encuentran activos',
        );
      }
      const platoOtrosRestaurantes = searchPlatosExistentes.filter(
        (x) => x.id_restaurante !== pedidoDetail.id_restaurante,
      );
      if (platoOtrosRestaurantes.length) {
        errores.push(
          `El(Los) plato(s) ${platoOtrosRestaurantes
            .map((p) => p.nombre)
            .join(', ')} no pertenecen al restaurante seleccionado`,
        );
      }

      if (errores.length) {
        throw {
          message: 'Errores de validación',
          errors: errores,
        };
      }
      const pedidoToSave = {
        id_cliente: usuario.id,
        fecha: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        estado: 'pendiente',
        id_chef: null,
        id_restaurante: pedidoDetail.id_restaurante,
      };
      const pedidoPlatosToSave = pedidoDetail.platos.map((x) => {
        return {
          id_pedido: null,
          id_plato: x.id_plato,
          cantidad: x.cantidad,
        };
      });
      await this.pedidoRepository
        .createPedido(pedidoToSave, pedidoPlatosToSave)
        .catch((e) => {
          throw e;
        });
      return { message: 'Pedido creado exitosamente' };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message ? error.message : 'Error al crear el pedido',
          error: error.errors ? error.errors : error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listPedidos(filters: listPedidosDto, usuario) {
    try {
      const validationFilters = await validate(filters);
      if (validationFilters.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validationFilters),
        };
      }
      const searchEmployeeRestaurant =
        await this.empleadoRestauranteService.findByEmployee(usuario.id);
      if (!searchEmployeeRestaurant) {
        throw {
          message: 'Errores de validación',
          errors: [
            `El usuario ${usuario.nombre} ${usuario.apellido} no pertenece a ningún restaurante`,
          ],
        };
      }
      const options = {
        relations: {
          pedidos_platos: {
            plato: true,
          },
        },
        where: {
          id_restaurante: searchEmployeeRestaurant.id_restaurante,
        },
        order: {
          fecha: 'ASC',
        },
        skip: (filters.page - 1) * filters.perPage,
        take: filters.perPage,
      };
      if (filters.estado) {
        options.where['estado'] = filters.estado;
      }
      const orders = await this.pedidoRepository.listPedidos(options);
      return orders.map((order) => {
        return {
          id: order.id,
          id_cliente: order.id_cliente,
          fecha: order.fecha,
          estado: order.estado,
          id_chef: order.id_chef,
          id_restaurante: order.id_restaurante,
          platos: order.pedidos_platos.map((p) => {
            return { cantidad: p.cantidad, ...p.plato };
          }),
        };
      });
    } catch (error) {
      throw new HttpException(
        {
          message: error.message ? error.message : 'Error al crear el pedido',
          error: error.errors ? error.errors : error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
