import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.url?.includes('/export') || request.url?.includes('/download')) {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => {
        if (Buffer.isBuffer(data)) {
          return data;
        }

        if (
          data &&
          typeof data === 'object' &&
          data.constructor &&
          data.constructor.name === 'Stream'
        ) {
          return data;
        }

        if (
          typeof data === 'string' &&
          data.length > 0 &&
          !data.startsWith('{') &&
          !data.startsWith('[')
        ) {
          return data;
        }

        return instanceToPlain(data, { excludeExtraneousValues: false });
      }),
    );
  }
}
