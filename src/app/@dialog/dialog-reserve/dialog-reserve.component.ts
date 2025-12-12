import { Component, inject } from '@angular/core';
import { DataService } from '../../@service/data.service';
import { HttpClientService } from '../../@service/http-client.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { reservation } from '../../@interface/interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-reserve',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './dialog-reserve.component.html',
  styleUrl: './dialog-reserve.component.scss'
})
export class DialogReserveComponent {

  constructor(
    private dataService: DataService,
    private httpClientService: HttpClientService
  ) { }

  readonly dialogRef = inject(MatDialogRef<DialogReserveComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  totalPeople = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  adultList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  childList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  childSeatList = [0, 1, 2, 3];
  timeList = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  reservation: reservation = {
    reservationId: 0,
    newDate: '',
    reservationDate: '',
    reservationTime: '',
    reservationPhone: '',
    reservationName: '',
    reservationCount: 1,
    reservationAdultCount: 1,
    reservationChildCount: 0,
    reservationStatus: false,
    reservationNote: '',
    childSeat: 0,
    tableId: '',
  }
  currentDate = '';
  tableIdList: any[] = [];
  isEditMode: boolean = false; // 判斷是否為編輯模式
  originalPhone: string = '';
  originalDate: string = '';

  ngOnInit(): void {
    // 桌號api
    this.httpClientService.getApi('http://localhost:8080/table/list')
      .subscribe((res: any) => {
        if (res.code == 200) {
          const availableTables = [];
          for (let data of res.tableList) {
            if (data.tableStatus == "可預約") {
              availableTables.push(data.tableId);
            }
          }
          this.tableIdList = availableTables;
        }
      });

    // 判斷是否為編輯
    if (this.data.mode == 'edit' && this.data.details) {
      this.isEditMode = true;
      const detail = this.data.details;

      this.originalPhone = detail.reservationPhone; // 儲存原始電話號碼
      this.originalDate = this.data.originalDate || detail.reservationDate || '';

      // 編輯模式
      // details 塞進 reservation
      this.reservation = {
        reservationId: detail.reservationId,
        reservationDate: this.originalDate,
        reservationTime: detail.reservationTime.slice(0, 5),
        reservationPhone: detail.reservationPhone,
        reservationName: detail.reservationName,
        reservationCount: detail.reservationCount,
        reservationAdultCount: detail.reservationAdultCount,
        reservationChildCount: detail.reservationChildCount,
        reservationStatus: detail.reservationStatus,
        reservationNote: detail.reservationNote,
        childSeat: detail.childSeat,
        tableId: detail.tableId,
        newDate: '',
      };

    } else {
      // 設定日期
      if (this.data.reservationDate instanceof Date) {
        this.reservation.reservationDate = this.formatDateStr(this.data.reservationDate);
      } else {
        this.reservation.reservationDate = this.data.reservationDate;
      }

      // 設定桌號
      if (this.data.defaultTableId) {
        this.reservation.tableId = this.data.defaultTableId;
      }

      // 設定時間
      if (this.data.defaultTime) {
        this.reservation.reservationTime = this.data.defaultTime;
      }
    }
  }


  // 取消
  onNoClick() {
    this.dialogRef.close();
  }

  // 確定
  onAddClick() {
    if (this.isEditMode) {
      this.updateCheck(); // >更新
    } else {
      this.createCheck(); // >新增
    }
  }

  // 新增
  createCheck() {
    // 檢查必填
    if (!this.reservation.reservationDate || !this.reservation.reservationTime || !this.reservation.tableId) {
      return;
    }

    //判斷電話需7-10碼
    const phone = this.reservation.reservationPhone;
    if (phone.length < 7 || phone.length > 10) {
      alert('電話號碼需為 7 到 10 碼');
      return; // 不送出
    }

    this.httpClientService.postApi('http://localhost:8080/reservation/create', this.reservation)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.dataService.reservation = res;
          this.dialogRef.close(true);
        } else {
          console.log(res);
        }
      });
  }

  // 更新
  updateCheck() {
    if (this.reservation.reservationPhone !== this.originalPhone) {
      alert('目前系統不支援直接修改電話號碼，請刪除後重新預約，或改回原號碼。');
      // 強制把電話改回原本的，避免送出後報錯
      this.reservation.reservationPhone = this.originalPhone;
      return;
    }

    const payload = {
      newDate: this.reservation.reservationDate,
      reservationDate: this.originalDate,
      reservationTime: this.reservation.reservationTime.length === 5
        ? this.reservation.reservationTime + ':00'
        : this.reservation.reservationTime,
      reservationPhone: this.originalPhone,
      reservationName: this.reservation.reservationName,
      reservationCount: this.reservation.reservationCount,
      reservationAdultCount: this.reservation.reservationAdultCount,
      reservationChildCount: this.reservation.reservationChildCount,
      reservationStatus: this.reservation.reservationStatus,
      reservationNote: this.reservation.reservationNote,
      childSeat: this.reservation.childSeat,
      tableId: this.reservation.tableId
    };

    console.log('準備送出的更新資料:', payload); // ★ 除錯用：檢查資料是否正確

    this.httpClientService.postApi('http://localhost:8080/reservation/update', payload)
      .subscribe((res: any) => {
        console.log('後端回傳結果:', res);
        if (res.code == 200) {
          this.dataService.reservation = res;
          this.dialogRef.close(true);
        }
      });
  }

  // 僅輸入總人數，更改大人小孩人數
  updateTotal() {
    let total = Number(this.reservation.reservationCount);
    if (total > 0) {
      this.reservation.reservationAdultCount = total;
      this.reservation.reservationChildCount = 0;
    }

  }
  // 僅輸入大人或小孩，更新總人數
  updateAdultChild() {
    let adult = Number(this.reservation.reservationAdultCount);
    let child = Number(this.reservation.reservationChildCount) || 0;
    this.reservation.reservationCount = adult + child;
  }

  // 日期轉字串
  formatDateStr(date: Date): string {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // padStart: 若只有 1 位數，前面補 0
    let day = date.getDate().toString().padStart(2, '0');
    return year + "-" + month + "-" + day;
  }

  // 電話輸入限制 只允許數字
  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.reservation.reservationPhone = input.value;
  }
}
