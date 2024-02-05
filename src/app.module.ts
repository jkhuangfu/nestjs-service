import { type MiddlewareConsumer, Module, type NestModule, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import xmlBodyParser from 'express-xml-bodyparser';
import { format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { HttpErrorExceptionFilter } from './common/exceptions/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors';
import { UserModule } from './modules/User/User.module';
import { LoginModule } from './modules/login/login.module';
import { QlModule } from './modules/ql/ql.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          config: {
            host: configService.get('REDIS_HOST') || '127.0.0.1',
            port: configService.get('REDIS_PORT') || 6379,
            db: configService.get('REDIS_DB') || 0,
          },
        };
      },
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          exitOnError: false,
          format: format.combine(
            format.colorize(),
            format.timestamp({
              format: 'YYYY/MM/DD HH:mm:ss',
            }),
            format.label({
              label: 'services',
            }),
            format.splat(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level}: [${info.label}]${info.message}`;
            }),
          ),
          transports: [
            new transports.Console({
              level: 'info',
            }),
            new DailyRotateFile({
              filename: `${configService.get('LOG_PATH') || 'logs'}/%DATE%.log`,
              datePattern: 'YYYY-MM-DD-HH',
              zippedArchive: true,
              maxSize: '20m',
              maxFiles: '14d',
            }),
          ],
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          // synchronize: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          logging: true,
        };
      },
    }),
    UserModule,
    LoginModule,
    QlModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpErrorExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(xmlBodyParser({})).forRoutes('*');
  }
}
