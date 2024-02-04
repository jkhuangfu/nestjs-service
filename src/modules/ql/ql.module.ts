import { Module } from '@nestjs/common';
import { QlService } from './ql.service';
import { QlController } from './ql.controller';

@Module({
  controllers: [QlController],
  providers: [QlService],
})
export class QlModule {}
