import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { RestauranteEntity } from './Restaurante.entity';
import { CategoriaEntity } from './Categoria.entity';
import { PedidoPLatoEntity } from './PedidoPlato.entity';

@Entity('platos')
export class PlatoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  id_categoria: number;

  @Column()
  descripcion: string;

  @Column()
  precio: number;

  @Column()
  id_restaurante: number;

  @Column()
  url_imagen: string;

  @Column()
  activo: boolean;

  @ManyToOne(() => RestauranteEntity, (restaurante) => restaurante.platos)
  @JoinColumn({ name: 'id_restaurante' })
  restaurante: RestauranteEntity;

  @OneToOne(() => CategoriaEntity)
  @JoinColumn({ name: 'id_categoria' })
  categoria: CategoriaEntity;

  @OneToMany(() => PedidoPLatoEntity, (pedido_plato) => pedido_plato.plato)
  @JoinColumn({ name: 'id' })
  pedidos_platos: PedidoPLatoEntity[];
}
