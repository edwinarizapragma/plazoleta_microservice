import { ConfigService } from '@nestjs/config';
export class credentialsConnDbPlaza {
  constructor(private configService: ConfigService) {}

  getNodeEnv() {
    return this.configService.get('NODE_ENV');
  }
  getCredentials(node_env: string) {
    switch (node_env) {
      case 'development':
        const host = this.configService.get('DEV_PG_PLAZA_HOST');
        const port = this.configService.get('DEV_PG_PLAZA_PORT');
        const username = this.configService.get('DEV_PG_PLAZA_USERNAME');
        const password = this.configService.get('DEV_PG_PLAZA_PASSWORD');
        const database = this.configService.get('DEV_PG_PLAZA_DATABASE');

        return {
          username,
          password,
          database,
          host,
          port,
        };
    }
  }
}
