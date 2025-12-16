import { reservation } from './../../@interface/interface';
import { HttpClientService } from './../../@service/http-client.service';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { scheduleItem } from '../../@interface/interface';

@Component({
  selector: 'app-dialog-delete',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
  ],
  templateUrl: './dialog-delete.component.html',
  styleUrl: './dialog-delete.component.scss'
})
export class DialogDeleteComponent {

  constructor(
    private httpClientService: HttpClientService
  ) { }

  readonly dialogRef = inject(MatDialogRef<DialogDeleteComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  onNoClick() {
    this.dialogRef.close();
  }

  onCheckClick() {

    // 刪除預約
    if (this.data.deleteType == 'reservation') {
      const payload = {
        reservationDate: this.data.reservationDate,
        reservationPhone: this.data.reservationPhone
      };

      this.httpClientService.postApi('reservation/delete', payload)
        .subscribe((res: any) => {
          if (res.code == 200) {
            console.log('預約刪除成功', res);
            this.dialogRef.close(true);
          }
        });
    }


    // 刪除餐點
    else if (this.data.deleteType == 'product') {
      const payload = {
        categoryId: this.data.categoryId,
        productId: this.data.productId
      };

      this.httpClientService.postApi('product/del', payload)
        .subscribe((res: any) => {
          if (res.code == 200) {
            console.log('餐點刪除成功', res);
            this.dialogRef.close(true);
          } else {
            console.log('刪除失敗', res);
            alert('商品販售中，不可以刪除!!!');
          }
        });
    }


    // 刪除客製化
    else if (this.data.deleteType == 'option') {
      const payload = {
        categoryId: this.data.categoryId,
        optionId: this.data.optionId
      };

      this.httpClientService.postApi('option/del', payload)
        .subscribe((res: any) => {
          if (res.code == 200) {
            console.log('餐點刪除成功', res);
            this.dialogRef.close(true);
          } else {
            console.log('刪除失敗', res);
          }
        });
    }

    // 刪除套餐
    else if (this.data.deleteType == 'set') {
      const payload = {
        categoryId: this.data.categoryId,
        settingId: this.data.settingId
      };

      this.httpClientService.postApi('setting/del', payload)
        .subscribe((res: any) => {
          if (res.code == 200) {
            console.log('餐點刪除成功', res);
            this.dialogRef.close(true);
          } else {
            console.log('刪除失敗', res);
            alert('商品販售中，不可以刪除!!!');
          }
        });
    }
  }
}
