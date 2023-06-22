import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PedidosService } from '../../src/pedidos/application/use_cases/pedidos.service';
import { EmpleadosRestaurantesService } from '../../src/empleados_restaurantes/applications/use_cases/empleados_restaurantes.service';
import { CreateEmpleadoService } from '../../src/empleados_restaurantes/infrastructure/axios/createEmpleado.service';
import { MensajeriaMicroServiceService } from '../../src/pedidos/infrastructure/axios/mensajeria-micro.service';
import { UserMicroService } from '../../util/finders/findUserById';
import { RestaurantesService } from '../../src/restaurantes/application/use_cases/restaurantes.service';
import { PedidoEntity } from '../../database/typeorm/entities/Pedido.entity';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { EmpleadoRestauranteEntity } from '../../database/typeorm/entities/EmpeladoRestaurante.entity';
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
import { orderDeliveryDto } from '../../src/pedidos/interfaces/dto/orderDelivery.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as dayjs from 'dayjs';

describe('PedidosService', () => {
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
  const mockUsuarioRestaurante: EmpleadoRestauranteEntity = {
    id: 1,
    id_restaurante: 1,
    id_empleado: 1,
    restaurante: undefined,
  };

  let service: PedidosService;
  let userMicroservice: UserMicroService;
  let mensajeriaService: MensajeriaMicroServiceService;
  let pedidoRepository: PedidoRepository;
  let platoRepository: PlatoRepository;
  let pedidoPlatosRepository: PedidosPlatosRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        RestauranteRepository,
        PedidosService,
        RestaurantesService,
        PedidoRepository,
        PedidosPlatosRepository,
        PlatoRepository,
        EmpleadosRestaurantesService,
        EmpleadosRestaurantesRepository,
        CreateEmpleadoService,
        MensajeriaMicroServiceService,
        UserMicroService,
      ],
    }).compile();

    service = module.get<PedidosService>(PedidosService);
    userMicroservice = module.get<UserMicroService>(UserMicroService);
    mensajeriaService = module.get<MensajeriaMicroServiceService>(
      MensajeriaMicroServiceService,
    );
    pedidoRepository = module.get<PedidoRepository>(PedidoRepository);
    platoRepository = module.get<PlatoRepository>(PlatoRepository);
    pedidoPlatosRepository = module.get<PedidosPlatosRepository>(
      PedidosPlatosRepository,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreatePedidoFunction', () => {
    const mockRestaurante: RestauranteEntity = {
      platos: [],
      pedidos: [],
      empleados_restaurantes: [],
      id: 999,
      nombre: 'McDonalds',
      direccion: 'Carrera 1 # 100-10',
      id_propietario: 72,
      telefono: '+573156487925',
      url_logo: 'storage/foto.jpg',
      nit: 2377793501,
    };

    it('test create order with valid input', async () => {
      const pedidoDetail = new createPedidoDto();
      pedidoDetail.id_restaurante = 999;
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

      jest
        .spyOn(service, 'getRestaurantById')
        .mockResolvedValueOnce(mockRestaurante);

      jest
        .spyOn(pedidoRepository, 'searchPedidoByEstadoAndCliente')
        .mockResolvedValueOnce(null);

      const mockPlatos: any[] = pedidoDetail.platos.map((plato) => ({
        nombre: 'Nombre de Plato',
        id_restaurante: pedidoDetail.id_restaurante,
      }));
      jest
        .spyOn(platoRepository, 'searchPlatosByIds')
        .mockResolvedValueOnce(mockPlatos);

      jest
        .spyOn(pedidoPlatosRepository, 'createPedidoPlatoWithTransaction')
        .mockResolvedValueOnce({
          id: 1,
          id_pedido: 1,
          id_plato: 1,
          cantidad: 1,
          pedido: undefined,
          plato: undefined,
        });

      await jest.spyOn(pedidoRepository, 'createPedido').mockResolvedValueOnce({
        id: 1,
        id_cliente: usuarioClienteValido.id,
        fecha: new Date(dayjs().format('YYYY-MM-DD HH:mm:ss')),
        estado: 'pendiente',
        id_chef: null,
        id_restaurante: pedidoDetail.id_restaurante,
        codigo_verificacion: null,
        restaurante: undefined,
        pedidos_platos: undefined,
      });

      const result = await service.createPedido(
        pedidoDetail,
        usuarioClienteValido,
      );
      expect(result).toBeDefined();
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
        jest
          .spyOn(service, 'getRestaurantById')
          .mockResolvedValueOnce(mockRestaurante);

        jest
          .spyOn(pedidoRepository, 'searchPedidoByEstadoAndCliente')
          .mockResolvedValueOnce({
            id: 1,
            id_cliente: 1,
            fecha: new Date(),
            estado: '',
            id_chef: null,
            id_restaurante: 999,
            codigo_verificacion: null,
            restaurante: undefined,
            pedidos_platos: [],
          });
        const mockPlatos: any[] = pedidoDetail.platos.map((plato) => ({
          nombre: 'Nombre de Plato',
          id_restaurante: pedidoDetail.id_restaurante,
        }));
        jest
          .spyOn(platoRepository, 'searchPlatosByIds')
          .mockResolvedValueOnce(mockPlatos);
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
        jest.spyOn(service, 'getRestaurantById').mockResolvedValueOnce(null);
        jest
          .spyOn(pedidoRepository, 'searchPedidoByEstadoAndCliente')
          .mockResolvedValueOnce(null);
        jest
          .spyOn(platoRepository, 'searchPlatosByIds')
          .mockResolvedValueOnce([]);
        await service.createPedido(pedidoDetail, usuarioClienteValido);
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
        await service.createPedido(pedidoDetail, usuarioClienteValido);
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
        await service.createPedido(pedidoDetail, usuarioClienteValido);
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
      jest
        .spyOn(service, 'employeeHasRestaurant')
        .mockResolvedValueOnce(mockUsuarioRestaurante);
      const mockListPedidos: PedidoEntity[] = [
        {
          id: 1,
          id_cliente: 1,
          fecha: new Date(),
          estado: '',
          id_chef: null,
          id_restaurante: 999,
          codigo_verificacion: null,
          restaurante: undefined,
          pedidos_platos: [
            {
              id: 1,
              id_pedido: 1,
              id_plato: 1,
              cantidad: 1,
              pedido: undefined,
              plato: undefined,
            },
          ],
        },
      ];
      jest
        .spyOn(pedidoRepository, 'listPedidos')
        .mockResolvedValueOnce(mockListPedidos);
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
      jest.spyOn(service, 'employeeHasRestaurant').mockResolvedValueOnce(false);
      await expect(
        service.listPedidos(filters, usuarioEmpleado),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('takeOrdersFunction', () => {
    const mockPedidos: PedidoEntity[] = [
      {
        id: 1,
        id_cliente: 1,
        fecha: new Date(),
        estado: 'pendiente',
        id_chef: null,
        id_restaurante: 999,
        codigo_verificacion: null,
        restaurante: undefined,
        pedidos_platos: [
          {
            id: 1,
            id_pedido: 1,
            id_plato: 1,
            cantidad: 1,
            pedido: undefined,
            plato: undefined,
          },
        ],
      },
    ];
    it('take an order with valid input', async () => {
      const body = new takeOrderDto();
      body.pedidos = [2];
      jest
        .spyOn(service, 'employeeHasRestaurant')
        .mockResolvedValueOnce(mockUsuarioRestaurante);

      jest
        .spyOn(pedidoRepository, 'getPedidosById')
        .mockResolvedValueOnce(mockPedidos);
      mockPedidos[0].estado = 'en_preparacion';
      mockPedidos[0].id_chef = 1;

      jest
        .spyOn(pedidoRepository, 'assignChef')
        .mockResolvedValueOnce(mockPedidos);
      const result = await service.tomarPedidos(body, usuarioEmpleado);
      expect(result).toEqual({
        message: `Se ha asignado ${body.pedidos.length} pedido(s) a ${usuarioEmpleado.nombre} ${usuarioEmpleado.apellido}`,
      });
    });

    it('take an order with invalid input', async () => {
      const body = new takeOrderDto();
      body.pedidos = [-2, null];

      await expect(service.tomarPedidos(body, usuarioEmpleado)).rejects.toThrow(
        HttpException,
      );
    });

    it('take an order that does not belong to the employee', async () => {
      const body = new takeOrderDto();
      body.pedidos = [1, 2];
      jest
        .spyOn(service, 'employeeHasRestaurant')
        .mockResolvedValueOnce(mockUsuarioRestaurante);
      jest
        .spyOn(pedidoRepository, 'getPedidosById')
        .mockResolvedValueOnce(mockPedidos);
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
    const mockFindPedido: PedidoEntity = {
      id: 2,
      id_cliente: 1,
      fecha: new Date(),
      estado: 'en_preparacion',
      id_chef: null,
      id_restaurante: 1,
      codigo_verificacion: null,
      restaurante: undefined,
      pedidos_platos: [
        {
          id: 1,
          id_pedido: 1,
          id_plato: 1,
          cantidad: 1,
          pedido: undefined,
          plato: undefined,
        },
      ],
    };
    it('test order ready with valid input', async () => {
      try {
        jest
          .spyOn(service, 'employeeHasRestaurant')
          .mockResolvedValueOnce(mockUsuarioRestaurante);

        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(mockFindPedido);
        jest
          .spyOn(userMicroservice, 'getDataUserById')
          .mockResolvedValueOnce(usuarioClienteValido);
        jest
          .spyOn(mensajeriaService, 'sendSMSOrderNotification')
          .mockResolvedValueOnce({ code: 'P-1234' });
        const mockPedidoUpdate = Object.assign({}, mockFindPedido);
        mockPedidoUpdate.estado = 'listo';
        mockPedidoUpdate.codigo_verificacion = 'P-1234';
        jest
          .spyOn(pedidoRepository, 'updateReadyOrder')
          .mockResolvedValueOnce(mockPedidoUpdate);
        const result = await service.orderReady(2, usuarioEmpleado);
        expect(result).toEqual({
          message:
            'Pedido marcado como listo y se ha notificado al cliente para recibirlo',
        });
      } catch (error) {}
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
        jest
          .spyOn(service, 'employeeHasRestaurant')
          .mockResolvedValueOnce(mockUsuarioRestaurante);
        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(null);
        await service.orderReady(-1, usuarioEmpleado);
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
        jest
          .spyOn(service, 'employeeHasRestaurant')
          .mockResolvedValueOnce(mockUsuarioRestaurante);
        const mockPedidoDiferentStatus = Object.assign({}, mockFindPedido);
        mockPedidoDiferentStatus.estado = 'pendiente';
        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(mockPedidoDiferentStatus);

        await service.orderReady(2, usuarioEmpleado);
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
        jest.spyOn(service, 'employeeHasRestaurant').mockResolvedValueOnce({
          id: 1,
          id_restaurante: 999,
          id_empleado: 1,
          restaurante: undefined,
        });

        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(mockFindPedido);
        await service.orderReady(1, usuarioEmpleado);
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
    const mockPedido: PedidoEntity = {
      id: 2,
      id_cliente: 1,
      fecha: new Date(),
      estado: 'listo',
      id_chef: null,
      id_restaurante: 1,
      codigo_verificacion: 'P-6267',
      restaurante: undefined,
      pedidos_platos: [
        {
          id: 1,
          id_pedido: 1,
          id_plato: 1,
          cantidad: 1,
          pedido: undefined,
          plato: undefined,
        },
      ],
    };
    it('test order delivery with valid input', async () => {
      const body = new orderDeliveryDto();
      body.codigo = 'P-6267';
      jest
        .spyOn(service, 'employeeHasRestaurant')
        .mockResolvedValueOnce(mockUsuarioRestaurante);

      jest
        .spyOn(pedidoRepository, 'getPedidoById')
        .mockResolvedValueOnce(mockPedido);
      const mockPedidoUpdated = Object.assign({}, mockPedido);
      mockPedidoUpdated.estado = 'entregado';
      jest
        .spyOn(pedidoRepository, 'updateStateDeliveryOrder')
        .mockResolvedValueOnce(mockPedidoUpdated);
      const result = await service.orderDelivery(2, body, usuarioEmpleado);
      expect(result).toEqual({
        message: 'Pedido entregado exitosamente',
      });
    });

    it('test order delivery with validation errors', async () => {
      const body = new orderDeliveryDto();
      body.codigo = null;
      try {
        await service.orderDelivery(2, body, usuarioEmpleado);
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
        jest
          .spyOn(service, 'employeeHasRestaurant')
          .mockResolvedValueOnce(mockUsuarioRestaurante);
        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(null);
        await service.orderDelivery(-1, body, usuarioEmpleado);
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
        jest
          .spyOn(service, 'employeeHasRestaurant')
          .mockResolvedValueOnce(mockUsuarioRestaurante);
        const mockPedidoChangeStatus = Object.assign({}, mockPedido);
        mockPedidoChangeStatus.estado = 'en_preparacion';
        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(mockPedidoChangeStatus);
        await service.orderDelivery(2, body, usuarioEmpleado);
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
        jest.spyOn(service, 'employeeHasRestaurant').mockResolvedValueOnce({
          id: 1,
          id_restaurante: 999,
          id_empleado: 1,
          restaurante: undefined,
        });
        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(mockPedido);
        await service.orderDelivery(3, body, usuarioEmpleado);
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
    const mockPedido: PedidoEntity = {
      id: 2,
      id_cliente: -1,
      fecha: new Date(),
      estado: 'pendiente',
      id_chef: null,
      id_restaurante: 1,
      codigo_verificacion: 'P-6267',
      restaurante: undefined,
      pedidos_platos: [
        {
          id: 1,
          id_pedido: 1,
          id_plato: 1,
          cantidad: 1,
          pedido: undefined,
          plato: undefined,
        },
      ],
    };
    it('test cancel order that does not belong to the customer', async () => {
      try {
        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(mockPedido);
        await service.cancelOrder(5, usuarioClienteValido);
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
      const mockPedidoValido = Object.assign({}, mockPedido);
      mockPedidoValido.id_cliente = usuarioClienteValido.id;
      jest
        .spyOn(pedidoRepository, 'getPedidoById')
        .mockResolvedValueOnce(mockPedidoValido);
      const mockPedidoCanceled = Object.assign({}, mockPedidoValido);
      mockPedidoCanceled.estado = 'cancelado';
      jest
        .spyOn(pedidoRepository, 'updateStateCancelledOrder')
        .mockResolvedValueOnce(mockPedidoCanceled);
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
        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(null);
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
        const mockPedidoDifferentStatus = Object.assign({}, mockPedido);
        mockPedidoDifferentStatus.id_cliente = usuarioClienteValido.id;
        mockPedidoDifferentStatus.estado = 'en_preparacion';
        jest
          .spyOn(pedidoRepository, 'getPedidoById')
          .mockResolvedValueOnce(mockPedidoDifferentStatus);
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
