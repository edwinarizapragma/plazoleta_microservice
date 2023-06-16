import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createPedidoDto } from '../../interfaces/dto/createPedido.dto';
import { listPedidosDto } from '../../interfaces/dto/listPedidos.dto';
import { PedidoRepository } from '../../infrastructure/repositories/PedidoRepository';
import { RestauranteRepository } from '../../../restaurantes/infrastructure/repositories/RestauranteRepository';
import * as dayjs from 'dayjs';
import { PlatoRepository } from '../../../platos/infrastructure/repositories/PlatoRepository';
import { validate } from 'class-validator';
import { getErrorMessages } from '../../../../util/errors/getValidationErrorMessages';
import { EmpleadosRestaurantesService } from '../../../empleados_restaurantes/applications/use_cases/empleados_restaurantes.service';
import { takeOrderDto } from '../../interfaces/dto/takeOrderDto.dto';
import { getDataUserById } from '../../../../util/finders/findUserById';
import { MensajeriaMicroServiceService } from '../../infrastructure/axios/mensajeria-micro.service';
import { orderDeliveryDto } from '../../interfaces/dto/orderDelivery.dto';
@Injectable()
export class PedidosService {
  constructor(
    private pedidoRepository: PedidoRepository,
    private restauranteRepository: RestauranteRepository,
    private platoRepository: PlatoRepository,
    private empleadoRestauranteService: EmpleadosRestaurantesService,
    private mensajeriaService: MensajeriaMicroServiceService,
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

  async employeeHasRestaurant(usuario) {
    const employeeRestaurant =
      await this.empleadoRestauranteService.findByEmployee(usuario.id);
    if (!employeeRestaurant) {
      throw {
        message: 'Errores de validación',
        errors: [
          `El usuario ${usuario.nombre} ${usuario.apellido} no pertenece a ningún restaurante`,
        ],
      };
    }
    return employeeRestaurant;
  }
  async listPedidos(filters: listPedidosDto, usuario) {
    if (usuario.nombreRol !== 'Empleado') {
      throw new HttpException(
        {
          message: 'No tiene permisos para realizar esta acción',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const validationFilters = await validate(filters);
      if (validationFilters.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validationFilters),
        };
      }
      const searchEmployeeRestaurant = await this.employeeHasRestaurant(
        usuario,
      );
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

  async tomarPedidos(
    body: takeOrderDto,
    usuario,
  ): Promise<{ message: string } | HttpException> {
    if (usuario.nombreRol !== 'Empleado') {
      throw new HttpException(
        {
          message: 'No tiene permisos para realizar esta acción',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const validationFilters = await validate(body);
      if (validationFilters.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validationFilters),
        };
      }
      const searchEmployeeRestaurant = await this.employeeHasRestaurant(
        usuario,
      );
      const ordersData = await this.pedidoRepository.getPedidosById(
        body.pedidos,
        searchEmployeeRestaurant.id_restaurante,
      );
      if (ordersData.length !== body.pedidos.length) {
        throw {
          message: 'Errores de validación',
          errors: [
            'Algunos pedidos no pertenecen al restaurante que posee el empleado o ya se encuentran en preparación o cancelados',
          ],
        };
      }
      await this.pedidoRepository
        .assignChef(ordersData, usuario.id)
        .catch((err) => {
          throw err;
        });
      return {
        message: `Se ha asignado ${body.pedidos.length} pedido(s) a ${usuario.nombre} ${usuario.apellido}`,
      };
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

  async orderReady(id, usuario): Promise<{ message: string } | HttpException> {
    if (usuario.nombreRol !== 'Empleado') {
      throw new HttpException(
        {
          message: 'No tiene permisos para realizar esta acción',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const restauranteEmployee = await this.employeeHasRestaurant(usuario);
      if (!restauranteEmployee) {
        throw {
          message: 'Errores de validación',
          errors: ['El empleado no pertenece a ningún restaurante'],
        };
      }
      const pedidoInfo = await this.pedidoRepository.getPedidoById(id);
      if (!pedidoInfo) {
        throw {
          message: 'Errores de validación',
          errors: ['El pedido no existe'],
        };
      }
      if (pedidoInfo.estado !== 'en_preparacion') {
        throw {
          message: 'Errores de validación',
          errors: [
            'No es posible marcar como listo el pedido ya que no se encuentra en preparación',
          ],
        };
      }
      if (pedidoInfo.id_restaurante !== restauranteEmployee.id_restaurante) {
        throw {
          message: 'Errores de validación',
          errors: [
            'El empleado no pertenece al restaurante del cual proviene el pedido',
          ],
        };
      }
      const clienteInfo = await getDataUserById(pedidoInfo.id_cliente);
      if (!clienteInfo) {
        throw {
          message: 'Errores de validación',
          errors: ['El cliente asociado al pedido no existe'],
        };
      }
      const SMSInfo = await this.mensajeriaService
        .sendSMSOrderNotification(clienteInfo.celular)
        .catch((e) => {
          throw e;
        });

      await this.pedidoRepository.updateReadyOrder(pedidoInfo, SMSInfo.code);
      return {
        message:
          'Pedido marcado como listo y se ha notificado al cliente para recibirlo',
      };
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

  async orderDelivery(
    id,
    body: orderDeliveryDto,
    usuario,
  ): Promise<{ message: string } | HttpException> {
    if (usuario.nombreRol !== 'Empleado') {
      throw new HttpException(
        {
          message: 'No tiene permisos para realizar esta acción',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    try {
      const validateBody = await validate(body);
      if (validateBody.length) {
        throw {
          message: 'Errores de validación',
          errors: getErrorMessages(validateBody),
        };
      }
      const restauranteEmployee = await this.employeeHasRestaurant(usuario);
      if (!restauranteEmployee) {
        throw {
          message: 'Errores de validación',
          errors: ['El empleado no pertenece a ningún restaurante'],
        };
      }
      const pedidoInfo = await this.pedidoRepository.getPedidoById(id);
      if (!pedidoInfo) {
        throw {
          message: 'Errores de validación',
          errors: ['El pedido no existe'],
        };
      }
      if (pedidoInfo.estado !== 'listo') {
        throw {
          message: 'Errores de validación',
          errors: [
            'No es posible marcar como entregado el pedido ya que no se encuentra listo',
          ],
        };
      }
      if (pedidoInfo.id_restaurante !== restauranteEmployee.id_restaurante) {
        throw {
          message: 'Errores de validación',
          errors: [
            'El empleado no pertenece al restaurante del cual proviene el pedido',
          ],
        };
      }
      if (pedidoInfo.codigo_verificacion !== body.codigo) {
        throw {
          message: 'Errores de validación',
          errors: ['El código proporcionado es invalido'],
        };
      }
      await this.pedidoRepository.updateStateDeliveryOrder(pedidoInfo);
      return { message: 'Pedido entregado exitosamente' };
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
