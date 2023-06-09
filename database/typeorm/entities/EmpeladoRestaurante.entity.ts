import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { RestauranteEntity } from './Restaurante.entity';

@Entity('empleados_restaurantes')
export class EmpleadoRestauranteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_empleado: number;

  @Column()
  id_restaurante: number;

  @ManyToOne(() => RestauranteEntity, (restaurante) => restaurante)
  @JoinColumn({ name: 'id_restaurante' })
  restaurante: RestauranteEntity;
}
