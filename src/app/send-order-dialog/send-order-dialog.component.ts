import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { CreateOrderData, OrderProductCreate } from '../test-page/test-page.component';

@Component({
  selector: 'app-send-order-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
  ],
  templateUrl: './send-order-dialog.component.html',
  styleUrl: './send-order-dialog.component.scss'
})
export class SendOrderDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SendOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreateOrderData,

  ) { }

  customerDetail(): string {
    if (this.data.orderType === '內用') {
      return `桌號: ${this.data.tableId || 'N/A'}`;
    }
    if (this.data.orderType === '外帶' || this.data.orderType === '外送') {
      const name = this.data.customerName ? ` (${this.data.customerName})` : '';
      const address = this.data.customerAddress ? ` / 地址: ${this.data.customerAddress}` : '';
      return `${name}${address}`;
    }
    return '';
  }

  up(item: OrderProductCreate): void {
    item.quantity++;
    this.recalculatePrices();
  }

  down(item: OrderProductCreate): void {
    item.quantity--;
    this.recalculatePrices();
  }

  recalculatePrices(): void {
    let newTotal = 0;

    this.data.order_detailsList.forEach(group => {
      let groupTotal = 0;

      group.orderDetails.forEach(item => {
        const itemPrice = item.productPrice + item.detailList.reduce((acc, option) => acc + option.addPrice, 0);
        groupTotal += itemPrice * item.quantity;
      });
      group.orderDetailsPrice = groupTotal;
      newTotal += groupTotal;
    });
    this.data.totalPrice = newTotal;
  }

  addOrder() {
    this.dialogRef.close();
  }

  sendOut() {
    this.dialogRef.close();
  }

}
