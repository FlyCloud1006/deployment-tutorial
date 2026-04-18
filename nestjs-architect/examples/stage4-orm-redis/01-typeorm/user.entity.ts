// ========== TypeORM User Entity ==========

import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, VersionColumn, Index
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['status', 'createdAt'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'int', default: 0 })
  age: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'banned'], default: 'active' })
  status: 'active' | 'inactive' | 'banned';

  @Column({ type: 'json', nullable: true })
  profile: { bio?: string; avatar?: string; tags?: string[] };

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @VersionColumn()
  version: number;
}
