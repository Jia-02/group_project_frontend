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
  readonly data = inject<scheduleItem>(MAT_DIALOG_DATA);

  onNoClick() {
    this.dialogRef.close();
  }

  onCheckClick() {
    // 準備 API URL
    const url = `http://localhost:8080/reservation/delete`;

    // 準備傳給後端的 Body (JSON 物件)
    const body = {
      reservationDate: this.data.reservationDate,
      reservationPhone: this.data.reservationPhone
    };

    console.log('Deleting reservation:', body); // 除錯用

    // 發送 POST 請求
    this.httpClientService.postApi(url, body).subscribe({
      next: (res: any) => {
        // 假設後端回傳 code 200 代表成功
        if (res.code === 200 || res.message === 'Success') {
          // 關閉視窗，並回傳 'success' 給父元件
          this.dialogRef.close('success');
        } else {
          alert('刪除失敗：' + (res.message || '未知錯誤'));
        }
      },
      error: (err) => {
        console.error('API Error:', err);
        alert('刪除發生錯誤，請稍後再試');
      }
    });
  }
}
