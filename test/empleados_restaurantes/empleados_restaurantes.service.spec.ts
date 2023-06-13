import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadosRestaurantesService } from '../../src/empleados_restaurantes/applications/use_cases/empleados_restaurantes.service';
import { UsuariosMicroserviceService } from '../../src/empleados_restaurantes/infrastructure/axios/usuarios_micro.service';
import { EmpleadoRestauranteEntity } from '../../database/typeorm/entities/EmpeladoRestaurante.entity';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { EmpleadosRestaurantesRepository } from '../../src/empleados_restaurantes/infrastructure/repositories/EmpleadoRestauranteRepository';
import { RestauranteRepository } from '../../src/restaurantes/infrastructure/repositories/RestauranteRepository';
import { CreateEmpleadoRestauranteDto } from '../../src/empleados_restaurantes/interfaces/dto/CreateEmpleadoRestaurante.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

describe('EmpleadosRestaurantesService', () => {
  let service: EmpleadosRestaurantesService;
  const ownerCredentials = {
    correo: 'propietario@propietario.com',
    clave: '123456',
  };
  const urlAuth = `${process.env.URL_USUARIOS_MICROSERVICE}/auth/sing-in`;
  let ownerData = null;
  it('verify properties in ownerData', async () => {
    ownerData = await axios
      .post(urlAuth, ownerCredentials)
      .then(({ data }) => {
        return data;
      })
      .catch((e) => {
        return e;
      });
    expect(ownerData).toHaveProperty('datosUsuario');
    expect(ownerData).toHaveProperty('token');
    expect(ownerData.datosUsuario).toBeDefined();
    expect(ownerData.token).toBeDefined();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forFeature([
          EmpleadoRestauranteEntity,
          RestauranteEntity,
        ]),
      ],
      providers: [
        EmpleadosRestaurantesService,
        EmpleadosRestaurantesRepository,
        RestauranteRepository,
        UsuariosMicroserviceService,
      ],
    }).compile();

    service = module.get<EmpleadosRestaurantesService>(
      EmpleadosRestaurantesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('Create row function', () => {
    it('create with valid input', async () => {
      const fieldsToCreate = new CreateEmpleadoRestauranteDto();
      fieldsToCreate.nombre = 'Edwin';
      fieldsToCreate.apellido = 'Ariza';
      fieldsToCreate.numero_documento = 1235678;
      fieldsToCreate.celular = '+573156487925';
      fieldsToCreate.fecha_nacimiento = new Date('1997-08-23');
      fieldsToCreate.correo = 'ejemplo@ejemplo.com';
      fieldsToCreate.clave = '132453';
      fieldsToCreate.id_restaurante = 1;
      const result = await service.create(
        fieldsToCreate,
        `Bearer ${ownerData.token}`,
        ownerData.datosUsuario,
      );
      expect(result).toEqual({
        message: `${fieldsToCreate.nombre} ${fieldsToCreate.apellido} ha sido registrado y asociado al restaurante exitosamente`,
      });
    });

    it('create with restaurant that doesnt exist', async () => {
      const fieldsToCreate = new CreateEmpleadoRestauranteDto();
      fieldsToCreate.nombre = 'Edwin T';
      fieldsToCreate.apellido = 'Ariza T';
      fieldsToCreate.numero_documento = 1235678;
      fieldsToCreate.celular = '+573156487925';
      fieldsToCreate.fecha_nacimiento = new Date('1997-08-23');
      fieldsToCreate.correo = 'ejemplo@ejemplo.com';
      fieldsToCreate.clave = '132453';
      fieldsToCreate.id_restaurante = 80901;
      try {
        await service.create(
          fieldsToCreate,
          `Bearer ${ownerData.token}`,
          ownerData.datosUsuario,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Errores de validación');
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /El restaurante proporcionado no se encuentra registrado/,
            ),
          ]),
        );
      }
    });

    it('create with logged user is no a owner of restaurant', async () => {
      const fieldsToCreate = new CreateEmpleadoRestauranteDto();
      fieldsToCreate.nombre = 'Edwin A';
      fieldsToCreate.apellido = 'Ariza P';
      fieldsToCreate.numero_documento = 1235678;
      fieldsToCreate.celular = '+573156487925';
      fieldsToCreate.fecha_nacimiento = new Date('1997-08-23');
      fieldsToCreate.correo = 'ejemplo@ejemplo.com';
      fieldsToCreate.clave = '132453';
      fieldsToCreate.id_restaurante = 20;
      try {
        await service.create(
          fieldsToCreate,
          `Bearer ${ownerData.token}`,
          ownerData.datosUsuario,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Errores de validación');
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /Usted no es propietario del restaurante que proporciono/,
            ),
          ]),
        );
      }
    });

    it('create with validation error', async () => {
      const fieldsToCreate = new CreateEmpleadoRestauranteDto();
      fieldsToCreate.nombre = null;
      fieldsToCreate.apellido = 'Ariza P';
      fieldsToCreate.numero_documento = -1;
      fieldsToCreate.celular = '+5735';
      fieldsToCreate.fecha_nacimiento = new Date('1997-08-23');
      fieldsToCreate.correo = 'ejemplo@ejemplo.com';
      fieldsToCreate.clave = '';
      fieldsToCreate.id_restaurante = null;
      try {
        await service.create(
          fieldsToCreate,
          `Bearer ${ownerData.token}`,
          ownerData.datosUsuario,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Errores de validación');
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.response.error).toHaveLength(8);
      }
    });
  });

  describe('find employee - restaurant relation info', () => {
    it('find info with valid input', async () => {
      const result = await service.findByEmployee(88);
      expect(result).toBeInstanceOf(EmpleadoRestauranteEntity);
    });

    it('find info with id that doesnt exists', async () => {
      try {
        await service.findByEmployee(-1);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          'El empleado no se encuentra asociado a ningún restaurante',
        );
      }
    });
  });
});
