import { OrderDetailList } from './../@service/data.service';
import { Component, inject, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { FormsModule } from '@angular/forms';
import { DataService } from '../@service/data.service';
import { Router } from '@angular/router';
import { DialogNoticeComponent } from '../@dialog/dialog-notice/dialog-notice.component';
import { HttpClient } from '@angular/common/http';

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
    public dataService: DataService,
    private router: Router,
    private http: HttpClient
  ) {
    if (!data.totalPrice) {
      this.data.totalPrice = this.calculateTotalPrice(data.orderDetailsList);
    }
  }

  paymentType: string = '信用卡';
  readonly dialog = inject(MatDialog);

  reduce(item: RawOrderDetailItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.recalculateItemPriceAndTotal(item);
    } else if (item.quantity === 1) {
      const index = this.data.orderDetailsList.indexOf(item);
      if (index > -1) {
        this.data.orderDetailsList.splice(index, 1);
        this.data.totalPrice = this.calculateTotalPrice(this.data.orderDetailsList); // 重新計算總額
      }
    }
  }

  add(item: RawOrderDetailItem): void {
    item.quantity++;
    this.recalculateItemPriceAndTotal(item);
  }

  private recalculateItemPriceAndTotal(item: RawOrderDetailItem): void {
    let pricePerUnit = 0;

    if (item.settingId > 0) {
      pricePerUnit = item.orderDetails.reduce((productSum, product) => {
        let productPrice = product.productPrice;
        const customizationPrice = product.detailList.reduce((detailSum, detail) => detailSum + detail.addPrice, 0);
        return productSum + productPrice + customizationPrice;
      }, 0);


    } else {
      if (item.orderDetails && item.orderDetails.length > 0) {
        const product = item.orderDetails[0];
        pricePerUnit = product.productPrice;
        pricePerUnit += product.detailList.reduce((detailSum, detail) => detailSum + detail.addPrice, 0);
      }
    }

    item.orderDetailsPrice = pricePerUnit * item.quantity;

    this.data.totalPrice = this.calculateTotalPrice(this.data.orderDetailsList);

    (item as any).unitPriceForCalculation = pricePerUnit;
  }


  private calculateTotalPrice(list: RawOrderDetailItem[]): number {
    return list.reduce((sum, item) => sum + item.orderDetailsPrice, 0);
  }

  addOrder(): void {
    console.log('執行加點操作...');
    this.dialogRef.close({
      action: 'add',
      updatedData: this.data
    });
  }

  sendOut(): void {
    const now = new Date();

    const dateStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

    const timeStr = now.toTimeString().split(' ')[0];

    const expandedDetailsList: RawOrderDetailItem[] = this.data.orderDetailsList.flatMap(rawItem => {
      const quantity = rawItem.quantity && rawItem.quantity > 0 ? rawItem.quantity : 1;
      return Array.from({ length: quantity }, (_, index) => ({
        ...rawItem,
        quantity: undefined as any
      })) as RawOrderDetailItem[];
    });

    const targetDetailsList: TargetOrderDetailItem[] = expandedDetailsList.map((rawItem, index) => {
      const targetOrderDetails: TargetProductDetail[] = rawItem.orderDetails.map(product => ({
        ...product,
        mealStatus: "製作中"
      }));

      let finalPricePerUnit: number;
      const defaultProductPrice = rawItem.orderDetails[0]?.productPrice || 0;

      if (rawItem.settingId === 0) {
        finalPricePerUnit = (rawItem as any).itemPricePerUnit || defaultProductPrice;
      } else {
        finalPricePerUnit = (rawItem as any).pricePerUnit || defaultProductPrice;
      }

      return {
        orderDetailsId: (rawItem.orderDetailsId * 1 + index) * 1,
        orderDetailsPrice: finalPricePerUnit,
        settingId: rawItem.settingId,
        orderDetails: targetOrderDetails
      };
    });

    let customerName: string | null = null;
    let customerPhone: string | null = null;
    let customerAddress: string | null = null;
    let tableId: string | null = null;

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

    if (this.paymentType !== '現金') {
      this.data.paid = true;
    } else {
      this.data.paid = false;
    }

    if (this.data.totalPrice == 0) {
      this.dialog.open(DialogNoticeComponent, {
        data: { noticeType: 'noOrder' }
      });
    }

    const finalPayload: TargetOrderData = {
      ordersType: this.data.ordersType,
      ordersDate: dateStr,
      ordersTime: timeStr,
      totalPrice: this.data.totalPrice || this.calculateTotalPrice(this.data.orderDetailsList),
      paymentType: this.paymentType,
      paid: this.data.paid,
      ordersCode: null,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      tableId: tableId,
      orderDetailsList: targetDetailsList
    };

    console.log('準備送出的資料 (已修正價格和結構轉換):', finalPayload);

    this.dataService.postApi('orders/add', finalPayload)
      .subscribe((res: any) => {
        console.log('下單成功', res);
        const orderId = res.ordersId
        console.log(res.ordersId);
        this.dialogRef.close();
        this.goToPage(orderId);
      }
      );

    //   if (this.paymentType === '信用卡') {
    //   // 如果是信用卡，呼叫後端取得綠界跳轉表單
    //   this.http.post(url, finalPayload, { responseType: 'text' })
    //     .subscribe((htmlForm: string) => {
    //       // 1. 打開一個隱藏的 div 或是動態注入 HTML
    //       const div = document.createElement('div');
    //       div.innerHTML = htmlForm;
    //       document.body.appendChild(div);

    //       // 2. 綠界 SDK 產生的 HTML 通常內含 script 會自動 submit
    //       // 如果沒有自動跳轉，可以手動觸發：
    //       const form = div.querySelector('form');
    //       if (form) form.submit();
    //     });
    // } else {
    //   // 原本的現金支付邏輯
    //   this.dataService.postApi('orders/add', finalPayload)
    //     .subscribe((res: any) => {
    //       this.dialogRef.close();
    //       this.goToPage(res.ordersId);
    //     });
    // }
  }

  goToPage(orderId: number) {
    this.router.navigateByUrl(`/meal/status/user?orderId=${orderId}`);
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
  quantity: number;
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
  paid: boolean;
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
