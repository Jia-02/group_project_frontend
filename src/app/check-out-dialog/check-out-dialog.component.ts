import { Component, Inject, inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { FullOrderData } from '../order-page/order-page.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../@service/data.service';
import { DialogDeleteComponent } from '../@dialog/dialog-delete/dialog-delete.component';


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
  currentlyEditing: { groupIndex: number, itemIndex: number } | null = null;
  customizationOptions: any[] | null = null;
  readonly dialog = inject(MatDialog);

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


    const apiUrl = 'orders/update/nopaid';

    this.dataService.postApi(apiUrl, updateData)
      .subscribe((res: any) => {
        console.log('訂單修改成功:', res);
      }
      );
  }

  cancel() {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: {
        deleteType: 'cancleOrder',
        orderNo: this.data.ordersCode
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.data.paymentType = '取消';
        this.saveChanges(); // ⭐ 只在這裡打 API
        console.log('訂單已被取消', this.data.paymentType);
        this.dialogRef.close(true);
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  checkOut() {

    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: {
        deleteType: 'checkOut',
        orderNo: this.data.ordersCode
      }
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.data.paid = true;
        this.saveChanges();
        console.log('訂單付款狀態已更新為：已付 (true)', this.data.paid);
        this.dialogRef.close(true);
      }
    });
  }

  editOrder(): void {
    this.dialogRef.close('edit');
  }
}
