import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as aws4 from 'aws4';
import * as dotenv from 'dotenv';
dotenv.config();

import { axiosErrorHandler } from '../../../../util/errors/axiosErrorsHandler';
import * as process from 'process';
@Injectable()
export class MensajeriaMicroServiceService {
  async sendSMSOrderNotification(numTelefonico: string) {
    const url = `${process.env.URL_MENSAJERIA_MICROSERVICE}`;
    const accessKeyId = process.env.AWS_API_MENSAJERIA_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_API_MENSAJERIA_SECRET_ACCESS_KEY;
    const body = {
      destino: numTelefonico,
    };
    const awsSignatureSign = aws4.sign(
      {
        method: 'POST',
        host: process.env.AWS_API_MENSAJERIA_HOST,
        path: `/Prod`,
        body: JSON.stringify(body),
        headers: {
          Host: process.env.AWS_API_MENSAJERIA_HOST,
          'Content-Type': 'application/json',
          'x-api-key': process.env.AWS_API_MENSAJERIA_API_KEY,
        },
        service: 'execute-api',
        region: 'us-east-1',
      },
      { accessKeyId, secretAccessKey },
    );
    const headers = awsSignatureSign.headers;
    delete headers['Content-Length'];
    return await axios
      .post(url, JSON.stringify(body), {
        headers,
      })
      .then(({ data }) => {
        return data;
      })
      .catch((err) => {
        const e = axiosErrorHandler(err);
        throw {
          message: 'Error al notificar al cliente',
          errors: e,
        };
      });
  }
}
