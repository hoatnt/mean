import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from '@nestjs/config';
import { APP_GUARD } from "@nestjs/core";
import {AuthGuard} from "./auth/auth.guard";
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import {AuthModule} from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        url: configService.get<string>('DATABASE'),
        logging: configService.get<boolean>('DATABASE_LOGGING'),
        autoLoadEntities: true
      }),
      inject: [ConfigService]
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl: string = configService.get<string>('CACHE_REDIS_URL');
        const ttl: number = configService.get<number>('CACHE_DEFAULT_TTL_MILLIS') || 3600000;
        return {
          stores: redisUrl
            ? [
              await redisStore({
                url: redisUrl
              })
            ]
            : undefined,
          namespace: 'main',
          ttl
        };
      },
      inject: [ConfigService]
    }),
    AuthModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthModule],
})
export class MeanModule {
}

