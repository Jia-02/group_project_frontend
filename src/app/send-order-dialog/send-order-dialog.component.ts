import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule } from '@angular/forms';
import { DataService } from '../@service/data.service';

@Component({
  selector: 'app-send-order-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './send-order-dialog.component.html',
  styleUrl: './send-order-dialog.component.scss'
})
export class SendOrderDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SendOrderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RawOrderData,
    public dataService: DataService
  ) {
    if (!data.totalPrice) {
      this.data.totalPrice = this.calculateTotalPrice(data.orderDetailsList);
    }
  }

  paymentType: string = 'creditCard';

  private calculateTotalPrice(list: RawOrderDetailItem[]): number {
    return list.reduce((sum, item) => sum + item.orderDetailsPrice, 0);
  }

  addOrder(): void {
    console.log('執行加點操作...');
    this.dialogRef.close('add');
  }

  sendOut(): void {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    const targetDetailsList: TargetOrderDetailItem[] = this.data.orderDetailsList.map(rawItem => {
      const targetOrderDetails: TargetProductDetail[] = rawItem.orderDetails.map(product => ({
        ...product,
        mealStatus: "製作中"
      }));

      return {
        orderDetailsId: rawItem.orderDetailsId,
        orderDetailsPrice: rawItem.orderDetailsPrice,
        settingId: rawItem.settingId,
        orderDetails: targetOrderDetails
      };
    });

    let customerName: string | null = null;
    let customerPhone: string | null = null;
    let customerAddress: string | null = null;
    let tableId: string | null = null;
    let paymentType: string;

    switch (this.data.ordersType) {
      case 'A': tableId = this.data.tableId || null; break;
      case 'T':
        customerName = this.data.customerName || null;
        customerPhone = this.data.customerPhone || null;
        break;
      case 'D':
        customerName = this.data.customerName || null;
        customerPhone = this.data.customerPhone || null;
        customerAddress = this.data.customerAddress || null;
        break;
    }

    const finalPayload: TargetOrderData = {
      ordersType: this.data.ordersType,
      ordersDate: dateStr,
      ordersTime: timeStr,
      totalPrice: this.calculateTotalPrice(this.data.orderDetailsList),
      paymentType: this.paymentType,
      paid: false,
      ordersCode: null,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      tableId: tableId,
      orderDetailsList: targetDetailsList
    };

    console.log('準備送出的資料 (已修正價格和結構轉換):', finalPayload);

    this.dataService.postApi('http://localhost:8080/api/orders', finalPayload)
      .subscribe((res: any) => {
        console.log('下單成功', res);
        const orderId = res?.orderId
        this.dialogRef.close(finalPayload);
      }
      );

    alert('訂單已模擬送出，請查看 Console！');
    this.dialogRef.close(finalPayload);
  }

}

interface RawProductDetail {
  categoryId: number;
  productId: number;
  productName: string;
  productPrice: number;
  detailList: any[];
}

interface RawOrderDetailItem {
  orderDetailsId: number;
  orderDetailsPrice: number;
  settingId: number;
  settingName: string;
  orderDetails: RawProductDetail[];
  settingOptions: any;
}

interface RawOrderData {
  ordersType: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderDetailsList: RawOrderDetailItem[];
  totalPrice: number;
  paymentType: string;
}


interface TargetProductDetail extends RawProductDetail {
  mealStatus: string;
}

interface TargetOrderDetailItem {
  orderDetailsId: number;
  orderDetailsPrice: number;
  settingId: number;
  orderDetails: TargetProductDetail[];
}


interface TargetOrderData {
  ordersType: string;
  ordersDate: string;
  ordersTime: string;
  totalPrice: number;
  paymentType: string;
  paid: boolean;
  ordersCode: null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  tableId: string | null;
  orderDetailsList: TargetOrderDetailItem[];
}
