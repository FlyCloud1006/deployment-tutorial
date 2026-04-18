// ========== 熔断器实现 ==========

import { Injectable, Logger } from '@nestjs/common';

export enum CircuitBreakerState { CLOSED = 'CLOSED', OPEN = 'OPEN', HALF_OPEN = 'HALF_OPEN' }

export interface CircuitBreakerOptions {
  name: string;
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

@Injectable()
export class CircuitBreakerService {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = 0;
  private readonly logger = new Logger(CircuitBreakerService.name);

  constructor(private readonly options: Partial<CircuitBreakerOptions> = {}) {
    this.options = {
      name: 'default',
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 30000,
      ...options,
    } as Required<CircuitBreakerOptions>;
  }

  async execute<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const { name, failureThreshold, successThreshold, timeout } = this.options as Required<CircuitBreakerOptions>;

    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        if (fallback) return fallback();
        throw new Error(`CircuitBreaker [${name}] OPEN`);
      }
      this.state = CircuitBreakerState.HALF_OPEN;
      this.logger.log(`CircuitBreaker [${name}] OPEN → HALF_OPEN`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess() {
    const { successThreshold } = this.options as Required<CircuitBreakerOptions>;
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.logger.log(`CircuitBreaker [${(this.options as any).name}] HALF_OPEN → CLOSED`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure() {
    const { name, failureThreshold, timeout } = this.options as Required<CircuitBreakerOptions>;
    this.failureCount++;
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + timeout;
      this.logger.warn(`CircuitBreaker [${name}] HALF_OPEN → OPEN`);
    } else if (this.failureCount >= failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + timeout;
      this.logger.warn(`CircuitBreaker [${name}] CLOSED → OPEN (failures: ${this.failureCount})`);
    }
  }

  getState(): CircuitBreakerState { return this.state; }
  reset() { this.state = CircuitBreakerState.CLOSED; this.failureCount = 0; this.successCount = 0; }
}
