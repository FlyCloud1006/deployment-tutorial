// ========== 单元测试示例 ==========

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepo: jest.Mocked<UserRepository>;

  const mockUser = { id: 1, username: '张三', email: 'zhangsan@example.com', age: 25, status: 'active' as const };

  beforeEach(async () => {
    const mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(UserRepository);
  });

  describe('findById', () => {
    it('应该返回用户', async () => {
      userRepo.findById.mockResolvedValue(mockUser);
      const result = await service.findById(1);
      expect(result).toEqual(mockUser);
    });

    it('用户不存在时抛出 NotFoundException', async () => {
      userRepo.findById.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('应该创建用户', async () => {
      const createDto = { username: '张三', email: 'zhangsan@example.com', password: '123456' };
      userRepo.create.mockResolvedValue(mockUser);
      const result = await service.create(createDto);
      expect(result).toEqual(mockUser);
    });
  });
});
