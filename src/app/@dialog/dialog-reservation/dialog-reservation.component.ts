import { HttpClientService } from './../../@service/http-client.service';
import { DataService } from '../../@service/data.service';
import { reservation } from './../../@interface/interface';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-reservation',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
  ],
  standalone: true,
  templateUrl: './dialog-reservation.component.html',
  styleUrl: './dialog-reservation.component.scss'
})
export class DialogReservationComponent {

  constructor(
    private dataService: DataService,
    private httpClientService: HttpClientService
  ) { }

  totalPeople = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  adultList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  childList = [0, 1, 2, 3, 4, 5];
  childSeatList = [0, 1, 2, 3];
  tables = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07', 'A08', 'A09', 'A10', 'A11', 'A12', 'A13'];
  timeList = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  displayTableIds: string[] = []; // 目前日期下可被選擇的桌號（只有 '開放' 的）
  allTableStates: { date: string, tables: any[] }[] = []; // 儲存所有日期對應的桌位狀態
  defaultTables: any[] = []; // 預設桌位狀態
  currentDate: string = '';

  reservation: reservation = {
    id: 0,
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
    tableId: ''
  };

  readonly dialogRef = inject(MatDialogRef<DialogReservationComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);


  ngOnInit() {
    this.setCurrentDate();
    if (this.data) {
      // 取得所有日期的桌位狀態，若無則為空陣列
      this.allTableStates = this.data.allTableStates || [];
      // 若沒提供預設桌位狀態，用 tables 陣列建立一個所有桌皆為 '開放' 的預設物件陣列
      this.defaultTables = this.data.defaultTables || this.tables.map(id => ({ table_id: id, table_status: '開放' }));

      // 修改訂位
      if (this.data.existingReservation) {
        // 覆蓋本地 reservation
        Object.assign(this.reservation, this.data.existingReservation);
        // 初始化時使用當前訂單日期來過濾桌位
        this.updateAvailableTables(this.reservation.reservationDate);
        return;
      }

      // 新增
      if (this.data.tableId) {
        this.reservation.tableId = this.data.tableId;
      }
      if (this.data.date) {
        this.reservation.reservationDate = this.data.date;
      }
      if (this.data.time) {
        this.reservation.reservationTime = this.data.time;
      }

      // 新增模式下初始化時過濾桌位
      this.updateAvailableTables(this.reservation.reservationDate);
    }
  }

  updateAvailableTables(dateStr: string): void {
    // 若傳入日期為空
    if (!dateStr) {
      this.displayTableIds = []; // 清空可選桌號
      this.reservation.tableId = ''; // 避免保留舊的桌號
      return;
    }

    // 在 allTableStates 中尋找指定日期的狀態
    const dayState = this.allTableStates.find(state => state.date == dateStr);
    let tableList = [];

    if (dayState) {
      // 找到該日期的專屬狀態
      tableList = dayState.tables;
    } else {
      // 未找到，使用預設的完整桌位列表
      tableList = this.defaultTables;
    }

    // 過濾狀態為 '開放' 的桌號，並只取 table_id
    this.displayTableIds = tableList
      .filter(t => t.table_status == '開放')
      .map(t => t.table_id);

    // 檢查當前選擇的桌號是否仍在開放列表中
    if (this.reservation.tableId && !this.displayTableIds.includes(this.reservation.tableId)) {
      // 如果原本選擇的桌號在新日期被關閉，則清空桌號
      this.reservation.tableId = '';
    }
  }

  // 建立今天的日期字串 (YYYY-MM-DD)
  setCurrentDate(): void {
    const today = new Date();
    const year = today.getFullYear();
    // getMonth() 回傳 0-11，所以要 +1
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // 格式化為 YYYY-MM-DD
    this.currentDate = `${year}-${month}-${day}`;
  }

  // 當日期欄位改變時觸發，重新更新可選桌位
  onDateChange() {
    this.updateAvailableTables(this.reservation.reservationDate);
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onAddClick() {
    // 新增日期後端驗證
    if (this.reservation.reservationDate) {
      // 將選擇的日期字串轉為 Date 物件
      const selectedDate = new Date(this.reservation.reservationDate);
      const today = new Date(this.currentDate); // 使用 YYYY-MM-DD 創建今天的日期

      // 確保只比較日期部分，忽略時間差異 (雖然 this.currentDate 已經是午夜，但多一層保護)
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return;
      }
    }

    // 檢查是否填寫
    if (!this.reservation.reservationName) {
      alert('請輸入訂位人姓名');
      return;
    }
    if (!this.reservation.reservationPhone) {
      alert('請輸入聯絡電話');
      return;
    }
    if (!this.reservation.tableId) {
      alert('請選擇桌號');
      return;
    }
    if (!this.reservation.reservationDate || !this.reservation.reservationTime) {
      alert('請選擇訂位日期與時間');
      return;
    }

    // 若為修改模式，則在 dataService 中找到原筆並更新
    if (this.data.existingReservation) {
      // 這是修改模式：找到原資料並取代
      const index = this.dataService.reservation.findIndex(
        (r) => r.id === this.reservation.id
      );
      if (index !== -1) {
        this.dataService.reservation[index] = { ...this.reservation };
      }
    } else {
      // 新增：產生臨時 id（建議實務上由 DataService 統一管理 id）
      this.reservation.id = this.dataService.reservation.length + 1;
      // 推入 dataService 的訂位陣列
      this.dataService.reservation.push({ ...this.reservation });
    }

    this.httpClientService
      .postApi('http://localhost:8080/reservation/create', this.reservation)
      .subscribe((res: any) => {
        console.log(res);
      })
    // 關閉 dialog 並把這筆資料回傳給reservation
    this.dialogRef.close({ ...this.reservation });
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

}
