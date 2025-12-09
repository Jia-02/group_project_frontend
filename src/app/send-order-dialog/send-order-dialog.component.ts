import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { CreateOrderData, OrderProductCreate } from '../test-page/test-page.component';
import { MatIconModule } from '@angular/material/icon';

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
      const itemIndex = group.orderDetails.findIndex(item => item === itemToRemove);
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

      group.orderDetails.forEach(item => {

        const optionAddPrice = item.detailList.reduce((acc, option) => acc + option.addPrice, 0);

        const actualUnitPrice = item.productPrice + optionAddPrice;

        groupTotal += actualUnitPrice * item.quantity;
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
