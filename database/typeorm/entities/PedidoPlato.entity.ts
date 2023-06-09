import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PedidoEntity } from './Pedido.entity';
import { PlatoEntity } from './Plato.entity';

@Entity('pedidos_platos')
export class PedidoPLatoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_pedido: number;

  @Column()
  id_plato: number;

  @Column()
  cantidad: number;

  @ManyToOne(() => PedidoEntity, (pedido) => pedido.pedidos_platos)
  @JoinColumn({ name: 'id_pedido' })
  pedido: PedidoEntity;

  @ManyToOne(() => PlatoEntity, (plato) => plato.pedidos_platos)
  @JoinColumn({ name: 'id_plato' })
  plato: PlatoEntity;
}
