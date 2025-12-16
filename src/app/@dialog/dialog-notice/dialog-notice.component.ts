import { Component, inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogTitle, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-dialog-notice',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
  ],
  templateUrl: './dialog-notice.component.html',
  styleUrl: './dialog-notice.component.scss'
})
export class DialogNoticeComponent {
  constructor() { }

  readonly dialogRef = inject(MatDialogRef<DialogNoticeComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  noticeMessage = '';

  ngOnInit(): void {
    // 提醒電話號碼需7-10碼
    if (this.data.noticeType == 'phoneLength') {
      this.noticeMessage = '電話號碼長度需為 7-10 碼，\n請檢查後重新輸入';
    } else if (this.data.noticeType == 'tableClose') {
      this.noticeMessage = '此桌位當日已有預約，無法關閉桌位';
    } else if (this.data.noticeType == 'delCategory') {
      this.noticeMessage = '該分類下存在商品，不可刪除分類'
    }

  }

  onNoClick() {
    this.dialogRef.close();
  }

  onCheckClick() {
    this.dialogRef.close(true);
  }
}
