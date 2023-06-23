import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantesModule } from './restaurantes/restaurantes.module';
import { PlatosModule } from './platos/platos.module';
import { RestauranteEntity } from '../database/typeorm/entities/Restaurante.entity';
import { CategoriaEntity } from '../database/typeorm/entities/Categoria.entity';
import { PedidoEntity } from '../database/typeorm/entities/Pedido.entity';
import { PedidoPLatoEntity } from '../database/typeorm/entities/PedidoPlato.entity';
import { PlatoEntity } from '../database/typeorm/entities/Plato.entity';
import { EmpleadoRestauranteEntity } from '../database/typeorm/entities/EmpeladoRestaurante.entity';
import { PedidosModule } from './pedidos/pedidos.module';
import { EmpleadosRestaurantesModule } from './empleados_restaurantes/empleados_restaurantes.module';
import * as dotenv from 'dotenv';
dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DEV_PG_PLAZA_HOST,
      port: parseInt(process.env.DEV_PG_PLAZA_PORT),
      username: process.env.DEV_PG_PLAZA_USERNAME,
      password: process.env.DEV_PG_PLAZA_PASSWORD,
      database: process.env.DEV_PG_PLAZA_DATABASE,
      entities: [
        RestauranteEntity,
        CategoriaEntity,
        PedidoEntity,
        PedidoPLatoEntity,
        PlatoEntity,
        EmpleadoRestauranteEntity,
      ],
      ssl: { rejectUnauthorized: false },
      // logging: true,
    }),
    RestaurantesModule,
    PlatosModule,
    PedidosModule,
    EmpleadosRestaurantesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
