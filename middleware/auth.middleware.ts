import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { axiosErrorHandler } from '../util/errors/axiosErrorsHandler';
@Injectable()
export class TokenVerification implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
      throw new HttpException(
        {
          message: 'El token es requerido',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    await axios
      .get(`${process.env.URL_USUARIOS_MICROSERVICE}/auth/me`, {
        headers: { authorization: token },
      })
      .then(({ data }) => {
        req.query.usuario = data;
      })
      .catch((err) => {
        const e = axiosErrorHandler(err);
        throw new HttpException(
          {
            message: 'Error al validar el token',
            error: e,
          },
          e.statusCode ? e.statusCode : HttpStatus.INTERNAL_SERVER_ERROR,
        );
      });
    next();
  }
}
