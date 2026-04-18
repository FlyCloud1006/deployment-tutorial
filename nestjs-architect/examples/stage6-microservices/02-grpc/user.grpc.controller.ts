// ========== gRPC 控制器 ==========

import { Controller } from '@nestjs/common';
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable, Subject } from 'rxjs';

@Controller()
export class UserGrpcController {
  private users = [
    { id: 1, username: '张三', email: 'zhangsan@example.com', age: 25, createdAt: '2026-01-01' },
    { id: 2, username: '李四', email: 'lisi@example.com', age: 30, createdAt: '2026-01-02' },
  ];

  @GrpcMethod('UserService', 'GetUser')
  getUser({ id }: { id: number }) {
    const user = this.users.find(u => u.id === id);
    return { user: user || null };
  }

  @GrpcMethod('UserService', 'CreateUser')
  createUser({ username, email, age }: { username: string; email: string; age: number }) {
    const newUser = { id: this.users.length + 1, username, email, age, createdAt: new Date().toISOString() };
    this.users.push(newUser);
    return { user: newUser };
  }

  @GrpcMethod('UserService', 'BatchGetUsers')
  batchGetUsers({ ids }: { ids: number[] }) {
    return { users: this.users.filter(u => ids.includes(u.id)) };
  }

  @GrpcMethod('UserService', 'StreamUsers')
  streamUsers({ id }: { id: number }): Observable<any> {
    const subject = new Subject<any>();
    const user = this.users.find(u => u.id === id);
    if (user) {
      subject.next({ user });
      setTimeout(() => subject.next({ user: { ...user, age: user.age + 1 } }), 1000);
      setTimeout(() => subject.complete(), 2000);
    } else {
      subject.complete();
    }
    return subject.asObservable();
  }

  @GrpcStreamMethod('UserService', 'BatchCreateUsers')
  batchCreateUsers(dataStream: Observable<any>): Observable<any> {
    return new Observable(observer => {
      const created: any[] = [];
      dataStream.subscribe({
        next: (data) => created.push({ id: this.users.length + created.length + 1, ...data, createdAt: new Date().toISOString() }),
        error: (err) => observer.error(err),
        complete: () => {
          this.users.push(...created);
          observer.next({ createdCount: created.length, users: created });
          observer.complete();
        },
      });
    });
  }
}
