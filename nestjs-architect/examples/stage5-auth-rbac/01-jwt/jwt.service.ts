// ========== JWT Service ==========

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async register(dto: { username: string; email: string; password: string }) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('该邮箱已被注册');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.userService.create({ ...dto, passwordHash });
    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    if (payload.type !== 'refresh') throw new UnauthorizedException('无效的刷新 Token');

    const user = await this.userService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('用户不存在');

    return this.generateTokens(user);
  }

  private generateTokens(user: { id: number; username: string; roles: string[] }) {
    const payload = { sub: user.id, username: user.username, roles: user.roles };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(
        { ...payload, type: 'refresh' },
        { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET }
      ),
    };
  }
}
