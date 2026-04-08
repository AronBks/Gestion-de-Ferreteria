import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmAsyncConfig = (
  configService: ConfigService,
): TypeOrmModuleAsyncOptions => ({
  useFactory: async () => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false, // ← Desactivado nuevamente
    logging: false,
  }),
  inject: [ConfigService],
});
