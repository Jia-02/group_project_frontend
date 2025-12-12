import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FullOrderData } from '../order-page/order-page.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../@service/data.service';


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
    private dataService: DataService,
  ) { }

  isEditing: boolean = false;

  calculateTotalPrice() {
    let newTotal = 0;

    for (const group of this.data.order_detailsList) {
      let groupPrice = 0;

      for (const item of group.orderDetails) {
        groupPrice += item.productPrice;

        for (const detail of item.detailList) {
          groupPrice += detail.addPrice;
        }
      }

      group.orderDetailsPrice = groupPrice;
      newTotal += groupPrice;
    }

    this.data.totalPrice = newTotal;
    console.log('總金額已更新:', newTotal);
  }

  saveChanges() {
    const updateData = {
      ...this.data,
      totalPrice: this.data.totalPrice,
      orderDetailsList: this.data.order_detailsList,
    };
    console.log(updateData);


    const apiUrl = 'http://localhost:8080/orders/update/nopaid';

    this.dataService.postApi(apiUrl, updateData)
      .subscribe((res: any) => {
          console.log('訂單修改成功:', res);
        }
      );
  }

  deleteDetail(groupIndex: number){
    this.data.order_detailsList.splice(groupIndex, 1);
    this.calculateTotalPrice();
  }

  changeDetail(groupIndex: number) {
    const detailGroup = this.data.order_detailsList[groupIndex];
  }

  deleteOptions(groupIndex: number, itemIndex: number, optionIndex: number){
    const detailList = this.data.order_detailsList[groupIndex].orderDetails[itemIndex].detailList;
    if (detailList) {
        detailList.splice(optionIndex, 1);
        this.calculateTotalPrice();
    }
  }

  changeOptions(groupIndex: number, itemIndex: number, optionIndex: number) {
    const option = this.data.order_detailsList[groupIndex].orderDetails[itemIndex].detailList[optionIndex];
  }

  close(): void {
    this.dialogRef.close();
  }

  checkOut() {
    this.data.paid = true;
    this.saveChanges();
    console.log('訂單付款狀態已更新為：已付 (true)', this.data.paid);
    this.dialogRef.close();
  }

  toggleEditMode() {
    if (this.isEditing) {
      this.calculateTotalPrice();
      this.saveChanges();
      this.isEditing = false;
    } else {
      this.isEditing = true;
    }

  }
}
