import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = exception.getResponse();

    const details = errorResponse['error'];
    const message = errorResponse['message'];

    let tempDetails = details;
    let tempMessage = message;

    if ([null, undefined].includes(details)) {
      tempDetails = errorResponse['details'];
    }

    if (typeof details === 'string') {
      tempDetails = message;
    }

    if (Array.isArray(message)) {
      tempMessage = details;
    }
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      detail: tempDetails,
      message: tempMessage,
      /* details: ![null, undefined].includes(errorResponse['error'])
        ? errorResponse['error']
        : errorResponse['details'],
      message: errorResponse['message'],*/
    });
  }
}
