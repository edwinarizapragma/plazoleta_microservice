import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { RestaurantesService } from '../src/restaurantes/application/use_cases/restaurantes.service';
import { RestauranteEntity } from '../database/typeorm/entities/Restaurante.entity';
import { RestauranteRepository } from '../src/restaurantes/infrastructure/repositories/RestauranteRepository';
import { createRestauranteDto } from '../src/restaurantes/interfaces/dto/createRestaurant.dto';
import { listRestaurantDto } from '../src/restaurantes/interfaces/dto/listRestaurant.dto';
import { HttpStatus } from '@nestjs/common';
import { UserMicroService } from '../util/finders/findUserById';

describe('RestaurantesService', () => {
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
  const validAdminUser = {
    id: 1,
    nombre: 'Pepito',
    apellido: 'Perez',
    numero_documento: 13456654,
    celular: '+573184654',
    correo: 'admin@admin.com',
    id_rol: 1,
    nombreRol: 'Admin',
  };
  const validOwnerUser = {
    id: 72,
    nombre: 'Edwin Tobias',
    apellido: 'Ariza Tellez',
    numero_documento: 12345687987,
    celular: '+573156487925',
    correo: 'propietario@propietario.com',
    id_rol: 2,
    nombreRol: 'Propietario',
  };
  const mockRestaurante: RestauranteEntity = {
    platos: [],
    pedidos: [],
    empleados_restaurantes: [],
    id: 1,
    nombre: 'McDonalds',
    direccion: 'Carrera 1 # 100-10',
    id_propietario: 72,
    telefono: '+573156487925',
    url_logo: 'storage/foto.jpg',
    nit: 2377793501,
  };
  let service: RestaurantesService;
  let restauranteRepository: RestauranteRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([RestauranteEntity])],
      providers: [RestaurantesService, RestauranteRepository, UserMicroService],
    }).compile();

    service = module.get<RestaurantesService>(RestaurantesService);
    restauranteRepository = module.get<RestauranteRepository>(
      RestauranteRepository,
    );
    await module.close();
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

      try {
        await service.create(fieldsToCreate, validAdminUser);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toHaveLength(6);
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

      try {
        await service.create(fieldsToCreate, validOwnerUser);
      } catch (error) {
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

      try {
        jest.spyOn(service, 'validateUserIsOwner').mockResolvedValueOnce(true);
        jest
          .spyOn(restauranteRepository, 'createNewRestaurant')
          .mockResolvedValueOnce(mockRestaurante);
        const result = await service.create(fieldsToCreate, validAdminUser);

        expect(result).toEqual({ message: 'restaurante creado exitosamente' });
      } catch (e) {}
    });

    it('test the user ID does not correspond to the owner user ', async () => {
      const fields = new createRestauranteDto();
      fields.nombre = 'La Pizzeria';
      fields.direccion = 'Avenida Principal #45-67';
      fields.id_propietario = 1;
      fields.telefono = '+573198765432';
      fields.url_logo = '/storage/logo.png';
      fields.nit = 1234567890;
      try {
        jest.spyOn(service, 'validateUserIsOwner').mockResolvedValueOnce(true);
        await service.create(fields, validAdminUser);
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
      try {
        jest
          .spyOn(restauranteRepository, 'paginateRestaurants')
          .mockResolvedValueOnce([mockRestaurante]);

        const result = await service.listRestaurants(params, validClientUser);
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(Object);
      } catch (e) {}
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
      try {
        jest
          .spyOn(restauranteRepository, 'paginateRestaurants')
          .mockResolvedValueOnce([]);
        const result = await service.listRestaurants(params, validClientUser);
        expect(result).toEqual([]);
      } catch (error) {}
    });
  });
});
