import { DataService } from './../@service/data.service';
import { HttpClientService } from './../@service/http-client.service';
import { calendarDay, reservationAndTableByDateList, scheduleItem, timeLabel } from './../@interface/interface';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { DialogReserveComponent } from '../@dialog/dialog-reserve/dialog-reserve.component';
import { DialogDeleteComponent } from '../@dialog/dialog-delete/dialog-delete.component';
import { DialogNoticeComponent } from '../@dialog/dialog-notice/dialog-notice.component';

@Component({
  selector: 'app-reserve',
  imports: [CommonModule,
    MatIconModule
  ],
  templateUrl: './reserve.component.html',
  styleUrl: './reserve.component.scss'
})
export class ReserveComponent {

  constructor(
    private httpClientService: HttpClientService,
    private dataService: DataService) { }

  currentMonth: Date = new Date(); // 目前日曆顯示的月份
  selectedDay: Date = new Date(); // 使用者目前選擇的日期
  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六']; // 星期的標題
  monthWeeks: calendarDay[][] = []; // 存6 週 x 7 天的月曆 [週][天]
  timeLabel: timeLabel[] = [];  // 排程左側時間軸
  reservationAndTableByDateList: reservationAndTableByDateList[] = []
  reservations: scheduleItem[] = []; // 存所有的排程項目
  selectedReservationData!: scheduleItem; // 存被選中的資料
  eventDatesSet: Set<string> = new Set();  // 用來存哪些日期有預約 ('YYYY-MM-DD')

  // 排程圖區塊
  readonly DISPLAY_START_HOUR = 10; // 排程圖顯示的開始時間（從 10:00 開始)
  readonly HOUR_HEIGHT_PX = 45;   // 每小時區塊對應的像素高度
  readonly ACTIVITY_VERTICAL_MARGIN = 10; // 每筆預約上下間隔
  readonly ALLOWED_RESERVE_TIMES = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00']; // 可以提供預約的時間
  readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadAllEvents();
    this.timeLabelsColumns();
    this.loadingReservation();
  }

  // ==================== 左側日曆 =======================

  // 日曆(6週)
  calendar(date: Date): void {
    let year = date.getFullYear(); // 取年份 (ex: 2025)
    let month = date.getMonth(); // 取月份 (0=一月, 11=十二月)
    let firstDayOfMonth = new Date(year, month, 1); // 找這個月的第一天（2025/3/1)
    let startDayOfWeek = firstDayOfMonth.getDay(); // 找這個月第一天是星期幾 (0:日, 1:一 ...)
    let startDate = new Date(firstDayOfMonth); // 這個月的第一天
    startDate.setDate(startDate.getDate() - startDayOfWeek); // 把日期往前推 N 天 (1-6=-5)

    // [[Date, Date, Date, ... (7天)], [Date, Date, Date, ... (7天)], ...]
    let weeks: calendarDay[][] = []; // 7天的陣列，共6週
    let currentLoopDate = new Date(startDate); // 這個月的第一天

    for (let i = 0; i < 6; i++) { // 日曆要顯示6週，跑6次迴圈
      let week: calendarDay[] = []; // 一週的陣列
      for (let j = 0; j < 7; j++) { // 一週7天

        // 複製當前的日期物件
        const thisDate = new Date(currentLoopDate);
        // 轉字串比對 Set
        const dateStr = this.formatDateStr(thisDate);
        const isCurrentMonth = thisDate.getMonth() == month;

        // 4. 【關鍵】產生物件，直接判斷 hasEvent
        week.push({
          date: thisDate,
          hasEvent: this.eventDatesSet.has(dateStr),
          isCurrentMonth: isCurrentMonth
        });
        currentLoopDate.setDate(currentLoopDate.getDate() + 1);  // 日期加1天
      }
      weeks.push(week); // 一週填完放入weeks
    }
    this.monthWeeks = weeks;
  }

  // 切換到上個月
  prevMonth(): void {
    const newDate = new Date(this.currentMonth); // 複製目前的日期物件
    newDate.setMonth(newDate.getMonth() - 1); // 設定月份減 1
    this.currentMonth = newDate; // 更新目前日曆顯示的月份
    this.calendar(this.currentMonth); // 重新生成日曆
  }

  // 切換到下個月
  nextMonth(): void {
    const newDate = new Date(this.currentMonth); // 複製目前的日期物件
    newDate.setMonth(newDate.getMonth() + 1); // 設定月份加 1
    this.currentMonth = newDate; // 更新目前日曆顯示的月份
    this.calendar(this.currentMonth); // 重新生成日曆
  }

  // 選擇日曆上的某一天
  selectDate(day: Date) {
    this.selectedDay = day;
    // 清空目前的預約陣列
    this.reservations = [];
    this.reservationAndTableByDateList = [];

    this.loadingReservation(); // 載入當日預約
  }

  isSameDate(date1: Date, date2: Date | null): boolean {
    if (!date1 || !date2) return false;
    // 比較年、月、日是否相同
    return date1.getFullYear() == date2.getFullYear() &&
      date1.getMonth() == date2.getMonth() &&
      date1.getDate() == date2.getDate();
  }

  loadAllEvents() {
    this.httpClientService.getApi('reservation/list')
      .subscribe((res: any) => {
        if (res.code == 200 && res.reservationList) {
          this.eventDatesSet.clear(); // 清空舊資料
          for (let data of res.reservationList) {
            this.eventDatesSet.add(data.reservationDate);
          }
          this.calendar(this.currentMonth); // 資料準備好後，繪製日曆
        }
      });
  }

  // ==================== 左側詳細預約資訊 =======================

  // 選擇的預約
  onSelectReservation(item: scheduleItem) {
    this.selectedReservationData = item;
    console.log(item);

  }

  // 更新預約
  updateReserve() {
    const goldenDate = this.formatDateStr(this.selectedDay);
    //  'mode' 欄位讓 Dialog 知道現在是編輯模式
    const dialogData = {
      mode: 'edit',
      details: this.selectedReservationData, // 該筆預約的詳細資料
      originalDate: goldenDate,
    };

    const dialogRef = this.dialog.open(DialogReserveComponent, {
      data: dialogData,
      width: '80%',
      height: 'auto',
      disableClose: true
    });

    // 監聽關閉，若更新成功刷新畫面
    dialogRef.afterClosed().subscribe(res => {
      if (res == true) {
        this.loadingReservation();
        this.loadAllEvents();
      }
    });

  }

  // 刪除預約
  deleteReserve() {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: {
        deleteType: 'reservation',
        reservationDate: this.formatDateStr(this.selectedDay),
        reservationPhone: this.selectedReservationData.reservationPhone
      },
      disableClose: true
    });

    // 監聽關閉，若更新成功刷新畫面
    dialogRef.afterClosed().subscribe(res => {
      console.log('Dialog result:' + res);
      if (res) {
        this.selectedReservationData = null!;
        this.loadingReservation();
        this.loadAllEvents();
      }
    });
  }


  // ==================== 右側排程表 =======================

  // 時間軸
  timeLabelsColumns() {
    // 產生從 DISPLAY_START_HOUR 到 22:00 的時間標籤陣列
    for (let hour = this.DISPLAY_START_HOUR; hour <= 22; hour++) {
      let hourStr = hour.toString().padStart(2, '0'); // padStart: 若只有 1 位數，前面補 0
      let time = hourStr + ":00";
      let display = hourStr + ":00"; // (這段可以刪掉)
      this.timeLabel.push({ time, display, hour });
    }
  }

  // 計算時間區塊TOP的位置 (px)
  getTopPosition(startTime: string): number {
    let timeParts = startTime.split(':'); // 用冒號切開字串，例: "18:30" > ["18", "30"]
    let hours = Number(timeParts[0]);  // 取出第 0 個當小時，轉成數字
    let minutes = Number(timeParts[1]);  // 取出第 1 個當分鐘，轉成數字
    let totalMin = (hours - this.DISPLAY_START_HOUR) * 60 + minutes; // 計算從顯示開始時間（如 10:00）起的總分鐘數
    let baseTop = totalMin * (this.HOUR_HEIGHT_PX / 60); // 分鐘數 * (每分鐘對應的像素)
    return baseTop + (this.ACTIVITY_VERTICAL_MARGIN / 2); // 加上下間格
  }

  // 桌位開關
  tableAvailabe(tableData: reservationAndTableByDateList, event?: Event) {

    // 檢查如果有預約，則不可關閉
    if (tableData.reservations && tableData.reservations.length > 0) {
      const dialogRef = this.dialog.open(DialogNoticeComponent, {
        width: '25%',
        height: 'auto',
        data: { noticeType: 'tableClose' },
        disableClose: true
      });

      if (event) {
        const checkbox = event.target as HTMLInputElement;
        checkbox.checked = !checkbox.checked; // 恢復原本狀態
      }
      return;
    }
    const isCurrentlyOpen = tableData.tableDailyStatus !== false;  // 判斷目前的狀態

    // 判斷是否有此筆資料存在
    const recordExists = tableData.tableDailyStatus == false;

    // 準備傳給後端的資料
    const payload = {
      tableDailyDate: this.formatDateStr(this.selectedDay),
      tableId: tableData.tableId,
      tableDailyStatus: !isCurrentlyOpen,
    };

    tableData.tableDailyStatus = !isCurrentlyOpen;
    let url = '';

    if (recordExists) {
      // 如果DB存在，用 Update
      url = 'table/status/update';
    } else {
      // 如果資料庫完全沒資料
      url = 'table/status/add';
    }

    this.httpClientService.postApi(url, payload)
      .subscribe({
        next: (res: any) => {
          if (res.code == 200) {
            this.loadingReservation();
          } else {
            tableData.tableDailyStatus = isCurrentlyOpen; // 失敗，回復原本狀態
          }
        }
      });
  }

  // 計算預約區塊的高度 (px)
  getHeight(stayMin: number): number {
    let baseHeight = stayMin * (this.HOUR_HEIGHT_PX / 60); // 分鐘數 * (每分鐘對應的像素)
    return baseHeight - this.ACTIVITY_VERTICAL_MARGIN; // 減去上下間隔後的最終高度
  }

  // 計算預約位於的網格欄位
  getTableGridColumn(item: scheduleItem): string {
    let index = this.reservationAndTableByDateList.findIndex(t => t.tableId == item.tableId); // 找到對應的桌位
    let gridStart = index + 2; // 計算網格開始位置 (索引 + 2，因為左側有時間欄位和標頭佔用)
    return `${gridStart} / span 1`; // 讓預約放到對應的直欄
  }


  // 載入當日預約資料
  loadingReservation() {
    // 顯示桌位及預約
    const dateStr = this.formatDateStr(this.selectedDay);
    const url = `reservation/date_list?reservationDate=${dateStr}`;
    this.httpClientService.getApi(url)
      .subscribe((res: any) => {
        if (res.code == 200) {
          console.log(res);

          this.reservationAndTableByDateList = res.reservationAndTableByDateList;
          this.reservations = []; // 清空舊資料，避免重複 push
          // 取每一張桌子的資料
          for (let tableData of this.reservationAndTableByDateList) {
            // 如果有預約
            if (tableData.reservations) {
              const defaultDuration = 120;

              for (let reservationData of tableData.reservations) {
                const items: scheduleItem = {
                  ...reservationData,
                  tableId: tableData.tableId,
                  reservationDate: dateStr,
                  useTime: defaultDuration,
                  endTime: this.calculateEndTime(reservationData.reservationTime, defaultDuration)
                }
                this.reservations.push(items);
              }
            }
          }
          console.log(this.reservations);

        }
      });
  }

  addReservation(targetTableId: string, targetTime: string) {
    // 如果是透過點擊格子進來的，該時間不允許，則直接擋掉
    if (targetTime && !this.isAllowedTime(targetTime)) {
      return;
    }

    const currentTableId: any[] = [];
    const dialogRef = this.dialog.open(DialogReserveComponent, {
      width: '80%',
      height: 'auto',
      data: {
        tableId: currentTableId,
        reservationDate: this.selectedDay,
        reservationTime: targetTime, //原本是currentTime
        defaultTableId: targetTableId,
        defaultTime: targetTime,
      },
      disableClose: true
    });

    // 新增後也要重新載入全覽
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadingReservation();
        this.loadAllEvents();
      }
    });
  }

  // 檢查該時間是否允許預約
  isAllowedTime(time: string): boolean {
    return this.ALLOWED_RESERVE_TIMES.includes(time);
  }

  // ==================== 輔助方法 =======================

  // 日期轉字串
  formatDateStr(date: Date): string {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // padStart: 若只有 1 位數，前面補 0
    let day = date.getDate().toString().padStart(2, '0');
    return year + "-" + month + "-" + day;
  }

  // 計算結束時間
  calculateEndTime(startTime: string, durationMinutes: number): string {
    if (!startTime) return '';

    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + durationMinutes);

    const endHour = date.getHours().toString().padStart(2, '0');
    const endMin = date.getMinutes().toString().padStart(2, '0');

    return `${endHour}:${endMin}`;
  }

  // 是否是過去日期
  isPastDate(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 歸零時分秒，只比對日期

    const checkDate = new Date(this.selectedDay);
    checkDate.setHours(0, 0, 0, 0);

    // 如果選中日期 < 今天，就是過去
    return checkDate.getTime() < today.getTime();
  }

  // 是否是過去時間
  isPastTime(time: string): boolean {
    if (!time) return false;

    const now = new Date();
    const checkDate = new Date(this.selectedDay); // 複製選中的日期

    const [hours, minutes] = time.split(':').map(Number);
    checkDate.setHours(hours, minutes, 0, 0);

    // 如果 現在時間 > 檢查時間，代表已過期
    return now.getTime() > checkDate.getTime();
  }

  // 取得滑鼠移入時要顯示的文字
  getSlotText(tableDailyStatus: boolean | null, time: string): string {
    // 1. 桌位已關閉 (明確為 false)
    if (tableDailyStatus == false) {
      return '桌位已關閉';
    }

    // 2. 過去時間
    if (this.isPastTime(time)) {
      return '此時段已過期';
    }

    // 3. 不在允許的預約時間清單內
    if (!this.isAllowedTime(time)) {
      return '不可預約';
    }

    // 4. 以上都通過
    return '可預約';
  }
}
