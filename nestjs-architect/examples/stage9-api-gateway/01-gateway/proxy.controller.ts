// ========== 代理控制器 ==========

import { Controller, All, Param, Query, Body, Headers, Req, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  private readonly routes = {
    'user': { host: 'user-service', port: 3001 },
    'order': { host: 'order-service', port: 3002 },
    'product': { host: 'product-service', port: 3003 },
  };

  @All('api/:service/:path(*)')
  async proxy(
    @Param('service') service: string,
    @Param('path') path: string,
    @Query() query: any,
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const target = this.routes[service as keyof typeof this.routes];
    if (!target) return res.status(HttpStatus.NOT_FOUND).json({ error: 'Service not found' });
    await this.proxyService.forward(req, target, path, query, body, {}, res);
  }
}
