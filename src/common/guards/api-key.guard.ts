import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctxType = context.getType<'http' | 'ws'>();
    const apiKey = process.env.API_KEY;
    if (ctxType === 'http') {
      const request = context.switchToHttp().getRequest();
      const clientKey =
        request.headers['x-api-key'] || request.headers['authorization'];
      if (!clientKey || clientKey !== apiKey)
        throw new UnauthorizedException('Invalid API Key');
      return true;
    }
    if (ctxType === 'ws') {
      const client = context.switchToWs().getClient();
      const clientKey =
        client.handshake?.auth?.apiKey ||
        client.handshake?.headers['x-api-key'] ||
        client.handshake?.query.apiKey;
      if (!clientKey || clientKey !== apiKey)
        throw new WsException('Invalid API Key');
      return true;
    }
    return false;
  }
}
