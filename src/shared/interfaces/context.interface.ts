import { ClientSession } from 'mongoose';

export interface RequestContext {
  session?: ClientSession;
  traceId?: string;
  userId?: string;
}
