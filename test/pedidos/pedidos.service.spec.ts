import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { PedidosService } from '../../src/pedidos/application/use_cases/pedidos.service';
import { EmpleadosRestaurantesService } from '../../src/empleados_restaurantes/applications/use_cases/empleados_restaurantes.service';
import { UsuariosMicroserviceService } from '../../src/empleados_restaurantes/infrastructure/axios/usuarios_micro.service';
import { MensajeriaMicroServiceService } from '../../src/pedidos/infrastructure/axios/mensajeria-micro.service';
import { PedidoEntity } from '../../database/typeorm/entities/Pedido.entity';
import { PedidoPLatoEntity } from '../../database/typeorm/entities/PedidoPlato.entity';
import { PlatoEntity } from '../../database/typeorm/entities/Plato.entity';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { PedidoRepository } from '../../src/pedidos/infrastructure/repositories/PedidoRepository';
import { RestauranteRepository } from '../../src/restaurantes/infrastructure/repositories/RestauranteRepository';
import { PedidosPlatosRepository } from '../../src/pedidos/infrastructure/repositories/PedidosPlatosRepository';
import { PlatoRepository } from '../../src/platos/infrastructure/repositories/PlatoRepository';
import { EmpleadosRestaurantesRepository } from '../../src/empleados_restaurantes/infrastructure/repositories/EmpleadoRestauranteRepository';
import {
  createPedidoDto,
  PlatoListDto,
} from '../../src/pedidos/interfaces/dto/createPedido.dto';
import { listPedidosDto } from '../../src/pedidos/interfaces/dto/listPedidos.dto';
import { takeOrderDto } from '../../src/pedidos/interfaces/dto/takeOrderDto.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { orderDeliveryDto } from '../../src/pedidos/interfaces/dto/orderDelivery.dto';

describe('PedidosService', () => {
  let service: PedidosService;
  const usuarioClienteValido = {
    id: 89,
    nombre: 'Sarah',
    apellido: 'Smith',
    numero_documento: 31578902,
    celular: '+573155680091',
    correo: 'sarahsmith@example.com',
    id_rol: 4,
    nombreRol: 'Cliente',
  };
  const usuarioClienteValido2 = {
    id: 90,
    nombre: 'Jordan',
    apellido: 'Jr',
    numero_documento: 1444521001,
    celular: '+573155680091',
    correo: 'cliente@cliente.com',
    id_rol: 4,
    nombreRol: 'Cliente',
  };

  const usuarioEmpleado = {
    id: 77,
    nombre: 'Dave Jhon',
    apellido: 'Smith',
    numero_documento: 45661234,
    celular: '+573155680091',
    correo: 'empleado@empleado.com',
    id_rol: 3,
    nombreRol: 'Empleado',
  };

  const usuarioEmpleado2 = {
    id: 94,
    nombre: 'Edwin',
    apellido: 'Ariza',
    numero_documento: 1235678,
    celular: '+573155680091',
    correo: 'edwina@gmail.com',
    id_rol: 3,
    nombreRol: 'Empleado',
  };

  const usuarioEmpleado3 = {
    id: 95,
    nombre: 'Jorge',
    apellido: 'Puentes',
    numero_documento: 456789,
    celular: '+573155680091',
    correo: 'jorge@jorge.com',
    id_rol: 3,
    nombreRol: 'Empleado',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forFeature([
          PedidoEntity,
          RestauranteEntity,
          PedidoPLatoEntity,
          PlatoEntity,
        ]),
      ],
      providers: [
        PedidosService,
        PedidoRepository,
        RestauranteRepository,
        PedidosPlatosRepository,
        PlatoRepository,
        EmpleadosRestaurantesService,
        EmpleadosRestaurantesRepository,
        UsuariosMicroserviceService,
        MensajeriaMicroServiceService,
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreatePedidoFunction', () => {
    it('test create order with valid input', async () => {
      const pedidoDetail = new createPedidoDto();
      pedidoDetail.id_restaurante = 1;
      pedidoDetail.platos = [
        {
          id_plato: 19,
          cantidad: 2,
        },
        {
          id_plato: 35,
          cantidad: 2,
        },
      ];
      const result = await service.createPedido(
        pedidoDetail,
        usuarioClienteValido,
      );
      expect(result).toEqual({ message: 'Pedido creado exitosamente' });
    });

    it('test create order with user that already has a pending order', async () => {
      const pedidoDetail = new createPedidoDto();
      pedidoDetail.id_restaurante = 1;
      pedidoDetail.platos = [
        {
          id_plato: 19,
          cantidad: 15,
        },
        {
          id_plato: 35,
          cantidad: 2,
        },
      ];
      try {
        await service.createPedido(pedidoDetail, usuarioClienteValido);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /Tienes pedidos aún en proceso, no puedes realizar mas pedidos/,
            ),
          ]),
        );
      }
    });
    it('test create order with dish and restaurant that doesnt exists', async () => {
      const pedidoDetail = new createPedidoDto();
      pedidoDetail.id_restaurante = 99999;
      pedidoDetail.platos = [
        {
          id_plato: -1,
          cantidad: 1,
        },
        {
          id_plato: 35,
          cantidad: 2,
        },
      ];
      try {
        await service.createPedido(pedidoDetail, usuarioClienteValido2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /El restaurante proporcionado no se encuentra registrado/,
            ),
            expect.stringMatching(
              /No es posible crear el pedido ya que contiene platos no registrados o no se encuentran activos/,
            ),
          ]),
        );
      }
    });

    it('test create order with empty list of dishes', async () => {
      const pedidoDetail = new createPedidoDto();
      pedidoDetail.id_restaurante = 1;
      pedidoDetail.platos = [];
      try {
        await service.createPedido(pedidoDetail, usuarioClienteValido2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toHaveLength(1);
      }
    });

    it('test create order with validation error in dishes list', async () => {
      const pedidoDetail = new createPedidoDto();
      pedidoDetail.id_restaurante = -1;

      const plato1 = new PlatoListDto();
      plato1.id_plato = -1;
      plato1.cantidad = -1;

      const plato2 = new PlatoListDto();
      plato2.id_plato = -1;
      plato2.cantidad = -1;
      pedidoDetail.platos = [plato1, plato2];
      try {
        await service.createPedido(pedidoDetail, usuarioClienteValido2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toHaveLength(3);
      }
    });
  });

  describe('listPedidosFunction', () => {
    it('list with valid input', async () => {
      const filters = new listPedidosDto();
      filters.page = 1;
      filters.perPage = 10;
      const result = await service.listPedidos(filters, usuarioEmpleado);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('list with validation errors ', async () => {
      const filters = new listPedidosDto();
      filters.page = -1;
      filters.perPage = null;
      filters.estado = '90988';

      await expect(
        service.listPedidos(filters, usuarioEmpleado),
      ).rejects.toThrow(HttpException);
    });

    it('list with employee has no assigned restaurant', async () => {
      const filters = new listPedidosDto();
      filters.page = 1;
      filters.perPage = 10;

      await expect(
        service.listPedidos(filters, usuarioEmpleado3),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('takeOrdersFunction', () => {
    it('take an order with valid input', async () => {
      const body = new takeOrderDto();
      body.pedidos = [2];

      const result = await service.tomarPedidos(body, usuarioEmpleado2);
      expect(result).toEqual({
        message: `Se ha asignado ${body.pedidos.length} pedido(s) a ${usuarioEmpleado2.nombre} ${usuarioEmpleado2.apellido}`,
      });
    });

    it('take an order with invalid input', async () => {
      const body = new takeOrderDto();
      body.pedidos = [-2, null];

      await expect(
        service.tomarPedidos(body, usuarioEmpleado2),
      ).rejects.toThrow(HttpException);
    });

    it('take an order that does not belong to the employee', async () => {
      const body = new takeOrderDto();
      body.pedidos = [1, 2];

      try {
        await service.tomarPedidos(body, usuarioEmpleado);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /Algunos pedidos no pertenecen al restaurante que posee el empleado o ya se encuentran en preparación o cancelados/,
            ),
          ]),
        );
      }
    });
  });

  describe('OrderReadyFunction', () => {
    it('test order ready with valid input', async () => {
      const result = await service.orderReady(2, usuarioEmpleado2);
      expect(result).toEqual({
        message:
          'Pedido marcado como listo y se ha notificado al cliente para recibirlo',
      });
    });

    it('test order ready with customer profile ', async () => {
      try {
        await service.orderReady(2, usuarioClienteValido);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(
          'No tiene permisos para realizar esta acción',
        );
      }
    });

    it('test order ready with order doesnt exists', async () => {
      try {
        await service.orderReady(-1, usuarioEmpleado2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/El pedido no existe/),
          ]),
        );
      }
    });

    it('test mark order ready with different status', async () => {
      try {
        await service.orderReady(2, usuarioEmpleado2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /No es posible marcar como listo el pedido ya que no se encuentra en preparación/,
            ),
          ]),
        );
      }
    });

    it('test mark order ready with employee who does not belong to the restaurant of the order', async () => {
      try {
        await service.orderReady(3, usuarioEmpleado2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /El empleado no pertenece al restaurante del cual proviene el pedido/,
            ),
          ]),
        );
      }
    });
  });

  describe('OrderDeliveryFunction', () => {
    it('test order delivery with valid input', async () => {
      const body = new orderDeliveryDto();
      body.codigo = 'P-6267';
      const result = await service.orderDelivery(2, body, usuarioEmpleado2);
      expect(result).toEqual({
        message: 'Pedido entregado exitosamente',
      });
    });
    it('test order delivery with validation errors', async () => {
      const body = new orderDeliveryDto();
      body.codigo = null;
      try {
        await service.orderDelivery(2, body, usuarioEmpleado2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toHaveLength(2);
      }
    });

    it('test order delivery with customer profile ', async () => {
      try {
        const body = new orderDeliveryDto();
        body.codigo = 'P-6267';
        await service.orderDelivery(2, body, usuarioClienteValido);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(
          'No tiene permisos para realizar esta acción',
        );
      }
    });

    it('test order delivery with order doesnt exists', async () => {
      try {
        const body = new orderDeliveryDto();
        body.codigo = 'P-6267';
        await service.orderDelivery(-1, body, usuarioEmpleado2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/El pedido no existe/),
          ]),
        );
      }
    });

    it('test mark order delivery with different status', async () => {
      try {
        const body = new orderDeliveryDto();
        body.codigo = 'P-6267';
        await service.orderDelivery(2, body, usuarioEmpleado2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /No es posible marcar como entregado el pedido ya que no se encuentra listo/,
            ),
          ]),
        );
      }
    });

    it('test mark order delivered with employee who does not belong to the restaurant of the order', async () => {
      try {
        const body = new orderDeliveryDto();
        body.codigo = 'P-4050';
        await service.orderDelivery(3, body, usuarioEmpleado2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /El empleado no pertenece al restaurante del cual proviene el pedido/,
            ),
          ]),
        );
      }
    });
  });

  describe('OrderCancelFunction', () => {
    it('test cancel order that does not belong to the customer', async () => {
      try {
        await service.cancelOrder(5, usuarioClienteValido2);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /El pedido que desea cancelar no fue solicitado por usted/,
            ),
          ]),
        );
      }
    });

    it('test cancel order with valid input', async () => {
      const result = await service.cancelOrder(5, usuarioClienteValido);
      expect(result).toEqual({
        message: 'Pedido cancelado exitosamente',
      });
    });

    it('test cancel order with employee profile', async () => {
      try {
        await service.cancelOrder(5, usuarioEmpleado);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(
          'No tiene permisos para realizar esta acción',
        );
      }
    });

    it('test cancel order with order doesnt exists', async () => {
      try {
        await service.cancelOrder(-1, usuarioClienteValido);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(/El pedido no existe/),
          ]),
        );
      }
    });

    it('test cancel order delivery with different status', async () => {
      try {
        await service.cancelOrder(5, usuarioClienteValido);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /Lo sentimos, tu pedido ya está en preparación y no puede cancelarse/,
            ),
          ]),
        );
      }
    });
  });
});
