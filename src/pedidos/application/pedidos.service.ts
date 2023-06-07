import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createPedidoDto } from '../dto/createPedido.dto';
import { PedidoRepository } from '../domain/repositories/PedidoRepository';
import { RestauranteRepository } from '../../restaurantes/domain/repositories/RestauranteRepository';
import * as dayjs from 'dayjs';
import { PlatoRepository } from '../../platos/domain/repositories/PlatoRepository';
import { validate } from 'class-validator';
import { getErrorMessages } from '../../../util/errors/getValidationErrorMessages';
@Injectable()
export class PedidosService {
  constructor(
    private pedidoRepository: PedidoRepository,
    private restauranteRepository: RestauranteRepository,
    private platoRepository: PlatoRepository,
  ) {}
  async createPedido(pedidoDetail: createPedidoDto, usuario) {
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
          error,
        },
        error.message && error.message === 'Errores de validación'
          ? HttpStatus.BAD_REQUEST
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
