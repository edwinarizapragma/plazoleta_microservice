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
});
