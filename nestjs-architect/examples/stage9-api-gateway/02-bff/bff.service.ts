// ========== BFF 服务 ==========

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BffService {
  constructor(private httpService: HttpService) {}

  async getUserCenter(userId: number) {
    const [user, orders, preferences] = await Promise.all([
      this.fetchUser(userId),
      this.fetchUserOrders(userId),
      this.fetchUserPreferences(userId),
    ]);

    return {
      profile: { id: user.id, username: user.username, avatar: user.avatar },
      recentOrders: orders.slice(0, 5).map(o => ({ id: o.id, status: o.status, totalAmount: o.totalAmount })),
      stats: { totalOrders: orders.length, totalSpent: orders.reduce((sum, o) => sum + o.totalAmount, 0) },
      preferences: preferences.settings,
    };
  }

  async getProductDetail(productId: number) {
    const [product, inventory] = await Promise.all([
      this.fetchProduct(productId),
      this.fetchInventory(productId),
    ]);

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images?.slice(0, 5) || [],
      stock: inventory.available,
    };
  }

  private async fetchUser(userId: number) {
    const { data } = await this.httpService.get(`http://user-service:3001/users/${userId}`).toPromise();
    return data;
  }

  private async fetchUserOrders(userId: number) {
    const { data } = await this.httpService.get(`http://order-service:3002/orders`, { params: { userId, limit: 5 } }).toPromise();
    return data.list || [];
  }

  private async fetchUserPreferences(userId: number) {
    const { data } = await this.httpService.get(`http://user-service:3001/users/${userId}/preferences`).toPromise();
    return data;
  }

  private async fetchProduct(productId: number) {
    const { data } = await this.httpService.get(`http://product-service:3003/products/${productId}`).toPromise();
    return data;
  }

  private async fetchInventory(productId: number) {
    const { data } = await this.httpService.get(`http://inventory-service:3004/inventory/${productId}`).toPromise();
    return data;
  }
}
