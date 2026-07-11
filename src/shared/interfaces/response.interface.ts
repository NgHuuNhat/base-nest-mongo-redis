import { ErrorCode } from '../../shared/enums/error.enum';

export interface INewErrorResponse {
  message: string;
  errorCode: ErrorCode;
}
