import { Test, TestingModule } from '@nestjs/testing';
import { PlatosService } from '../../src/platos/application/platos.service';
import { AppModule } from '../../src/app.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { RestauranteEntity } from '../../database/typeorm/entities/Restaurante.entity';
import { PlatoEntity } from '../../database/typeorm/entities/Plato.entity';
import { CategoriaEntity } from '../../database/typeorm/entities/Categoria.entity';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { cretePlatoDto } from '../../src/platos/dto/createPlato.dto';

describe('PlatosService', () => {
  let service: PlatosService;

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
        {
          provide: getRepositoryToken(RestauranteEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(PlatoEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CategoriaEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PlatosService>(PlatosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('CreatePlatoFunction', () => {
    it('test create plato with valid input', async () => {
      const fieldsToCreate = new cretePlatoDto();
      fieldsToCreate.nombre = 'Arroz chino';
      fieldsToCreate.id_categoria = 1;
      fieldsToCreate.descripcion =
        'Arroz chino con camarones, carne de cerdo, pollo y raíces';
      fieldsToCreate.precio = 35000;
      fieldsToCreate.id_restaurante = 1;
      fieldsToCreate.url_imagen = '/storage/foto_arroz.png';
      const result = await service.createPlato(fieldsToCreate);
      expect(result).toEqual({
        nombre: 'Arroz chino',
        precio: 35000,
        descripcion:
          'Arroz chino con camarones, carne de cerdo, pollo y raíces',
      });
    });
  });

  it('test create plato with multiple validation error', async () => {
    const fieldsToCreate = new cretePlatoDto();
    fieldsToCreate.nombre = '';
    fieldsToCreate.id_categoria = -1;
    fieldsToCreate.descripcion = '';
    fieldsToCreate.precio = -1;
    fieldsToCreate.id_restaurante = -1;
    fieldsToCreate.url_imagen = '';
    try {
      await service.createPlato(fieldsToCreate);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      expect(error.message).toBe('Errores de validación');
      expect(error.response.error.errors).toHaveLength(6);
    }
  });

  it('test restaurant or category doesnt exists', async () => {
    const fieldsToCreate = new cretePlatoDto();
    fieldsToCreate.nombre = 'Pollo a la broaster';
    fieldsToCreate.id_categoria = 999;
    fieldsToCreate.descripcion = 'Pollo frito apanado';
    fieldsToCreate.precio = 35000;
    fieldsToCreate.id_restaurante = 999;
    fieldsToCreate.url_imagen = '/storage/foto_pollo.png';
    try {
      await service.createPlato(fieldsToCreate);
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
