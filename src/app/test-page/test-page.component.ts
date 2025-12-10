import { Component } from '@angular/core';
import { SendOrderDialogComponent } from '../send-order-dialog/send-order-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-test-page',
  imports: [],
  templateUrl: './test-page.component.html',
  styleUrl: './test-page.component.scss'
})
export class TestPageComponent {
  // 測試送出訂單畫面
  sendOut(){
    const dataToSendToDialog = NEW_ORDER_DETAIL_MOCK;

    this.dialog.open(SendOrderDialogComponent, {
      width: '500px',
      height: '900px',
      data: dataToSendToDialog,
    })
  }

  constructor(
    public dialog: MatDialog,
    public dataService: DataService,
  ) { }

}

export interface DetailOption {
  option: string;
  addPrice: number;
}

export interface OrderProductCreate {
  quantity: number;
  productId: number;
  productName: string;
  productPrice: number;
  mealStatus: string;
  description: string;
  detailList: DetailOption[];
}

export interface OrderDetailsGroup {
  orderDetailsId: number;
  orderDetailsPrice: number;
  settingId: number;
  orderDetails: OrderProductCreate[];
}

export interface CreateOrderData {
  orderId: string | number;
  orderType: string;
  orderDate: string;
  orderTime: string;
  totalPrice: number;
  paymentType: string;
  paid: boolean;
  orderCode: string;
  tableId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  order_detailsList: OrderDetailsGroup[];
}

export const NEW_ORDER_DETAIL_MOCK: CreateOrderData = {
  orderId: 1002,
  orderCode: 'A1002',
  orderType: '內用',
  orderDate: '2025-12-08',
  orderTime: '16:30',
  totalPrice: 1250,
  paymentType: '電子支付',
  paid: false,
  tableId: 'A01',
  customerName: null,
  customerPhone: null,
  customerAddress: null,

  order_detailsList: [
    {
      orderDetailsId: 1,
      orderDetailsPrice: 790,
      settingId: 1,
      orderDetails: [
        {
          productId: 301,
          quantity: 1,
          productName: '鮭魚卵赤海膽丼',
          productPrice: 790,
          mealStatus: '已完成',
          description: '鮭魚',
          detailList: [
          ],
        },
      ],
    },

    {
      orderDetailsId: 2,
      orderDetailsPrice: 460,
      settingId: 1,
      orderDetails: [
        {
          productId: 302,
          quantity: 1,
          productName: '炙燒鮭魚起司花捲',
          productPrice: 460,
          mealStatus: '製作中',
          description: '鮭魚',
          detailList: [
          ],
        },
      ],
    },
  ]
}
