// ========== Consul 服务 ==========

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConsulService implements OnModuleInit {
  private readonly logger = new Logger(ConsulService.name);
  private readonly consulUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.consulUrl = this.configService.get('CONSUL_URL', 'http://localhost:8500');
  }

  async registerService(service: {
    name: string; id: string; address: string; port: number;
    healthCheck?: { path: string; interval: string };
  }): Promise<void> {
    const payload: any = {
      Name: service.name, ID: service.id,
      Address: service.address, Port: service.port,
      Tags: ['nestjs', 'api'],
    };

    if (service.healthCheck) {
      payload.Check = {
        HTTP: `http://${service.address}:${service.port}${service.healthCheck.path}`,
        Interval: service.healthCheck.interval,
        Timeout: '5s',
        DeregisterCriticalServiceAfter: '30s',
      };
    }

    await firstValueFrom(this.httpService.put(`${this.consulUrl}/v1/agent/service/register`, payload));
    this.logger.log(`服务已注册: ${service.name}:${service.id}`);
  }

  async deregisterService(serviceId: string): Promise<void> {
    await firstValueFrom(this.httpService.put(`${this.consulUrl}/v1/agent/service/deregister/${serviceId}`));
    this.logger.log(`服务已注销: ${serviceId}`);
  }

  async discoverService(serviceName: string): Promise<{ address: string; port: number }[]> {
    const response = await firstValueFrom(
      this.httpService.get(`${this.consulUrl}/v1/health/service/${serviceName}`, { params: { passing: true } }),
    );
    return (response.data as any[]).map((s: any) => ({ address: s.Service.Address, port: s.Service.Port }));
  }

  async getKv(key: string): Promise<string | null> {
    const response = await firstValueFrom(this.httpService.get(`${this.consulUrl}/v1/kv/${key}`));
    const data = response.data as any[];
    if (!data || data.length === 0) return null;
    return Buffer.from(data[0].Value, 'base64').toString('utf8');
  }

  async setKv(key: string, value: string): Promise<void> {
    await firstValueFrom(this.httpService.put(`${this.consulUrl}/v1/kv/${key}`, value));
  }

  onModuleInit() {
    this.logger.log(`Consul 服务已初始化: ${this.consulUrl}`);
  }
}
