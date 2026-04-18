// ========== TypeORM Repository（NestJS）==========
// examples/stage3-java-vs-nestjs/02-orm/typeorm-repository.ts

import { Entity, PrimaryGeneratedColumn, Column, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column()
  age: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: Partial<User>): Promise<User> {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { username } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async update(id: number, dto: Partial<User>): Promise<User> {
    await this.userRepo.update(id, dto);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }
}
