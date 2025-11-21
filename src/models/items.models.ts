import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Section } from "./sections.models";

@Entity("items")
export class Item {
  @PrimaryGeneratedColumn({ name: "item_id" })
  item_id: number;

  @Column({ name: "section_id", type: "int" })
  section_id: number;

  @ManyToOne(() => Section)
  @JoinColumn({ name: "section_id" })
  section: Section;

  @Column({ type: "varchar", length: 30 })
  name: string;

  @Column({ type: "varchar", length: 200 })
  description: string;

  @Column({ type: "numeric", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "createdAt", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", type: "timestamp" })
  updatedAt: Date;
}
