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
    } else if (this.data.noticeType == 'isRequired') {
      this.noticeMessage = '必填選項未填寫';
    } else if (this.data.noticeType == 'timeCheck') {
      this.noticeMessage = '時間錯誤，請重新輸入'
    } else if (this.data.noticeType == 'phoneError') {
      this.noticeMessage = '目前系統不支援直接修改電話號碼，請刪除後重新預約，或改回原號碼'
    } else if (this.data.noticeType == 'activityIdMiss') {
      this.noticeMessage = '刪除失敗：缺少活動ID'
    } else if (this.data.noticeType == 'qrcode') {
      this.noticeMessage = '請重新掃碼'
    } else if (this.data.noticeType == 'chooseProduct') {
      this.noticeMessage = '請至少選擇一個商品'
    } else if (this.data.noticeType == 'noOrder') {
      this.noticeMessage = '訂單不得為空'
    } else if (this.data.noticeType == 'orderSuccess') {
      this.noticeMessage = '更新成功'
    } else if (this.data.noticeType == 'orderFailed') {
      this.noticeMessage = '更新失敗'
    } else if (this.data.noticeType == 'noOrderType') {
      this.noticeMessage = '無法辨識訂單模式，請重新掃碼進入'
    } else if (this.data.noticeType == 'deliveryMin500') {
      this.noticeMessage = '外送訂單需滿 500 元才提供服務'
    }
  }


  onCheckClick() {
    this.dialogRef.close(true);
  }
}
