import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn} from 'typeorm';
import { Restaurant } from './restaurant.models';

@Entity('restaurant_opening_hours')
export class RestaurantOpeningHour {
  @PrimaryColumn({ name: 'restaurant_id' })
  restaurantId: number;

  @PrimaryColumn({ name: 'day_of_week', length: 10 })
  dayOfWeek: string;

  @Column({ name: 'opensAt', type: 'time' })
  opensAt: string;

  @Column({ name: 'closesAt', type: 'time' })
  closesAt: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.openingHours)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;
}
