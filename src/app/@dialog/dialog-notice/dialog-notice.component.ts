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
      this.noticeMessage = '該分類下存在商品，不可刪除分類';
    } else if (this.data.noticeType == 'addMenu') {
      this.noticeMessage = '必填欄位(名稱、價格、描述、圖片)不可為空';
    } else if (this.data.noticeType == 'peopleCount') {
      this.noticeMessage = '預約人數超過桌位可容納人數';
    } else if (this.data.noticeType == 'setHasMeal') {
      this.noticeMessage = '套餐開放使用中，不可以下架此餐點';
    } else if (this.data.noticeType == 'selling') {
      this.noticeMessage = '商品販售中，不可刪除';
    }

  }

  onNoClick() {
    this.dialogRef.close();
  }

  onCheckClick() {
    this.dialogRef.close(true);
  }
}
