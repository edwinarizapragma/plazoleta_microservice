import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env', // Ruta al archivo .env
    }),
  ],
})
export class ConfigAppModule {}
