import {
  Catch,
  NotFoundException,
  ExceptionFilter,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import * as express from 'express';
import { handleAppRequest, handleStaticFileRequest } from './ng-universal';

@Catch(NotFoundException)
export class NgUniversalFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: express.Response = ctx.getResponse();
    const request: express.Request = ctx.getRequest();

    if (request.method === 'GET' && !request.path.startsWith('/api')) {
      if (request.path.includes('.')) {
        handleStaticFileRequest(request, response, ctx.getNext());
      } else {
        handleAppRequest(request, response);
      }
    } else {
      response.status(404).send(exception.message);
    }
  }
}
