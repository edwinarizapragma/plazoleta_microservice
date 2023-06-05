import { Test, TestingModule } from '@nestjs/testing';
import { PlatosService } from '../../src/platos/application/platos.service';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { PlatoEntity } from '../../database/typeorm/entities/Plato.entity';
import { CategoriaEntity } from '../../database/typeorm/entities/Categoria.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { createPlatoDto } from '../../src/platos/dto/createPlato.dto';
import { updatePlatoDto } from '../../src/platos/dto/updatePlato.dto';
import { updateStatusPlatoDto } from '../../src/platos/dto/updateStatusPlato.dto';
import { PlatoRepository } from '../../src/platos/domain/repositories/PlatoRepository';
import { CategoriaRepository } from '../../src/platos/domain/repositories/CategoriaRepository';
import { RestauranteRepository } from '../../src/restaurantes/domain/repositories/RestauranteRepository';
describe('PlatosService', () => {
  let service: PlatosService;
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

  const validEmployeeUser = {
    id: 77,
    nombre: 'Dave Jhon',
    apellido: 'Smith',
    numero_documento: 45661234,
    celular: '+573156487925',
    correo: 'empleado@empleado.com',
    id_rol: 3,
    nombreRol: 'Empleado',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forFeature([
          RestauranteEntity,
          PlatoEntity,
          CategoriaEntity,
        ]),
      ],
      providers: [
        PlatosService,
        PlatoRepository,
        RestauranteRepository,
        CategoriaRepository,
      ],
    }).compile();

    service = module.get<PlatosService>(PlatosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test category when doesnt exist return true', async () => {
    const result: boolean = await service.categoryNotExists(-1);
    expect(result).toBe(true);
  });

  it('test when plato doesnt exist return null', async () => {
    const result: boolean = await service.findPLatoById(-1);
    expect(result).toBe(null);
  });

  describe('CreatePlatoFunction', () => {
    it('test create plato with valid input', async () => {
      const fieldsToCreate = new createPlatoDto();
      fieldsToCreate.nombre = 'Arroz chino';
      fieldsToCreate.id_categoria = 1;
      fieldsToCreate.descripcion =
        'Arroz chino con camarones, carne de cerdo, pollo y raíces';
      fieldsToCreate.precio = 35000;
      fieldsToCreate.id_restaurante = 1;
      fieldsToCreate.url_imagen = '/storage/foto_arroz.png';

      const result = await service.createPlato(fieldsToCreate, validOwnerUser);
      expect(result).toEqual({
        nombre: 'Arroz chino',
        precio: 35000,
        descripcion:
          'Arroz chino con camarones, carne de cerdo, pollo y raíces',
      });
    });

    it('test create plato with user is not owner of restaurant', async () => {
      const fieldsToCreate = new createPlatoDto();
      fieldsToCreate.nombre = 'Arroz chino';
      fieldsToCreate.id_categoria = 1;
      fieldsToCreate.descripcion =
        'Arroz chino con camarones, carne de cerdo, pollo y raíces';
      fieldsToCreate.precio = 35000;
      fieldsToCreate.id_restaurante = 20;
      fieldsToCreate.url_imagen = '/storage/foto_arroz.png';

      try {
        await service.createPlato(fieldsToCreate, validOwnerUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
      }
    });

    it('test create plato with rol employee', async () => {
      const fieldsToCreate = new createPlatoDto();
      fieldsToCreate.nombre = 'Arroz con pollo';
      fieldsToCreate.id_categoria = 1;
      fieldsToCreate.descripcion = 'Arroz con pollo y verduras';
      fieldsToCreate.precio = 35000;
      fieldsToCreate.id_restaurante = 20;
      fieldsToCreate.url_imagen = '/storage/foto_arroz.png';

      try {
        await service.createPlato(fieldsToCreate, validEmployeeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe('No tiene permisos para crear el plato');
      }
    });

    it('test create plato with multiple validation error', async () => {
      const fieldsToCreate = new createPlatoDto();
      fieldsToCreate.nombre = '';
      fieldsToCreate.id_categoria = -1;
      fieldsToCreate.descripcion = '';
      fieldsToCreate.precio = -1;
      fieldsToCreate.id_restaurante = -1;
      fieldsToCreate.url_imagen = '';
      try {
        await service.createPlato(fieldsToCreate, validOwnerUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error.errors).toHaveLength(6);
      }
    });

    it('test restaurant or category doesnt exists', async () => {
      const fieldsToCreate = new createPlatoDto();
      fieldsToCreate.nombre = 'Pollo a la broaster';
      fieldsToCreate.id_categoria = 999;
      fieldsToCreate.descripcion = 'Pollo frito apanado';
      fieldsToCreate.precio = 35000;
      fieldsToCreate.id_restaurante = 999;
      fieldsToCreate.url_imagen = '/storage/foto_pollo.png';

      try {
        await service.createPlato(fieldsToCreate, validOwnerUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toBeDefined();
        expect(error.response.error.errors).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /El restaurante proporcionado no se encuentra registrado/,
            ),
            expect.stringMatching(
              /La categoría proporcionada no se encuentra registrada/,
            ),
          ]),
        );
      }
    });
  });

  describe('UpdatePlatoFunction', () => {
    it('test update plato with valid input', async () => {
      const validFields = new updatePlatoDto();
      validFields.precio = 12000;
      validFields.descripcion = 'Arroz con pollo y verduras';

      const result = await service.updatePlato(18, validFields, validOwnerUser);
      expect(result).toEqual({
        precio: 12000,
        descripcion: 'Arroz con pollo y verduras',
      });
    });

    it('test update plato with user is not owner of restaurant', async () => {
      const validFields = new updatePlatoDto();
      validFields.precio = 12000;
      validFields.descripcion = 'Arroz con pollo y verduras';

      try {
        await service.updatePlato(33, validFields, validOwnerUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
      }
    });

    it('test update plato with rol employee', async () => {
      const validFields = new updatePlatoDto();
      validFields.precio = 12000;
      validFields.descripcion = 'Arroz con pollo y verduras';

      try {
        await service.updatePlato(18, validFields, validEmployeeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(
          'No tiene permisos para actualizar el plato',
        );
      }
    });

    it('test update plato with invalid input', async () => {
      const fields = new updatePlatoDto();
      fields.descripcion = null;
      fields.precio = -20000;
      await expect(
        service.updatePlato(18, fields, validOwnerUser),
      ).rejects.toThrow(HttpException);
    });

    it('test update plato wthit non existent plato id', async () => {
      const validFields = new updatePlatoDto();
      validFields.descripcion = 'new description';
      validFields.precio = 50000;
      await expect(
        service.updatePlato(-1, validFields, validOwnerUser),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('UpdateStatusPlatoFunction', () => {
    it('test update plato status with valid input', async () => {
      const validFields = new updateStatusPlatoDto();
      validFields.activo = false;

      const result = await service.updateStatusPlato(
        18,
        validFields,
        validOwnerUser,
      );
      expect(result).toEqual({
        message: 'Se desactivo el plato exitosamente',
      });
    });

    it('test update status of a dish that belongs to another restaurant', async () => {
      const validFields = new updateStatusPlatoDto();
      validFields.activo = false;

      try {
        await service.updateStatusPlato(33, validFields, validOwnerUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
      }
    });

    it('test update status plato with rol employee', async () => {
      const validFields = new updateStatusPlatoDto();
      validFields.activo = true;

      try {
        await service.updateStatusPlato(18, validFields, validEmployeeUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(
          'No tiene permisos para actualizar el estado del plato plato',
        );
      }
    });
  });
});
