import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { parse } from 'js2xmlparser';

const contType = 'Content-Type';
const json = 'application/json';
const plain = 'text/plain';
const xml = 'application/xml';

@Injectable()
export class ContentInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const content = req.header('Accept');
    return next.handle().pipe(
      map((data) => {
        switch (content) {
          case xml:
            res.header(contType, xml);
            data = parse('data', data);
            break;
          case plain:
            res.header(contType, plain);
            let stringData = '';
            for (const key of Object.keys(data)) {
              stringData += `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}&`;
            }
            data = stringData.substring(0, stringData.length - 1);
            break;
          case json:
          default:
            data = data;
            res.header(contType, json);
            break;
        }
        return data;
      })
    );
  }
}
