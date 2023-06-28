import axios from 'axios';
import { axiosErrorHandler } from '../errors/axiosErrorsHandler';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class UserMicroService {
  async getDataUserById(idUsuario: number) {
    return {
      id: 89,
      nombre: 'Sarah',
      apellido: 'Smith',
      numero_documento: 31578902,
      celular: '+573155680091',
      correo: 'sarahsmith@example.com',
      id_rol: 4,
      rol: {
        id: 1,
        nombre: 'Cliente',
      },
    };
  }
}
