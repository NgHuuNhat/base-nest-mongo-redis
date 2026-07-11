import { ErrorCode } from '../enums/error.enum';

export class ErrorResponse {
  constructor(
    public readonly message: string,
    public readonly errorCode: ErrorCode,
  ) {}

  toJSON() {
    return {
      message: this.message,
      errorCode: this.errorCode,
    };
  }
}
