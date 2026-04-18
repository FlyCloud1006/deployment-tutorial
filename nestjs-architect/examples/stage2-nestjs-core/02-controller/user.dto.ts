// ========== DTO 示例 ==========

import { IsString, IsEmail, IsNumber, IsOptional, MinLength, MaxLength, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: '张三' })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  username: string;

  @ApiProperty({ description: '邮箱', example: 'zhangsan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '密码', example: 'Password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @ApiPropertyOptional({ description: '昵称', example: '小张' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: '年龄', example: 25 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(150)
  age?: number;

  @ApiPropertyOptional({ description: '角色', enum: ['user', 'admin', 'vip'] })
  @IsEnum(['user', 'admin', 'vip'])
  @IsOptional()
  role?: 'user' | 'admin' | 'vip';
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(150)
  age?: number;
}
