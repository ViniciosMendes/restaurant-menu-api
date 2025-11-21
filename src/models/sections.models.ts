import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Restaurant } from "./restaurant.models";

@Entity("sections")
export class Section {
  @PrimaryGeneratedColumn({ name: "section_id" })
  section_id: number;

  @Column({ name: "restaurant_id", type: "int", nullable: true })
  restaurant_id: number;

  @ManyToOne(() => Restaurant)
  @JoinColumn({ name: "restaurant_id" })
  restaurant: Restaurant;

  @Column({ type: "varchar", length: 30 })
  name: string;

  @Column({ type: "varchar", length: 200 })
  description: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "createdAt", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", type: "timestamp" })
  updatedAt: Date;
}
