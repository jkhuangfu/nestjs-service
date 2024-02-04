import { Injectable, NestInterceptor, ExecutionContext, CallHandler, LoggerService, Inject } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

interface Response<T> {
  data: T;
}
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private logger: LoggerService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const params = JSON.stringify(request.method === 'POST' ? request.body : request.query);
    const userAgent = request.headers['user-agent'];
    const url = request.url;

    const now = Date.now();
    return next.handle().pipe(
      tap((result) => {
        const logInfo = {
          userAgent,
          method: request.method,
          url,
          time: `${Date.now() - now}ms`,
          params,
          result,
        };
        this.logger.log(JSON.stringify(logInfo));
      }),
      map((data) => {
        return {
          code: 200,
          timestamp: Date.now(),
          msg: '请求成功',
          data,
        };
      }),
    );
  }
}
