import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Inject, LoggerService } from '@nestjs/common';
import { Response, Request } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Catch(HttpException)
export class HttpErrorExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private log: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const params = JSON.stringify(request.method === 'POST' ? request.body : request.query);
    const userAgent = request.headers['user-agent'];
    const url = request.url;

    this.log.error(
      JSON.stringify({
        userAgent,
        method: request.method,
        url,
        params,
      }),
    );
    response.status(status).json({
      code: status,
      message: exception.getResponse()['error'],
      timestamp: Date.now(),
      data: null,
    });
  }
}
