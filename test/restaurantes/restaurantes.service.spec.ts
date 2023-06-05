import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantesService } from '../../src/restaurantes/application/restaurantes.service';
import { createRestauranteDto } from '../../src/restaurantes/dto/restaurante.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpStatus } from '@nestjs/common';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { AppModule } from '../../src/app.module';
import { RestauranteRepository } from '../../src/restaurantes/domain/repositories/RestauranteRepository';
describe('RestaurantesService', () => {
  let service: RestaurantesService;
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
      expect(error.response.error.errors).toHaveLength(7);
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
      expect(error.message).toBe('No tiene permisos para crear el restaurante');
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
