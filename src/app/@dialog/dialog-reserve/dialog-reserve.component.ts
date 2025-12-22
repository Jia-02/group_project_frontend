import { Component, inject } from '@angular/core';
import { DataService } from '../../@service/data.service';
import { HttpClientService } from '../../@service/http-client.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle, MatDialog } from '@angular/material/dialog';
import { reservation } from '../../@interface/interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogNoticeComponent } from '../dialog-notice/dialog-notice.component';

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
  readonly dialog = inject(MatDialog);

  tableList!: Table[];


  adultList!: number[];
  childList!: number[];
  childSeatList!: number[];
  timeList = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  reservation: reservation = {
    reservationId: 0,
    newDate: '',
    reservationDate: '',
    reservationTime: '',
    reservationPhone: '',
    reservationName: '',
    reservationCount: 0,
    reservationAdultCount: 0,
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
  nowTime!: string;

  ngOnInit(): void {
    let today = new Date();
    this.currentDate = this.formatDateStr(today);
    this.nowTime = this.formatNowTimeStr(today);
    let nowTime;
    for (const time of this.timeList) {
      if (time > this.nowTime) {
        nowTime = time;
        break;
      }
    }
    nowTime += ":00"

    let reservationTime;
    //嘗試用reservationTime取代nowTime
    if (this.data?.reservationTime) {
      this.reservation.reservationTime = this.data.reservationTime;
      reservationTime = this.reservation.reservationTime + ':00';
    }

    //編輯資料類型不同
    if (this.data?.details?.reservationTime) {
      this.reservation = this.data.details;
      reservationTime = this.reservation.reservationTime;
    }

    // 桌號api
    let reservationDate = "reservation/time_list?reservationDate=" + this.currentDate + "&reservationTime=" + reservationTime;
    this.httpClientService.getApi(reservationDate)
      .subscribe((res: any) => {
        console.log(res)
        if (res.code == 200) {
          const availableTables = [];
          this.tableList = [];
          this.adultList = [];
          this.childList = [];
          this.childSeatList = [];
          for (let data of res.reservationAndTableByTimeList) {
            if (data.tableStatus == "可預約") {
              availableTables.push(data.tableId);
              this.tableList.push({ tableId: data.tableId, capacity: data.capacity })
            }
          }

          // 編輯模式時，把自己原本的桌補回來
      if (this.isEditMode && this.reservation.tableId) {
        let exists = false;
        for (let j = 0; j < this.tableList.length; j++) {
          if (this.tableList[j].tableId === this.reservation.tableId) {
            exists = true;
            break;
          }
        }

        if (!exists) {
          for (let k = 0; k < res.reservationAndTableByTimeList.length; k++) {
            const table = res.reservationAndTableByTimeList[k];
            if (table.tableId === this.reservation.tableId) {
              this.tableList.unshift({ tableId: table.tableId, capacity: table.capacity });
              availableTables.unshift(table.tableId);
              break;
            }
          }
        }
      }

          for (let table of this.tableList) {
            if (table.tableId == this.reservation.tableId) {
              if (this.isEditMode) {
                for (let i = 1; i <= table.capacity - this.reservation.reservationAdultCount; i++) {
                  this.childList.push(i);
                }
                for (let i = 1; i <= table.capacity - this.reservation.reservationChildCount; i++) {
                  this.adultList.push(i);
                }
                for (let i = 1; i <= this.reservation.reservationChildCount; i++) {
                  this.childSeatList.push(i);
                }
              }
              else {
                for (let i = 1; i <= table.capacity; i++) {
                  this.adultList.push(i);
                  this.childList.push(i);
                }
                for (let i = 1; i <= this.reservation.reservationChildCount; i++) {
                  this.childSeatList.push(i);
                }
              }
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
      console.log(this.reservation)
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

  changeTable() {
    this.adultList = [];
    this.childList = [];
    this.childSeatList = []
    this.reservation.reservationChildCount = 0;
    this.reservation.reservationAdultCount = 0;
    this.reservation.childSeat = 0;
    for (let table of this.tableList) {
      if (table.tableId == this.reservation.tableId) {
        for (let i = 1; i <= table.capacity; i++) {
          this.adultList.push(i);
          this.childList.push(i);
        }
      }
    }
  }

  changePeople(flag: boolean) {
    if (flag) {
      this.childList = [];
      for (let table of this.tableList) {
        if (table.tableId == this.reservation.tableId) {
          for (let i = 1; i <= table.capacity - this.reservation.reservationAdultCount; i++) {
            this.childList.push(i);
          }
        }
      }
    } else {
      this.adultList = [];
      this.childSeatList = [];
      if (this.reservation.childSeat > this.reservation.reservationChildCount) {
        this.reservation.childSeat = 0;
      }
      for (let table of this.tableList) {
        if (table.tableId == this.reservation.tableId) {
          for (let i = 1; i <= table.capacity - this.reservation.reservationChildCount; i++) {
            this.adultList.push(i);
          }
          for (let i = 1; i <= this.reservation.reservationChildCount; i++) {
            this.childSeatList.push(i);
          }
        }
      }
    }

    this.reservation.reservationCount = Number(this.reservation.reservationAdultCount) + Number(this.reservation.reservationChildCount);

  }

  changeDate() {
    this.reservation.reservationTime = "--請選擇--";
    this.reservation.tableId = "--請選擇--"
    this.reservation.reservationChildCount = 0;
    this.reservation.reservationAdultCount = 0;
    this.reservation.childSeat = 0;
    this.tableIdList = [];
    this.adultList = [];
    this.childList = [];
    this.childSeatList = []
  }

  changeTime() {
    let nowTime = this.reservation.reservationTime + ":00"
    let reservationDate = "reservation/time_list?reservationDate=" + this.reservation.reservationDate + "&reservationTime=" + nowTime;
    this.tableList = [];
    this.adultList = [];
    this.childList = [];
    this.childSeatList = []
    this.reservation.reservationChildCount = 0;
    this.reservation.reservationAdultCount = 0;
    this.reservation.childSeat = 0;
    this.httpClientService.getApi(reservationDate)
      .subscribe((res: any) => {
        console.log(res)
        if (res.code == 200) {
          const availableTables = [];
          for (let data of res.reservationAndTableByTimeList) {
            if (data.tableStatus == "可預約") {
              availableTables.push(data.tableId);
              this.tableList.push({ tableId: data.tableId, capacity: data.capacity })
            }
          }
          this.tableIdList = availableTables;
          this.reservation.tableId = "--請選擇--"
        }
      });
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
    if (!this.reservation.reservationDate || !this.reservation.reservationTime || !this.reservation.tableId
      || !this.reservation.reservationAdultCount) {
      return;
    }

    //判斷電話需7-10碼
    const phone = this.reservation.reservationPhone;
    if (phone.length < 7 || phone.length > 10) {

      const dialogRef = this.dialog.open(DialogNoticeComponent, {
        width: '25%',
        height: 'auto',
        data: { noticeType: 'phoneLength' }
      });
      return; // 不送出
    }



    this.httpClientService.postApi('reservation/create', this.reservation)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.dataService.reservation = res;
          this.dialogRef.close(true);
        } else if (res.message == "桌位容納不下這個人數") {
          this.dialog.open(DialogNoticeComponent, {
            width: '25%',
            height: 'auto',
            data: { noticeType: 'peopleCount' }
          })
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

    this.httpClientService.postApi('reservation/update', payload)
      .subscribe((res: any) => {
        console.log(res);
        if (res.code == 200) {
          this.dataService.reservation = res;
          this.dialogRef.close(true);
        }
      });
  }

  updateTotal() {
    this.adultList = [];
    for (let i = 1; i <= this.reservation.reservationCount; i++) {
      this.adultList.push(i);
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

  formatNowTimeStr(date: Date): string {
    let hour = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let second = date.getSeconds()
    return hour + ":" + minutes + ":" + second;
  }
}

interface Table {
  tableId: string;
  capacity: number;
}
