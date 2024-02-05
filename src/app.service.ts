import { Inject, Injectable, OnApplicationBootstrap, type LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class AppService {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: LoggerService) {}

  sayHello() {
    this.logger.log('Hello 333 world!');
    return 'Hello Wor111ld!';
  }
}
