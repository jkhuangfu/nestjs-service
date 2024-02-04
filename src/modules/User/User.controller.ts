import { Body, Controller, Get, Inject, LoggerService, Param, Post, Query } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { UserService } from './User.service';
import { User } from './entitys/user.entity';
import { CreateUserDto } from './dto/creat-user.dto';

@Controller('user')
export class UserController {
  constructor(
    private service: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: LoggerService,
  ) {}

  @Get()
  log() {
    this.logger.log('日志测试----');
    this.logger.error('----日志测试----');
    return 999;
  }

  @Post('create')
  async create(@Body() user: CreateUserDto): Promise<any> {
    // const body = JSON.parse(JSON.stringify(user));
    // body.uid = uuid.v1();
    return this.service.create(user);
  }

  @Get('test')
  async test(@Query('uid') uid: string): Promise<any> {
    return this.service.test(uid);
  }

  @Get('test2')
  async test2(@Query('uid') uid: string): Promise<any> {
    return this.service.test2();
  }

  @Get('byid')
  async findUserById(@Query('uid') uid: string): Promise<any> {
    return this.service.findUserWithProfile(uid);
  }

  // @Post('update')
  // async updateUser(@Body() user: User): Promise<any> {
  //   const id = user.uid;
  //   const resut = (await this.service.updateUser(id, user)) === 1;

  //   return {
  //     code: 200,
  //     message: resut ? '更新成功' : '更新失败',
  //     url: this.config.get('URL'),
  //   };
  // }
}
