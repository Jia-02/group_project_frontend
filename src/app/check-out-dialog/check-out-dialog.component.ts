import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FullOrderData } from '../order-page/order-page.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-check-out-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './check-out-dialog.component.html',
  styleUrl: './check-out-dialog.component.scss'
})
export class CheckOutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CheckOutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FullOrderData,

  ) { }

  isEditing: boolean = false;

  customerDetail(): string {
    if (this.data.orderType === '內用') {
      return `桌號: ${this.data.tableId}`;
    }
    if (this.data.orderType === '外帶' || this.data.orderType === '外送') {
      const name = this.data.customerName ? ` (${this.data.customerName})` : '';
      const address = this.data.customerAddress ? ` / 地址: ${this.data.customerAddress}` : '';
      return `${name}${address}`;
    }
    return '';
  }

  deleteDetail(groupIndex: number){
    this.data.order_detailsList.splice(groupIndex, 1);
  }

  changeDetail(groupIndex: number) {
    const detailGroup = this.data.order_detailsList[groupIndex];
  }

  deleteOptions(groupIndex: number, itemIndex: number, optionIndex: number){
    const detailList = this.data.order_detailsList[groupIndex].orderDetails[itemIndex].detailList;
    const optionName = detailList[optionIndex].option;
    detailList.splice(optionIndex, 1);
  }

  changeOptions(groupIndex: number, itemIndex: number, optionIndex: number) {
    const option = this.data.order_detailsList[groupIndex].orderDetails[itemIndex].detailList[optionIndex];
  }

  close(): void {
    this.dialogRef.close();
  }

  checkOut() {
    this.data.paid = true;
    console.log('訂單付款狀態已更新為：已付 (true)', this.data.paid);
    this.dialogRef.close();
  }

  toggleEditMode(): void {
    if (this.isEditing) {
      console.log('儲存訂單修改...');
    }

    this.isEditing = !this.isEditing;
    console.log('目前編輯模式狀態:', this.isEditing);
  }
}
