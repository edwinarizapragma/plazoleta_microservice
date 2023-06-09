import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { PlatoEntity } from './Plato.entity';
import { PedidoEntity } from './Pedido.entity';
import { EmpleadoRestauranteEntity } from './EmpeladoRestaurante.entity';
@Entity('restaurantes')
export class RestauranteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  @Column()
  id_propietario: number;

  @Column()
  telefono: string;

  @Column()
  url_logo: string;

  @Column()
  nit: number;

  @OneToMany(() => PlatoEntity, (plato) => plato.restaurante)
  @JoinColumn({ name: 'id' })
  platos: PlatoEntity[];

  @OneToMany(() => PedidoEntity, (pedido) => pedido.restaurante)
  @JoinColumn({ name: 'id' })
  pedidos: PedidoEntity[];

  @OneToMany(
    () => EmpleadoRestauranteEntity,
    (empleado_restaurante) => empleado_restaurante.restaurante,
  )
  @JoinColumn({ name: 'id' })
  empleados_restaurantes: EmpleadoRestauranteEntity[];
}
