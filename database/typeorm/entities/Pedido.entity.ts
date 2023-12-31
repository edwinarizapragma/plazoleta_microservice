import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { RestauranteEntity } from './Restaurante.entity';
import { PedidoPLatoEntity } from './PedidoPlato.entity';
@Entity('pedidos')
export class PedidoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_cliente: number;

  @Column()
  fecha: Date;

  @Column()
  estado: string;

  @Column()
  id_chef: number;

  @Column()
  id_restaurante: number;

  @Column()
  codigo_verificacion: string;

  @ManyToOne(() => RestauranteEntity, (restaurante) => restaurante.pedidos)
  @JoinColumn({ name: 'id_restaurante' })
  restaurante: RestauranteEntity;

  @OneToMany(() => PedidoPLatoEntity, (pedido_plato) => pedido_plato.pedido)
  @JoinColumn({ name: 'id' })
  pedidos_platos: PedidoPLatoEntity[];
}
