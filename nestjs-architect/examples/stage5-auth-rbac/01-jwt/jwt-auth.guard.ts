// ========== JWT Auth Guard ==========

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      const message = info?.name === 'TokenExpiredError'
        ? 'Token 已过期，请重新登录'
        : info?.name === 'JsonWebTokenError'
        ? 'Token 无效'
        : '未登录或登录已失效';
      throw err || new UnauthorizedException(message);
    }
    return user;
  }
}
