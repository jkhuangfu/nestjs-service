import { Entity, PrimaryColumn, Column, OneToOne, Relation } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Address {
  @PrimaryColumn({ select: false })
  uid: string;

  @Column()
  province: string;

  @Column()
  city: string;

  @OneToOne(() => User)
  user: Relation<User>;
}
