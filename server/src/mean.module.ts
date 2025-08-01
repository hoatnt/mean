import {Module} from '@nestjs/common';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from '@nestjs/config';
import { APP_GUARD } from "@nestjs/core";
import {AuthGuard} from "./auth/auth.guard";

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
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [TypeOrmModule],
})
export class MeanModule {
}

