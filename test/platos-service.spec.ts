import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PlatosService } from '../src/platos/application/use_cases/platos.service';
import { RestaurantesService } from '../src/restaurantes/application/use_cases/restaurantes.service';
import { UserMicroService } from '../util/finders/findUserById';
import { RestauranteEntity } from '../database/typeorm/entities/Restaurante.entity';
import { PlatoEntity } from '../database/typeorm/entities/Plato.entity';
import { PlatoRepository } from '../src/platos/infrastructure/repositories/PlatoRepository';
import { CategoriaRepository } from '../src/platos/infrastructure/repositories/CategoriaRepository';
import { RestauranteRepository } from '../src/restaurantes/infrastructure/repositories/RestauranteRepository';
import { createPlatoDto } from '../src/platos/interfaces/dto/createPlato.dto';
import { updatePlatoDto } from '../src/platos/interfaces/dto/updatePlato.dto';
import { updateStatusPlatoDto } from '../src/platos/interfaces/dto/updateStatusPlato.dto';
import { listByRestaurantDto } from '../src/platos/interfaces/dto/listByRestaraunt.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PlatosService', () => {
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
  let service: PlatosService;
  let categoriaRepository: CategoriaRepository;
  let platosRepository: PlatoRepository;

  const mockRestaurante: RestauranteEntity = {
    platos: [],
    pedidos: [],
    empleados_restaurantes: [],
    id: 1,
    nombre: 'McDonalds',
    direccion: 'Carrera 1 # 100-10',
    id_propietario: validOwnerUser.id,
    telefono: '+573156487925',
    url_logo: 'storage/foto.jpg',
    nit: 2377793501,
  };
  const mockFindPlato: PlatoEntity = {
    id: 4,
    nombre: 'Arroz chino',
    id_categoria: 1,
    descripcion: 'Arroz chino con camarones, carne de cerdo, pollo y raíces',
    precio: 35000,
    id_restaurante: 1,
    url_imagen: '',
    activo: true,
    restaurante: mockRestaurante,
    categoria: undefined,
    pedidos_platos: [],
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        PlatoRepository,
        PlatosService,
        RestaurantesService,
        UserMicroService,
        RestauranteRepository,
        CategoriaRepository,
      ],
    }).compile();

    service = module.get<PlatosService>(PlatosService);
    platosRepository = module.get<PlatoRepository>(PlatoRepository);
    categoriaRepository = module.get<CategoriaRepository>(CategoriaRepository);
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test category when doesnt exist return true', async () => {
    jest
      .spyOn(categoriaRepository, 'findOnlyIdCategory')
      .mockResolvedValueOnce(null);
    const result: boolean = await service.categoryNotExists(-1);
    expect(result).toBe(true);
  });

  describe('CreatePlatoFunction', () => {
    const mockCreatePlato: PlatoEntity = {
      id: 1,
      nombre: 'Arroz chino',
      id_categoria: 1,
      descripcion: 'Arroz chino con camarones, carne de cerdo, pollo y raíces',
      precio: 35000,
      id_restaurante: 9999,
      url_imagen: '',
      activo: true,
      restaurante: undefined,
      categoria: undefined,
      pedidos_platos: [],
    };
    it('test create plato with valid input', async () => {
      const fieldsToCreate = new createPlatoDto();
      fieldsToCreate.nombre = 'Arroz chino';
      fieldsToCreate.id_categoria = 1;
      fieldsToCreate.descripcion =
        'Arroz chino con camarones, carne de cerdo, pollo y raíces';
      fieldsToCreate.precio = 35000;
      fieldsToCreate.id_restaurante = 9999;
      fieldsToCreate.url_imagen = '/storage/foto_arroz.png';
      try {
        jest.spyOn(service, 'categoryNotExists').mockResolvedValueOnce(false);
        jest
          .spyOn(service, 'getRestaurantById')
          .mockResolvedValueOnce(mockRestaurante);

        jest
          .spyOn(platosRepository, 'createNewPlato')
          .mockResolvedValue(mockCreatePlato);

        const result = await service.createPlato(
          fieldsToCreate,
          validOwnerUser,
        );
        expect(result).toBeDefined();
        expect(result).toEqual({ message: 'Plato creado exitosamente' });
      } catch (error) {}
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
        jest.spyOn(service, 'categoryNotExists').mockResolvedValueOnce(false);
        const mockRestauranteError = Object.assign({}, mockRestaurante);
        mockRestauranteError.id_propietario = 999;
        jest
          .spyOn(service, 'getRestaurantById')
          .mockResolvedValueOnce(mockRestauranteError);
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
        expect(error.response.error).toHaveLength(6);
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
        jest.spyOn(service, 'categoryNotExists').mockResolvedValueOnce(true);
        jest.spyOn(service, 'getRestaurantById').mockResolvedValueOnce(null);
        await service.createPlato(fieldsToCreate, validOwnerUser);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toBeDefined();
        expect(error.response.error).toEqual(
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
      try {
        jest
          .spyOn(service, 'findPLatoById')
          .mockResolvedValueOnce(mockFindPlato);

        const mockUpdatedPlato = Object.assign({}, mockFindPlato);
        mockUpdatedPlato.precio = 12000;
        mockUpdatedPlato.descripcion = 'Arroz con pollo y verduras';

        jest
          .spyOn(platosRepository, 'updatePlato')
          .mockResolvedValue(mockUpdatedPlato);
        const result = await service.updatePlato(
          16,
          validFields,
          validOwnerUser,
        );
        expect(result).toEqual({ message: 'Plato actualizado correctamente' });
      } catch (err) {}
    });

    it('test update plato with user is not owner of restaurant', async () => {
      const validFields = new updatePlatoDto();
      validFields.precio = 12000;
      validFields.descripcion = 'Arroz con pollo y verduras';

      try {
        const mockPlatoDifferentOwner = Object.assign({}, mockFindPlato);
        mockPlatoDifferentOwner.restaurante.id_propietario = 909;
        jest
          .spyOn(service, 'findPLatoById')
          .mockResolvedValueOnce(mockPlatoDifferentOwner);
        await service.updatePlato(29, validFields, validOwnerUser);
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

    it('test update plato whit non existent plato id', async () => {
      const validFields = new updatePlatoDto();
      validFields.descripcion = 'new description';
      validFields.precio = 50000;
      jest.spyOn(service, 'findPLatoById').mockResolvedValueOnce(null);
      await expect(
        service.updatePlato(-1, validFields, validOwnerUser),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('UpdateStatusPlatoFunction', () => {
    it('test update plato status with valid input', async () => {
      const validFields = new updateStatusPlatoDto();
      validFields.activo = false;
      try {
        jest
          .spyOn(service, 'findPLatoById')
          .mockResolvedValueOnce(mockFindPlato);
        const mockUpdatePlato = Object.assign({}, mockFindPlato);
        mockUpdatePlato.activo = false;
        jest
          .spyOn(platosRepository, 'updatePlato')
          .mockResolvedValue(mockUpdatePlato);

        const result = await service.updateStatusPlato(
          18,
          validFields,
          validOwnerUser,
        );
        expect(result).toEqual({
          message: 'Se desactivo el plato exitosamente',
        });
      } catch (error) {}
    });

    it('test update status of a dish that belongs to another restaurant', async () => {
      const validFields = new updateStatusPlatoDto();
      validFields.activo = false;

      try {
        jest
          .spyOn(service, 'findPLatoById')
          .mockResolvedValueOnce(mockFindPlato);
        const mockPlatoDifferentOwner = Object.assign({}, mockFindPlato);
        mockPlatoDifferentOwner.restaurante.id_propietario = 909;
        await service.updateStatusPlato(29, validFields, validOwnerUser);
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

  describe('listPlatosByRestaurantFunction', () => {
    it('test list of dishes with valid input', async () => {
      const params = new listByRestaurantDto();
      params.perPage = 10;
      params.page = 1;
      try {
        jest
          .spyOn(service, 'getRestaurantById')
          .mockResolvedValueOnce(mockRestaurante);

        jest
          .spyOn(platosRepository, 'listByRestaurantId')
          .mockResolvedValueOnce([mockFindPlato]);
        const result = await service.listByRestaurant(
          1,
          params,
          validClientUser,
        );
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(Object);
      } catch (err) {}
    });

    it('test list of dishes with validation error', async () => {
      const params = new listByRestaurantDto();
      params.perPage = null;
      params.page = 1;

      try {
        await service.listByRestaurant(1, params, validClientUser);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toHaveLength(3);
      }
    });

    it('test list of dishes from a restaurant that does not exist', async () => {
      const params = new listByRestaurantDto();
      params.perPage = 5;
      params.page = 2;

      try {
        jest.spyOn(service, 'getRestaurantById').mockResolvedValueOnce(null);
        await service.listByRestaurant(999999, params, validClientUser);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(error.message).toBe('Errores de validación');
        expect(error.response.error).toEqual(
          expect.arrayContaining([
            expect.stringMatching(
              /El restaurante proporcionado no se encuentra registrado/,
            ),
          ]),
        );
      }
    });
  });
});
