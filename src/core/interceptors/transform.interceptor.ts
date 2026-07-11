// src/interceptors/transform.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        // Nếu data có thuộc tính 'total', đó là PaginatedResult
        // Chúng ta trả về đúng cấu trúc "chuẩn" mà FE cần
        if (data && typeof data === 'object' && 'total' in data) {
          return {
            success: true,
            message: 'Request successful',
            data: data.data,
            meta: {
              total: data.total,
              page: data.page,
              limit: data.limit,
              totalPages: data.totalPages,
              hasNext: data.hasNext,
              hasPrev: data.hasPrev,
            },
          };
        }
        return {
          success: true,
          message: 'Request successful',
          data: data,
          meta: null,
        };
      }),
    );
  }
}
