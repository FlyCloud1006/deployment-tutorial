// ========== 密码服务 ==========

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validateStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push('密码至少8个字符');
    if (!/[A-Z]/.test(password)) errors.push('密码包含大写字母');
    if (!/[a-z]/.test(password)) errors.push('密码包含小写字母');
    if (!/[0-9]/.test(password)) errors.push('密码包含数字');

    const weakPasswords = ['password', '12345678', 'qwerty', 'admin'];
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('密码太简单');
    }

    return { valid: errors.length === 0, errors };
  }
}
