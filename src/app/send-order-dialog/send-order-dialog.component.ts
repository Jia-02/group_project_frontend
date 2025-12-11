import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../data/data.service';

@Component({
  selector: 'app-send-order-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './send-order-dialog.component.html',
  styleUrl: './send-order-dialog.component.scss'
})
export class SendOrderDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SendOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateOrderData,
    public dataService: DataService
  ) { }

  down(item: OrderProductCreate, groupIndex: number): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.deleteItem(item, groupIndex);
      return;
    }
    this.recalculatePrices();
  }

  deleteItem(itemToRemove: OrderProductCreate, groupIndex: number): void {
    const group = this.data.order_detailsList[groupIndex];

    if (group && group.orderDetails.length === 1) {
      this.data.order_detailsList.splice(groupIndex, 1);
    } else if (group) {
      const itemIndex = group.orderDetails.findIndex((item: any) => item === itemToRemove);
      if (itemIndex > -1) {
        group.orderDetails.splice(itemIndex, 1);
      }
    }

    this.recalculatePrices();
  }

  up(item: OrderProductCreate): void {
    item.quantity++;
    this.recalculatePrices();
  }

  recalculatePrices(): void {
    let newTotal = 0;

    this.data.order_detailsList.forEach(group => {
      let groupTotal = 0;

      group.orderDetails.forEach((item: OrderProductCreate) => {
        const optionAddPrice = item.detailList.reduce((acc, option) => acc + option.addPrice, 0);
        const actualUnitPrice = item.productPrice + optionAddPrice;

        groupTotal += actualUnitPrice * item.quantity;
      });

      group.orderDetailsPrice = groupTotal;
      newTotal += groupTotal;
    });
    this.data.totalPrice = newTotal;
  }

  getItemTotalPrice(item: OrderProductCreate): number {
    const optionAddPrice = item.detailList.reduce((sum, detail) => sum + detail.addPrice, 0);

    const actualUnitPrice = item.productPrice + optionAddPrice;

    return actualUnitPrice * item.quantity;
}

  addOrder() {
    this.dialogRef.close();
  }

  sendOut() {
    const now = new Date();
    const ordersDate = now.toISOString().slice(0, 10);
    const ordersTime = now.toLocaleTimeString('zh-TW', { hour12: false });

    const finalOrderDetailsList = this.data.order_detailsList.map((group, index) => {
      const orderDetailsId = index + 1;

      let orderDetailsPrice = 0;
      group.orderDetails.forEach((item: OrderProductCreate) => {
        const optionAddPrice = item.detailList.reduce((acc, option) => acc + option.addPrice, 0);

        orderDetailsPrice += (item.productPrice + optionAddPrice) * item.quantity;

        item.quantity = 1;
      });

      return {
        orderDetailsId: orderDetailsId,
        orderDetailsPrice: orderDetailsPrice,
        settingId: group.settingId,
        orderDetails: group.orderDetails.map((item: any) => ({
          categoryId: item.categoryId || 0,
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          detailList: item.detailList
        }))
      };
    });

    const requestBody = {
      ordersType: this.data.ordersType,
      ordersDate: ordersDate,
      ordersTime: ordersTime,
      totalPrice: this.data.totalPrice,
      paymentType: this.data.paymentType,
      paid: false,
      ordersCode: null,
      customerName: this.data.ordersType === 'A' ? null : this.data.customerName,
      customerPhone: this.data.ordersType === 'A' ? null : this.data.customerPhone,
      customerAddress: this.data.ordersType === 'D' ? this.data.customerAddress : null,
      tableId: this.data.ordersType === 'A' ? this.data.tableId : null,

      orderDetailsList: finalOrderDetailsList
    };

    console.log('API Request Body:', requestBody);

    this.dataService.postApi('http://localhost:8080/orders/add', requestBody)
      .subscribe((res: any) => {
        console.log('下單成功', res);
        this.dialogRef.close(true);
      }
      );
  }

}

interface DetailOption {
  option: string;
  addPrice: number;
}

interface OrderProductCreate {
  categoryId?: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  detailList: DetailOption[];
}

interface OrderDetailGroup {
  orderDetailsId: number;
  orderDetailsPrice: number;
  settingId: number;
  orderDetails: OrderProductCreate[];
}

interface CreateOrderData {
  ordersType: string;
  ordersDate?: string;
  ordersTime?: string;
  totalPrice: number;
  paymentType: string;
  paid: boolean;
  ordersCode: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  tableId: string | null;
  order_detailsList: OrderDetailGroup[];
}
