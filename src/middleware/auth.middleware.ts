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
import { axiosErrorHandler } from '../../util/errors/axiosErrorsHandler';
@Injectable()
export class TokenVerification implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const namePath = `/${req.path.split('/')[1]}`;
    const userAdmin = {
      id: 1,
      nombre: 'Pepito',
      apellido: 'Perez',
      numero_documento: 13456654,
      celular: '+573155680091',
      correo: 'admin@admin.com',
      id_rol: 1,
      nombreRol: 'Admin',
    };
    const userEmpleado = {
      id: 2,
      nombre: 'Dave Jhon',
      apellido: 'Smith',
      numero_documento: 45661234,
      celular: '+573155680091',
      correo: 'empleado@empleado.com',
      id_rol: 3,
      nombreRol: 'Empleado',
    };
    const userPropietario = {
      id: 1,
      nombre: 'Edwin Tobias',
      apellido: 'Ariza Tellez',
      numero_documento: 12345687987,
      celular: '+573155680091',
      correo: 'propietario@propietario.com',
      id_rol: 2,
      nombreRol: 'Propietario',
    };
    const userCliente = {
      id: 89,
      nombre: 'Sarah',
      apellido: 'Smith',
      numero_documento: 31578902,
      celular: '+573155680091',
      correo: 'sarahsmith@example.com',
      id_rol: 4,
      nombreRol: 'Cliente',
    };
    req.query.usuario = {};

    switch (req.baseUrl) {
      case '/restaurantes':
        switch (namePath) {
          case '/create':
            Object.assign(req.query.usuario, userAdmin);
            break;
          case '/list':
            Object.assign(req.query.usuario, userCliente);
            break;
        }
        break;
      case '/platos':
        switch (namePath) {
          case '/list-by-restaurant':
            Object.assign(req.query.usuario, userCliente);
            break;
          default:
            Object.assign(req.query.usuario, userPropietario);
            break;
        }
        break;
      case '/pedidos':
        switch (namePath) {
          case '/create':
            Object.assign(req.query.usuario, userCliente);
            break;
          case '/cancel-order':
            Object.assign(req.query.usuario, userCliente);
            break;
          default:
            Object.assign(req.query.usuario, userEmpleado);
            break;
        }
        break;
      case '/empleados-restaurantes':
        switch (namePath) {
          case '/create':
            Object.assign(req.query.usuario, userPropietario);
            break;
        }
        break;
    }
    next();
  }
}
