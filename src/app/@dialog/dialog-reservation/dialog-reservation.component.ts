import { HttpClientService } from './../../@service/http-client.service';
import { DataService } from '../../@service/data.service';
import { reservation, scheduleItem, tables } from './../../@interface/interface';
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
  tables: reservation[] = [];
  timeList = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  displayTableIds: string[] = []; // 目前日期下可被選擇的桌號（只有 '開放' 的）
  allTableStates: { date: string, tables: any[] }[] = []; // 儲存所有日期對應的桌位狀態
  defaultTables: any[] = []; // 預設桌位狀態
  currentDate: string = '';
  currentDaySchedule: scheduleItem[] = [];  // 從 ReservationComponent 傳入的當日所有排程
  fullTableList: tables[] = []; // 從 ReservationComponent 傳入的完整桌位清單 (含 capacity)
  isTimeSlotOccupied: boolean = false; // 檢查選定時間是否可以預約的狀態 (用於畫面提示)
  originalReservationDate: string = ''; // 儲存原始日期，用於後端查找
  originalReservationPhone: string = ''; // 儲存原始電話，用於後端查找

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
    this.tables = this.dataService.reservation;
    if (this.data) {
      // 取得所有日期的桌位狀態，若無則為空陣列
      this.allTableStates = this.data.allTableStates || [];
      // 若沒提供預設桌位狀態，用 tables 陣列建立一個所有桌皆為 '開放' 的預設物件陣列
      this.defaultTables = this.data.defaultTables || this.tables.map(id => ({ table_id: id, table_status: false }));
      this.currentDaySchedule = this.data.currentDaySchedule || [];
      this.fullTableList = this.data.tableList || [];

      // 修改訂位
      if (this.data.existingReservation) {
        Object.assign(this.reservation, this.data.existingReservation);
        // 儲存原始日期
        this.originalReservationDate = this.reservation.reservationDate;
        // 儲存原始電話
        this.originalReservationPhone = this.reservation.reservationPhone;
        this.updateAvailableTables(this.reservation.reservationDate, this.reservation.reservationTime);
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
      this.updateAvailableTables(this.reservation.reservationDate, this.reservation.reservationTime);
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

  // 當日期或時間欄位改變時觸發
  onDateChange() {
    // 日期改變時，確保同時更新桌位過濾
    this.updateAvailableTables(this.reservation.reservationDate, this.reservation.reservationTime);
    // 重設 tableId，因為換日期後原本的桌位可能被關閉或佔用
    this.reservation.tableId = '';
  }
  onTimeChange() {
    this.updateAvailableTables(this.reservation.reservationDate, this.reservation.reservationTime);
  }

  isSlotAvailable(tableId: string, timeStr: string, ignoreItem?: reservation): boolean {
    const DEFAULT_DURATION_MINUTES = 120;
    const startTimeInMinutes = this.timeToMinutes(timeStr);
    const endTimeInMinutes = startTimeInMinutes + DEFAULT_DURATION_MINUTES;

    // 確保從 DataService 取得最新的所有預約資料
    const allReservations = this.dataService.reservation;

    // 篩選出『目標日期』的排程
    const targetDaySchedule = allReservations
      .filter(r => r.reservationDate == this.reservation.reservationDate)
      .map(r => ({
        ...r,
        useTime: DEFAULT_DURATION_MINUTES,
        endTime: ''
      }) as scheduleItem);

    for (let item of targetDaySchedule) {
      // 排除自己(修改模式)
      // 使用 String() 強制轉型，避免數字(number)與字串(string)比對失敗導致錯誤判斷
      if (ignoreItem && String(item.id) === String(ignoreItem.id)) {
        continue; // 這是目前正在編輯的訂單，忽略它，視為該時段對自己是"空閒"的
      }

      // 檢查是否是目標桌位
      if (item.tableId === tableId) {
        // 解析該筆已存在訂單的時間
        const rStartTimeInMinutes = this.timeToMinutes(item.reservationTime);
        const rEndTimeInMinutes = rStartTimeInMinutes + item.useTime;

        // 檢查時間重疊
        // 公式: (A開始 < B結束) 且 (B開始 < A結束)
        if (rStartTimeInMinutes < endTimeInMinutes && startTimeInMinutes < rEndTimeInMinutes) {
          return false; // 發現衝突，此桌位不可用
        }
      }
    }
    return true; // 通過所有檢查，桌位可用
  }

  updateAvailableTables(dateStr: string, timeStr?: string): void {
    if (!dateStr || !timeStr) {
      this.displayTableIds = [];
      this.reservation.tableId = '';
      this.isTimeSlotOccupied = false;
      return;
    }

    // 取得桌位清單
    const dayState = this.allTableStates.find(state => state.date == dateStr);
    let tableList: { table_id: string, table_status: boolean, capacity: number }[] = [];

    if (dayState) {
      tableList = dayState.tables;
    } else {
      // 如果該日沒有狀態，則使用傳入的當前預設狀態
      tableList = this.defaultTables;
    }

    // 過濾
    const ignore = this.data.existingReservation ? this.reservation : undefined;

    const availableTables = tableList.filter(t => {
      // 檢查是否開放
      if (!t.table_status) {
        // 如果當前桌位是正在編輯的舊桌位，則允許它顯示 (但會被 isSlotAvailable 檢查)
        if (ignore && ignore.tableId == t.table_id) {
          // 如果舊桌位被設置為不開放 (table_status=false)，我們暫時跳過時段檢查，並返回 false
          return false;
        }
        return false;
      }

      // 檢查時段衝突
      return this.isSlotAvailable(t.table_id, timeStr, ignore);
    });

    // 更新顯示清單
    this.displayTableIds = availableTables.map(t => t.table_id);

    // 處理修改模式下舊桌號的保留邏輯
    const isEditMode = !!this.data.existingReservation;
    const oldTableId = isEditMode ? this.data.existingReservation.tableId : null; // 舊的 tableId

    if (isEditMode && oldTableId) {
      // 如果在修改模式，且舊桌號不在可用列表中
      if (!this.displayTableIds.includes(oldTableId)) {
        // 檢查舊桌號是否被關閉 (table_status: false)
        const oldTableStatus = tableList.find(t => t.table_id == oldTableId)?.table_status;

        if (oldTableStatus == true) {
          // 重新將舊桌號加回 displayTableIds，並保持 this.reservation.tableId 不變
          if (oldTableId && !this.displayTableIds.includes(oldTableId)) {
            this.displayTableIds.push(oldTableId);
          }
          this.isTimeSlotOccupied = true; // 提示使用者該時段有問題
        } else {
          // 舊桌號被關閉了，此時應清除 tableId，因為它無法被選擇
          this.reservation.tableId = '';
          this.isTimeSlotOccupied = false;
        }
      } else {
        // 舊桌號在可用清單中，沒問題
        this.isTimeSlotOccupied = false;
      }
    } else if (this.reservation.tableId && !this.displayTableIds.includes(this.reservation.tableId)) {
      // 新增模式：如果選中的桌號不在可用清單中，則清空
      this.reservation.tableId = '';
      this.isTimeSlotOccupied = true;
    } else {
      this.isTimeSlotOccupied = false;
    }
  }

  onNoClick() {
    this.dialogRef.close();
  }

  onAddClick() {
    // 預約總人數不可大於桌位容量
    const selectedTable = this.fullTableList.find(t => t.table_id == this.reservation.tableId);
    if (selectedTable && this.reservation.reservationCount > selectedTable.capacity) {
      alert(`預約總人數 (${this.reservation.reservationCount}) 超過桌位 ${this.reservation.tableId} 的可容納人數 (${selectedTable.capacity})！`);
      return;
    }

    // 再次確認時段是否可用 (防止選擇/點擊 API 送出前的最後檢查)
    if (!this.isSlotAvailable(this.reservation.tableId, this.reservation.reservationTime, this.data.existingReservation ? this.reservation : undefined)) {
      alert('您選擇的桌位和時段已被佔用，請重新選擇！');
      return;
    }

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
      // 修改模式：找到原資料並取代
      const index = this.dataService.reservation.findIndex(
        (r) => r.id == this.reservation.id
      );
      if (index !== -1) {
        this.dataService.reservation[index] = { ...this.reservation };
      }
    } else {
      // 產生臨時 id（建議實務上由 DataService 統一管理 id）
      this.reservation.id = this.dataService.reservation.length + 1;
      // 推入 dataService 的訂位陣列
      this.dataService.reservation.push({ ...this.reservation });
    }

    let apiUrl = 'http://localhost:8080/reservation/create';
    let payload = { ...this.reservation }; // 預設使用 reservation

    if (this.data.existingReservation) {
      // 修改模式
      apiUrl = 'http://localhost:8080/reservation/update';

      payload = {
        // 查找條件：使用原始日期
        reservationDate: this.originalReservationDate,
        // 查找條件：使用原始電話號碼
        reservationPhone: this.originalReservationPhone,

        // 新增條件：使用使用者修改後的新日期
        newDate: this.reservation.reservationDate,

        // 其他欄位
        reservationTime: this.reservation.reservationTime,
        reservationName: this.reservation.reservationName,
        reservationCount: this.reservation.reservationCount,
        reservationAdultCount: this.reservation.reservationAdultCount,
        reservationChildCount: this.reservation.reservationChildCount,
        reservationStatus: this.reservation.reservationStatus,
        reservationNote: this.reservation.reservationNote,
        childSeat: this.reservation.childSeat,
        tableId: this.reservation.tableId
      };

      // 由於後端是透過 (舊日期 + 電話) 查找，所以我們必須將 ID 移除，
      // 以確保 payload 格式與後端提供的一致。
      delete payload.id;

      console.log('Update Payload:', payload);

    } else {
      // 新增模式
      this.reservation.id = 0; // 確保新增時 ID 為 0
      payload = { ...this.reservation };
    }


    // 呼叫 API 進行新增或更新
    this.httpClientService
      .postApi(apiUrl, payload)
      .subscribe({
        next: (res: any) => {
          console.log(res);

          const backendId = res.id || res.data?.id; // 假設後端回傳的 res 或 res.data 包含真正的 ID
          if (backendId) {
            // 如果後端有回傳新 ID，就用後端的
            this.reservation.id = Number(backendId);
          } else {
            // 如果後端沒回傳 ID (例如只回傳 "成功")
            if (this.data.existingReservation) {
              // 修改模式：保留原本的 ID 即可，不需要做任何事
            } else {
              const numericIds = this.dataService.reservation
                .map(r => Number(r.id))
                .filter(id => !isNaN(id)); // 濾掉所有 NaN 的 ID

              const maxId = numericIds.length > 0
                ? Math.max(...numericIds)
                : 0;
              this.reservation.id = maxId + 1;
            }
          }

          // 更新 DataService (讓列表畫面同步)
          if (this.data.existingReservation) {
            // 修改模式：找到舊資料並取代
            const index = this.dataService.reservation.findIndex(
              (r) => r.id == this.reservation.id
            );
            if (index !== -1) {
              this.dataService.reservation[index] = { ...this.reservation };
            }
          } else {
            // 新增模式：推入新資料
            this.dataService.reservation.push({ ...this.reservation });
          }

          // 3. 關閉視窗
          this.dialogRef.close({ ...this.reservation });
        },
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


  // 輔助函式：將 HH:MM 轉為距離午夜的總分鐘數
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
