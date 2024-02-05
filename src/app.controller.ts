import { Controller, Get } from '@nestjs/common';

import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppService } from './app.service';

// @Controller('MP_verify_tGmHaGktkQYkf6kr.txt')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    // return 'tGmHaGktkQYkf6kr';
    return this.appService.sayHello();
  }
}
