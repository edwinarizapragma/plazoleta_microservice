import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from '../../src/pedidos/application/pedidos.service';
import { PedidoRepository } from '../../src/pedidos/domain/repositories/PedidoRepository';
import { RestauranteRepository } from '../../src/restaurantes/domain/repositories/RestauranteRepository';
import { PedidosPlatosRepository } from '../../src/pedidos/domain/repositories/PedidosPlatosRepository';
import { PlatoRepository } from '../../src/platos/domain/repositories/PlatoRepository';
import {
  createPedidoDto,
  PlatoListDto,
} from '../../src/pedidos/dto/createPedido.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoEntity } from '../../database/typeorm/entities/Pedido.entity';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { PlatoEntity } from '../../database/typeorm/entities/Plato.entity';
import { PedidoPLatoEntity } from '../../database/typeorm/entities/PedidoPlato.entity';
import { listPedidosDto } from '../../src/pedidos/dto/listPedidos.dto';
import { EmpleadosRestaurantesService } from '../../src/empleados_restaurantes/applications/empleados_restaurantes.service';
import { EmpleadosRestaurantesRepository } from '../../src/empleados_restaurantes/domain/repositories/EmpleadoRestauranteRepository';
import { UsuariosMicroserviceService } from '../../src/empleados_restaurantes/domain/infrastructure/axios/usuarios_micro.service';
describe('PedidosService', () => {
  let service: PedidosService;
  const usuarioClienteValido = {
    id: 89,
    nombre: 'Sarah',
    apellido: 'Smith',
    numero_documento: 31578902,
    celular: '+573215487632',
    correo: 'sarahsmith@example.com',
    id_rol: 4,
    nombreRol: 'Cliente',
  };
  const usuarioClienteValido2 = {
    id: 90,
    nombre: 'Jordan',
    apellido: 'Jr',
    numero_documento: 1444521001,
    celular: '+573215487521',
    correo: 'cliente@cliente.com',
    id_rol: 4,
    nombreRol: 'Cliente',
  };

  const usuarioEmpleado = {
    id: 77,
    nombre: 'Dave Jhon',
    apellido: 'Smith',
    numero_documento: 45661234,
    celular: '+573156487925',
    correo: 'empleado@empleado.com',
    id_rol: 3,
    nombreRol: 'Empleado',
  };

  const usuarioEmpleado2 = {
    id: 94,
    nombre: 'Edwin',
    apellido: 'Ariza',
    numero_documento: 1235678,
    celular: '+573156487925',
    correo: 'edwina@gmail.com',
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
        expect(error.response.error.errors).toEqual(
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
        expect(error.response.error.errors).toEqual(
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
        expect(error.response.error.errors).toHaveLength(1);
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
        expect(error.response.error.errors).toHaveLength(3);
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
        service.listPedidos(filters, usuarioEmpleado2),
      ).rejects.toThrow(HttpException);
    });
  });
});
