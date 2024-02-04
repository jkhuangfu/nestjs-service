import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Exclude, Expose } from 'class-transformer';

@Entity('user', { synchronize: false })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uid: string;

  @Column()
  name: string;

  @Column()
  sex: number;

  @Column()
  age: number;

  @Column()
  create_time: Date;

  @UpdateDateColumn({ select: false })
  update_time: Date;

  @OneToOne(() => Address)
  @JoinColumn({ name: 'uid' })
  address: Address;
}
