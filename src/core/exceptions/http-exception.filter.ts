// src/filters/http-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '../../shared/enums/error.enum';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
    let errors = null;

    // 1. Xử lý lỗi NestJS HttpException chuẩn (Validation DTO, Unauthorized, NotFound...)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;

      message = typeof res === 'string' ? res : res.message;
      errors = res.errors || null;
      errorCode = res.errorCode || this.mapStatusToErrorCode(status);
    }

    // 2. Xử lý lỗi Trùng Lặp Dữ Liệu (Duplicate Key - E11000) của MongoDB
    else if (exception.code === 11000) {
      status = HttpStatus.CONFLICT; // Trả về 409 Conflict
      errorCode = ErrorCode.DUPLICATE_KEY_ERROR; // Hãy thêm mã này vào enum ErrorCode của bạn nếu chưa có

      // Bóc tách tên trường bị trùng để message trả về thân thiện với Frontend
      const field = Object.keys(exception.keyValue || {})[0];
      const value = exception.keyValue ? exception.keyValue[field] : '';
      message = field
        ? `Dữ liệu '${value}' của trường '${field}' đã tồn tại trong hệ thống.`
        : 'Dữ liệu đã tồn tại trong hệ thống.';
    }

    // 3. Xử lý lỗi Validation Schema của Mongoose (Ví dụ: Thiếu required, sai enum...)
    else if (exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST; // Trả về 400 Bad Request
      errorCode = ErrorCode.VALIDATION_ERROR;

      // Gom tất cả các lỗi validation của từng field lại thành một object/array gọn gàng
      message = 'Dữ liệu gửi lên không vượt qua vòng kiểm duyệt của Database';
      errors = Object.values(exception.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
    }

    // 4. Xử lý lỗi Truyền Sai Định Dạng ObjectId của MongoDB (CastError)
    else if (exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      errorCode = ErrorCode.BAD_REQUEST;
      message = `Giá trị '${exception.value}' truyền vào trường '${exception.path}' sai định dạng ID chuẩn.`;
    }

    // Log lỗi ra console phục vụ debug nội bộ
    console.error(`[Error] ${errorCode}: ${message}`, exception);

    // Trả response về dạng chuẩn hóa cho Frontend
    response.status(status).json({
      success: false,
      errorCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.CONFLICT:
        return ErrorCode.DUPLICATE_KEY_ERROR;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
