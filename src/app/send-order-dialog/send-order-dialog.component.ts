import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { CreateOrderData, OrderProductCreate } from '../test-page/test-page.component';
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
    public dataService: DataService,
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
    const now = new Date();
    const ordersDate = now.toISOString().slice(0, 10);
    const ordersTime = now.toLocaleTimeString('en-US', { hour12: false });

    let flatOrderDetails: any[] = [];

    this.data.order_detailsList.forEach(group => {
      const settingId = group.settingId;

      group.orderDetails.forEach(item => {
        const basePrice = item.productPrice;
        const addPrice = item.detailList.reduce((sum, detail) => sum + detail.addPrice, 0);
        const itemTotalPrice = basePrice + addPrice;

        for (let i = 0; i < item.quantity; i++) {
          flatOrderDetails.push({
            productId: item.productId,
            productPrice: item.productPrice,
            quantity: 1,
            totalPrice: itemTotalPrice,
            mealStatus: item.mealStatus,
            settingId: settingId,
            detailList: item.detailList
          });
        }
      });
    });

    const requestBody = {
      ordersType: this.data.orderType,
      ordersDate: ordersDate,
      ordersTime: ordersTime,
      totalPrice: this.data.totalPrice,
      paymentType: this.data.paymentType,
      paid: false,
      ordersCode: null,
      customerName: this.data.orderType === 'A' ? null : this.data.customerName,
      customerPhone: this.data.orderType === 'A' ? null : this.data.customerPhone,
      customerAddress: this.data.orderType === 'D' ? this.data.customerAddress : null,
      tableId: this.data.orderType === 'A' ? this.data.tableId : null,
      orderDetails: flatOrderDetails
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
