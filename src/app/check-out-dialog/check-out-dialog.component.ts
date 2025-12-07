import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FullOrderData } from '../order-page/order-page.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-check-out-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
  ],
  templateUrl: './check-out-dialog.component.html',
  styleUrl: './check-out-dialog.component.scss'
})
export class CheckOutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CheckOutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FullOrderData,

  ){}

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

  close(): void {
    this.dialogRef.close();
  }

  checkOut(){
    // 目前有錯
    this.data.paid == true;
    this.dialogRef.close();
  }

}
