import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  message: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        const d = data as { meta?: unknown; data?: unknown; message?: string };
        if (d?.meta) {
          return {
            data: d.data,
            meta: d.meta,
            message: d.message ?? 'Operación exitosa',
          } as ApiResponse<T>;
        }
        return { data: d, message: 'Operación exitosa' } as ApiResponse<T>;
      }),
    );
  }
}
