import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { RestaurantesService } from '../../src/restaurantes/application/use_cases/restaurantes.service';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { RestauranteRepository } from '../../src/restaurantes/infrastructure/repositories/RestauranteRepository';
import { createRestauranteDto } from '../../src/restaurantes/interfaces/dto/createRestaurant.dto';
import { listRestaurantDto } from '../../src/restaurantes/interfaces/dto/listRestaurant.dto';
import { HttpStatus } from '@nestjs/common';

describe('RestaurantesService', () => {
  let service: RestaurantesService;
  const validClientUser = {
    id: 89,
    nombre: 'Sarah',
    apellido: 'Smith',
    numero_documento: 31578902,
    celular: '+573215487632',
    correo: 'sarahsmith@example.com',
    id_rol: 4,
    nombreRol: 'Cliente',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([RestauranteEntity])],
      providers: [RestaurantesService, RestauranteRepository],
    }).compile();

    service = module.get<RestaurantesService>(RestaurantesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create Restaurant function', () => {
    it('"Field validation error test', async () => {
      const fieldsToCreate = new createRestauranteDto();
      fieldsToCreate.nombre = '1234567890';
      fieldsToCreate.direccion = '';
      fieldsToCreate.id_propietario = -1;
      fieldsToCreate.telefono = '1234567890';
      fieldsToCreate.url_logo = '';
      fieldsToCreate.nit = null;

      const datosUsuario = {
        id: 1,
        nombre: 'Pepito',
        apellido: 'Perez',
        numero_documento: 13456654,
        celular: '+573184654',
        correo: 'admin@admin.com',
        id_rol: 1,
        nombreRol: 'Admin',
      };
      try {
        await service.create(fieldsToCreate, datosUsuario);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toHaveLength(7);
      }
    });

    it('User not allowed to create restaurant', async () => {
      const fieldsToCreate = new createRestauranteDto();
      fieldsToCreate.nombre = 'Wasabi';
      fieldsToCreate.direccion = 'Carrera 1 # 100-10';
      fieldsToCreate.id_propietario = 72;
      fieldsToCreate.telefono = '1234567890';
      fieldsToCreate.url_logo = 'storage/images/test.png';
      fieldsToCreate.nit = Math.floor(Math.random() * Math.pow(10, 10)); // random number of ten digits;

      const datosUsuario = {
        id: 72,
        nombre: 'Edwin Tobias',
        apellido: 'Ariza Tellez',
        numero_documento: 12345687987,
        celular: '+573156487925',
        correo: 'propietario@propietario.com',
        id_rol: 2,
        nombreRol: 'Propietario',
      };
      try {
        await service.create(fieldsToCreate, datosUsuario);
      } catch (error) {
        // expect(error).toBe(HttpException);
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(
          'No tiene permisos para crear el restaurante',
        );
      }
    });

    it('test create a restaurant with correct input', async () => {
      const randomNit = Math.floor(Math.random() * Math.pow(10, 10)); // random number of ten digits
      const fieldsToCreate = new createRestauranteDto();
      fieldsToCreate.nombre = 'Los Pollos Hermanos';
      fieldsToCreate.direccion = 'Carrera 1 # 100-10';
      fieldsToCreate.id_propietario = 72;
      fieldsToCreate.telefono = '+573156487925';
      fieldsToCreate.url_logo = '/storage/foto.jpg';
      fieldsToCreate.nit = randomNit;

      const datosUsuario = {
        id: 1,
        nombre: 'Pepito',
        apellido: 'Perez',
        numero_documento: 13456654,
        celular: '+573184654',
        correo: 'admin@admin.com',
        id_rol: 1,
        nombreRol: 'Admin',
      };
      const result = await service.create(fieldsToCreate, datosUsuario);

      expect(result).toEqual({
        nombre: 'Los Pollos Hermanos',
        direccion: 'Carrera 1 # 100-10',
        nit: randomNit,
      });
    });

    it('test the user ID does not correspond to the owner user ', async () => {
      const fields = new createRestauranteDto();
      fields.nombre = 'La Pizzeria';
      fields.direccion = 'Avenida Principal #45-67';
      fields.id_propietario = 1; // id de usuario administrador
      fields.telefono = '+573198765432';
      fields.url_logo = '/storage/logo.png';
      fields.nit = 1234567890;
      const datosUsuario = {
        id: 1,
        nombre: 'Pepito',
        apellido: 'Perez',
        numero_documento: 13456654,
        celular: '+573184654',
        correo: 'admin@admin.com',
        id_rol: 1,
        nombreRol: 'Admin',
      };
      try {
        await service.create(fields, datosUsuario);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
      }
    });
  });

  describe('Paginate restaurants function', () => {
    it('test list restaurants with valid input', async () => {
      const params = new listRestaurantDto();
      params.perPage = 10;
      params.page = 1;
      const result = await service.listRestaurants(params, validClientUser);
      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(Object);
    });

    it('test list restaurants with validation error ', async () => {
      const params = new listRestaurantDto();
      params.perPage = null;
      params.page = -1;
      try {
        await service.listRestaurants(params, validClientUser);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toHaveLength(4);
      }
    });
    it('test list restaurants with paginate params that return an empty list', async () => {
      const params = new listRestaurantDto();
      params.perPage = 5;
      params.page = 9999999;
      const result = await service.listRestaurants(params, validClientUser);
      expect(result).toEqual([]);
    });
  });
});
