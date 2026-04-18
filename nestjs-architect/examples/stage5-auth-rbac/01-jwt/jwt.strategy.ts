// ========== JWT Strategy ==========

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      verifyOptions: { algorithms: ['HS256'], issuer: 'my-app' },
    });
  }

  async validate(payload: { sub: number; username: string; roles: string[] }) {
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) throw new UnauthorizedException('用户不存在或已被禁用');
    return { id: payload.sub, username: payload.username, roles: payload.roles };
  }
}
