import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  public currentOrder = {
    ordersType: '' as 'A' | 'T' | 'D' | '', // A: 內用 (In-store), T: 外帶 (Take-out), D: 外送 (Delivery)
    tableId: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    orderDetailsList: [] as any[], // 存放購物車商品
    // 其他欄位...
  };

  constructor() { }

  // 清除訂單資料（例如，在結帳成功後）
  resetOrder() {
    this.currentOrder = {
      ordersType: '',
      tableId: '',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      orderDetailsList: [],
    };
  }

  // 取得訂單模式
  getOrderType(): string {
    return this.currentOrder.ordersType;
  }

}

