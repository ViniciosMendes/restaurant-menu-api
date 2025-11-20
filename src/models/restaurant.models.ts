import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RestaurantOpeningHour } from './restaurantopeninghour.models';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20 })
  name: string;

  @Column({ name: 'kitchen_type', length: 50 })
  kitchenType: string;

  @Column({ length: 30 })
  city: string;

  @Column({ length: 2 })
  uf: string;

  @Column({ length: 11 })
  contact: string;

  @Column({ default: true })
  isActive: boolean;

  // Correção: seu SQL usa createdAt (camelCase)
  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(
    () => RestaurantOpeningHour,
    (openingHour) => openingHour.restaurant,
  )
  openingHours: RestaurantOpeningHour[];
}
