import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { EmpleadosRestaurantesService } from '../../src/empleados_restaurantes/applications/use_cases/empleados_restaurantes.service';
import { CreateEmpleadoService } from '../../src/empleados_restaurantes/infrastructure/axios/createEmpleado.service';
import { UserMicroService } from '../../util/finders/findUserById';
import { RestaurantesService } from '../../src/restaurantes/application/use_cases/restaurantes.service';
import { EmpleadoRestauranteEntity } from '../../database/typeorm/entities/EmpeladoRestaurante.entity';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { EmpleadosRestaurantesRepository } from '../../src/empleados_restaurantes/infrastructure/repositories/EmpleadoRestauranteRepository';
import { RestauranteRepository } from '../../src/restaurantes/infrastructure/repositories/RestauranteRepository';
import { CreateEmpleadoRestauranteDto } from '../../src/empleados_restaurantes/interfaces/dto/CreateEmpleadoRestaurante.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('EmpleadosRestaurantesService', () => {
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
  const mockEmpleadoRestaurante: EmpleadoRestauranteEntity = {
    id: 1,
    id_empleado: 1,
    id_restaurante: 1,
    restaurante: undefined,
  };
  let service: EmpleadosRestaurantesService;
  let createEmpleadoService: CreateEmpleadoService;
  let empleadoRestauranteRepository: EmpleadosRestaurantesRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        EmpleadosRestaurantesService,
        RestaurantesService,
        RestauranteRepository,
        UserMicroService,
        EmpleadosRestaurantesRepository,
        CreateEmpleadoService,
      ],
    }).compile();

    service = module.get<EmpleadosRestaurantesService>(
      EmpleadosRestaurantesService,
    );
    createEmpleadoService = module.get<CreateEmpleadoService>(
      EmpleadosRestaurantesService,
    );
    empleadoRestauranteRepository = module.get<EmpleadosRestaurantesRepository>(
      EmpleadosRestaurantesRepository,
    );
    await module.close();
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
      try {
        jest
          .spyOn(service, 'getRestaurantById')
          .mockResolvedValueOnce(mockRestaurante);
        jest
          .spyOn(createEmpleadoService, 'createEmployee')
          .mockResolvedValueOnce(validEmployeeUser);
        jest
          .spyOn(empleadoRestauranteRepository, 'createRow')
          .mockResolvedValueOnce(mockEmpleadoRestaurante);
        const result = await service.create(fieldsToCreate, ``, validOwnerUser);
        expect(result).toEqual({
          message: `${fieldsToCreate.nombre} ${fieldsToCreate.apellido} ha sido registrado y asociado al restaurante exitosamente`,
        });
      } catch (error) {}
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
        jest.spyOn(service, 'getRestaurantById').mockResolvedValueOnce(null);
        await service.create(fieldsToCreate, ``, validOwnerUser);
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
        const mockRestaurantDiffOwner = Object.assign({}, mockRestaurante);
        mockRestaurantDiffOwner.id_propietario = 90999;
        jest
          .spyOn(service, 'getRestaurantById')
          .mockResolvedValueOnce(mockRestaurantDiffOwner);
        await service.create(fieldsToCreate, ``, validOwnerUser);
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
        await service.create(fieldsToCreate, ``, validOwnerUser);
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
      try {
        jest
          .spyOn(service, 'findDataEmployeeId')
          .mockResolvedValueOnce(mockEmpleadoRestaurante);
        const result = await service.findByEmployee(88);
        expect(result).toBeInstanceOf(EmpleadoRestauranteEntity);
      } catch (err) {}
    });

    it('find info with id that doesnt exists', async () => {
      try {
        jest.spyOn(service, 'findDataEmployeeId').mockResolvedValueOnce(null);
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
