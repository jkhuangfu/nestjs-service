import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/creat-user.dto';
import { User } from './entitys/user.entity';
import { Repository, Transaction } from 'typeorm';
import * as uuid from 'uuid';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(user: CreateUserDto) {
    const uid = uuid.v4();
    // const create_time = new Date();
    const body = { ...user, uid };
    const result = await this.userRepository.insert(body);
    return result.raw.affectedRows === 1;
  }

  test(uid: string) {
    return this.userRepository.find({
      relations: ['address'],
      where: { uid },
    });
  }

  test2() {
    return this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        let from = await this.userRepository.findOne({ where: { uid: '1' } });
        let to = await this.userRepository.findOne({ where: { uid: '2' } });
        if (from.age > 0) {
          // 送年龄
          transactionalEntityManager.save(User, {
            uid: from.uid,
            age: from.age - 10,
          });
          transactionalEntityManager.save(User, {
            uid: to.uid,
            age: to.age + 10,
          });
          return '送年龄成功';
        } else {
          return '年龄不足';
        }
        return 1;

        console.log('from,to', from, to);
      },
    );
  }

  // 联表查询
  async findUserWithProfile(uid: string): Promise<any> {
    const result = this.userRepository
      .createQueryBuilder('user')
      // user_address 表名  Address别名 user.uid = Address.uid 关联条件
      .leftJoinAndSelect('user.address', 'user_address')
      // 在这个例子中，'user.uid = :user_uid' 是 WHERE 子句的条件，它表示 "user 表的 uid 列等于某个值"。这个值是通过第二个参数 { user_uid: uid } 提供的。
      // :user_uid 是一个参数占位符，它在查询执行时会被 { user_uid: uid } 中的 user_uid 值替换。这种方式可以防止 SQL 注入攻击，因为 TypeORM 会确保这个值在插入查询之前被正确地转义。
      .where('user.uid = :user_uid', { user_uid: uid })
      // .setParameter('user_uid', uid)
      // 此处是为了解决使用了leftJoinAndSelect导致的select设置false后仍不能忽略的问题
      .select([
        'user.name',
        'user.age',
        'user_address.province',
        'user_address.city',
      ]);
    // console.log(result.getQueryAndParameters());
    return result.getOne();
  }
}
