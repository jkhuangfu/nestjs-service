import { Controller, Get, Post, Body, Patch, Param, Delete, All, Req, Res } from '@nestjs/common';
import { QlService } from './ql.service';
import { Request, Response } from 'express';
import { XmlResult } from './entities/ql.entity';

@Controller('ql')
export class QlController {
  constructor(private readonly qlService: QlService) {}

  @Post('wx')
  wx(@Body() data: Record<'xml', XmlResult>, @Res() res) {
    return this.qlService.wx(data, res);
  }

  @Get('wx')
  sign(@Req() req: Request) {
    return this.qlService.wxsign(req);
  }

  @Post('log')
  log(@Body('data') data: string) {
    return this.qlService.log(data);
  }
  @Get(':code')
  view(@Param('code') code: string, @Res() res: Response<any, Record<string, any>>) {
    return this.qlService.getBean(code, res);
  }

  @Get('test')
  test() {
    // return this.qlService.getBean('ox5xSuEo5joUlCN2_tA2FFZ48Qu4');
  }
}
