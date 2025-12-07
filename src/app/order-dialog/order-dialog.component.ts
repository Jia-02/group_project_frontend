import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FullOrderData } from '../order-page/order-page.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
  ],
  templateUrl: './order-dialog.component.html',
  styleUrl: './order-dialog.component.scss'
})
export class OrderDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderDialogComponent>,
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
}
