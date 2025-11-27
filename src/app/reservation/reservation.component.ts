import { DataService } from './../@service/data.service';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogReservationComponent } from '../@dialog/dialog-reservation/dialog-reservation.component';
import { tables, reservation, scheduleItem, timeLabel } from '../@interface/interface';

@Component({
  selector: 'app-reservation',
  imports: [
    CommonModule,
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})


export class ReservationComponent {

  constructor(private dataService: DataService) { }

  // signal = 會自動通知 HTML 重新更新的變數
  currentMonth: WritableSignal<Date> = signal(new Date()); // 用來放日曆顯示的月份
  selectedDay: WritableSignal<Date> = signal(new Date()); // 用來放使用者目前選到哪一天
  currentDayReserve: WritableSignal<scheduleItem[]> = signal([]); // 存放當前選中日期的活動
  selectedReservationDetail: WritableSignal<scheduleItem | null> = signal(null); // 用於存放當前點擊的訂單詳情

  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六']; // 星期
  monthWeeks: Date[][] = []; // 存放日期的月曆
  timeLabels: timeLabel[] = [];  // 時間列表
  reservation: reservation[] = [];

  readonly dialog = inject(MatDialog);
  readonly peakHours: number[] = [12, 13, 18, 19]; // 假設 12-13, 18-19 點為尖峰
  readonly HOUR_HEIGHT_PX = 45;   // 每小時的高度 (CSS 中定義，用於計算)
  readonly DEFAULT_DURATION_MINUTES = 120;   // 預設預約長度 (2 小時 = 120 分鐘)
  readonly ACTIVITY_VERTICAL_MARGIN = 10; // 垂直總間隔 (上 2px + 下 2px)
  readonly DISPLAY_START_HOUR = 10; // 顯示起始時間
  readonly ALLOWED_START_HOURS = [10, 12, 14, 16, 18, 20];


  // 資源列表 (桌位)
  tables = signal<tables[]>([
    { table_id: 'A01', table_status: '開放', capacity: 2, position_x: 0, position_y: 0 },
    { table_id: 'A02', table_status: '關閉', capacity: 2, position_x: 0, position_y: 0 },
    { table_id: 'A03', table_status: '開放', capacity: 4, position_x: 0, position_y: 0 },
    { table_id: 'A04', table_status: '開放', capacity: 4, position_x: 0, position_y: 0 },
    { table_id: 'A05', table_status: '開放', capacity: 4, position_x: 0, position_y: 0 },
    { table_id: 'A06', table_status: '開放', capacity: 4, position_x: 0, position_y: 0 },
    { table_id: 'A07', table_status: '關閉', capacity: 6, position_x: 0, position_y: 0 },
    { table_id: 'A08', table_status: '關閉', capacity: 6, position_x: 0, position_y: 0 },
    { table_id: 'A09', table_status: '關閉', capacity: 6, position_x: 0, position_y: 0 },
    { table_id: 'A10', table_status: '關閉', capacity: 6, position_x: 0, position_y: 0 },
    { table_id: 'A11', table_status: '關閉', capacity: 6, position_x: 0, position_y: 0 },
    { table_id: 'A12', table_status: '關閉', capacity: 6, position_x: 0, position_y: 0 },
    { table_id: 'A13', table_status: '關閉', capacity: 6, position_x: 0, position_y: 0 },
  ]);

  // 資料庫若有資料，開啟這個關掉上面那個
  // tables = signal<tables[]>([]);

  // 儲存不同日期的桌位開放狀態：Map<"YYYY-MM-DD", tables[]>
  tableAvailableByDate: Map<string, tables[]> = new Map();

  ngOnInit() {
    this.reservation = this.dataService.reservation;
    this.timeLabelsColumns();
    this.calendar(this.currentMonth()); // 本月日曆
    let today = new Date();
    let todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.selectedDay.set(todayZero);
    this.loadActivities(todayZero);
  }


  // 新增預約後更新排程
  addReservateToSchedule(newItem: reservation): void {
    this.reservation = [...this.dataService.reservation];
    if (newItem.reservationDate == this.formatDateStr(this.selectedDay())) {
      const todayList = this.reservation.filter(r =>
        r.reservationDate == newItem.reservationDate
      );
      this.currentDayReserve.set(this.toSchedule(todayList));
    }
  }

  // 設定星期幾
  getDayName(date: Date): string {
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return dayNames[date.getDay()];
  }

  // 時間欄
  timeLabelsColumns() {
    this.timeLabels = [];  // 把 timeLabels 清空，重新建立新的時間列表
    for (let hour = this.DISPLAY_START_HOUR; hour <= 22; hour++) {
      let hourStr = hour.toString().padStart(2, '0'); // padStart: 若只有 1 位數，前面補 0
      let time = hourStr + ":00";
      let display = hourStr + ":00";
      this.timeLabels.push({ time, display, hour });
    }
  }

  // 計算時間區塊TOP的位置 (px)
  getTopPosition(startTime: string): number {
    let [hours, minutes] = startTime.split(':').map(Number); // hours = 18, minutes = 30
    let totalMin = (hours - this.DISPLAY_START_HOUR) * 60 + minutes;
    let baseTop = totalMin * (this.HOUR_HEIGHT_PX / 60);
    return baseTop + (this.ACTIVITY_VERTICAL_MARGIN / 2);  // 每分鐘對應的像素 this.HOUR_HEIGHT_PX 是 一小時的高度（像素）。
  }

  // 計算活動區塊的高度 (px)
  getHeight(durationMin: number): number {
    let baseHeight = durationMin * (this.HOUR_HEIGHT_PX / 60);
    return baseHeight - this.ACTIVITY_VERTICAL_MARGIN;
  }

  // 計算活動應位於的網格欄位
  getTableGridColumn(item: scheduleItem): string {
    // 找到對應的桌位
    let index = this.tables().findIndex(t => t.table_id == item.tableId); // 找桌號
    let gridStart = index + 2;
    return `${gridStart} / span 1`;
  }


  // 日曆(6週)
  calendar(date: Date): void {
    let year = date.getFullYear(); // 取年份
    let month = date.getMonth(); // 取月份
    let firstDayOfMonth = new Date(year, month, 1); // 找這個月的第一天（2025/3/1）
    let startDayOfWeek = firstDayOfMonth.getDay();  // 找這個月第一天是星期幾 (0:日, 1:一 ...)
    let startDate = new Date(firstDayOfMonth); // 這個月的第一天
    startDate.setDate(startDate.getDate() - startDayOfWeek); // 把日期往前推 N 天 (1-6=-5)

    // [[Date, Date, Date, ... (7天)], [Date, Date, Date, ... (7天)], ...]
    let weeks: Date[][] = []; // 7天的陣列，共6週
    let currentLoopDate = new Date(startDate); // 這個月的第一天
    for (let i = 0; i < 6; i++) {  // 日曆要顯示6週，跑6次迴圈
      let week: Date[] = []; // 一週的陣列
      for (let j = 0; j < 7; j++) {  // 一週7天
        week.push(new Date(currentLoopDate));
        currentLoopDate.setDate(currentLoopDate.getDate() + 1); // 日期加1天
      }
      weeks.push(week); // 一週填完放入weeks
    }
    this.monthWeeks = weeks;
  }


  // 切換到上個月
  prevMonth(): void {
    this.currentMonth.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));  // 目前月份減 1，變成上個月的第一天
    this.calendar(this.currentMonth());
  }

  // 切換到下個月
  nextMonth(): void {
    this.currentMonth.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); // 目前月份加 1，變成上個月的第一天
    this.calendar(this.currentMonth());
  }

  // 選擇日期
  selectDay(day: Date): void {
    this.selectedDay.set(day);
    this.loadActivities(day);
    this.selectedReservationDetail.set(null);

    if (!this.isSameMonth(day, this.currentMonth())) { // 判斷若使用者點選日期不在當月
      this.currentMonth.set(new Date(day.getFullYear(), day.getMonth(), 1)); // 更新當前日曆
      this.calendar(this.currentMonth()); // 重新產生日曆
    }
  }

  // 載入活動(同時處理桌位狀態)
  loadActivities(date: Date): void {
    let dateStr = this.formatDateStr(date);
    const todayList = this.reservation.filter(r => r.reservationDate == dateStr);
    this.currentDayReserve.set(this.toSchedule(todayList));

    if (this.tableAvailableByDate.has(dateStr)) {
      // 1. 如果有紀錄，載入該日期的專屬狀態
      this.tables.set(this.tableAvailableByDate.get(dateStr)!);
    } else {
      // 2. 如果沒有紀錄，使用目前的 tables() 狀態作為初始值 (即預設值)
      //    並將其複製後存入 Map 中，確保每個日期有獨立的副本
      const initialTables = JSON.parse(JSON.stringify(this.tables())); // 深層複製
      this.tableAvailableByDate.set(dateStr, initialTables);
      // 注意：這裡不需要 this.tables.set()，因為 this.tables() 已經是當天的狀態了
      // 除非您想在每次切換日期時，都從一個固定的初始狀態開始，否則維持現狀即可。
    }
  }


  // 將後端 reservation 轉成 scheduleItem
  toSchedule(list: reservation[]): scheduleItem[] {
    return list.map((r, index) => {
      const duration = this.DEFAULT_DURATION_MINUTES;
      const [sh, sm] = r.reservationTime.split(':').map(Number);
      const endMinutes = sh * 60 + sm + duration;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;

      return {
        ...r,
        id: index + 1,
        endTime: `${endHour.toString().padStart(2, '0')}:${endMin
          .toString().padStart(2, '0')}`,
        useTime: duration
      };
    });
  }

  // 切換桌位開放狀態
  tableAvailabe(t: tables): void {
    const dateStr = this.formatDateStr(this.selectedDay()); // 取得當前選定日期

    // 1. 確保該日期的桌位狀態已存在於 Map 中
    //    (這應該在 loadActivities 中完成，但這裡再檢查一次以確保安全)
    if (!this.tableAvailableByDate.has(dateStr)) {
      // 如果因為某些原因不存在，使用當前 tables() 狀態作為基礎
      this.tableAvailableByDate.set(dateStr, JSON.parse(JSON.stringify(this.tables())));
    }

    // 2. 更新 Map 中的該日期的桌位狀態
    let dayTables = this.tableAvailableByDate.get(dateStr)!;
    dayTables = dayTables.map(table => {
      if (table.table_id == t.table_id) {
        let newStatus = table.table_status == '開放' ? '關閉' : '開放';
        return { ...table, table_status: newStatus };
      }
      return table;
    });

    // 3. 將更新後的陣列寫回 Map
    this.tableAvailableByDate.set(dateStr, dayTables);

    // 4. 更新 Signal 以立即反映在畫面上
    this.tables.set(dayTables);
  }

  // 新增訂位
  addReservation(tableId: string, hour: number): void {
    // 檢查是否為過去的日期
    if (this.isPastDay()) {
      return;
    }

    // 檢查是否為今日已過期的時段
    if (this.isToday(this.selectedDay()) && this.isPastHourSlot(hour)) {
      return;
    }

    // 取得目標桌位
    const targetTable = this.tables().find(t => t.table_id == tableId);

    // 檢查是否有桌位id或是否開放
    if (!targetTable || targetTable.table_status !== '開放')
      return;

    // 檢查是否是營業時間
    if (!this.ALLOWED_START_HOURS.includes(hour)) {
      return;
    }

    // 檢查時段是否已被佔用
    if (!this.isTimeSlotAvailable(tableId, hour)) {
      return;
    }

    const preFillDate = this.formatDateStr(this.selectedDay()); // 取得當前選擇的日期字串 (YYYY-MM-DD)
    const preFillTime = `${hour.toString().padStart(2, '0')}:00`; // 格式化時間 (例如 "12:00")

    const currentOpenTables = this.tables()
      .filter(t => t.table_status == '開放')
      .map(t => t.table_id);
    const allTableStatesArray = Array.from(this.tableAvailableByDate.entries()).map(([date, tables]) => ({
      date: date,
      tables: tables
    }));

    const defaultTablesList = this.tables().map(t => ({ table_id: t.table_id, table_status: t.table_status, capacity: t.capacity }));

    const dialogRef = this.dialog.open(DialogReservationComponent, {
      height: '490px',
      maxWidth: '900px',
      data: {
        tableId: tableId,    // 傳入桌號
        date: preFillDate,   // 傳入日期 (選填，建議加上)
        time: preFillTime,    // 傳入時間 (選填，建議加上)
        availableTables: currentOpenTables,
        allTableStates: allTableStatesArray,
        defaultTables: this.tables().map(t => ({ table_id: t.table_id, table_status: t.table_status, capacity: t.capacity })),
      }
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (!res) return;
      this.addReservateToSchedule(res);
    });
  }

  updateReserve() {
    const detail = this.selectedReservationDetail();

    // 檢查是否有選中的訂單詳細資訊
    if (!detail) {
      console.error("No reservation detail selected for update.");
      return;
    }

    // 因為 scheduleItem 包含了所有需要的 reservation 欄位，我們可以傳遞它
    const dialogRef = this.dialog.open(DialogReservationComponent, {
      height: '490px',
      maxWidth: '900px',
      data: {
        tableId: detail.tableId,
        date: detail.reservationDate,
        time: detail.reservationTime,
        existingReservation: detail, // <-- 帶入完整的現有訂單資料
      }
    });

    dialogRef.afterClosed().subscribe((res: reservation | 'deleted') => {
      if (!res) return; // 使用者關閉對話框

      if (res === 'deleted') {
        // 處理刪除的邏輯 (如果您在 Dialog 中實現了刪除)
        this.removeReservationFromSchedule(detail);
      } else {
        // 處理修改後的更新邏輯
        this.updateReservateInSchedule(res);
      }
    });
  }

  // 更新預約後更新排程
  updateReservateInSchedule(updatedItem: reservation): void {
    // 找到並取代舊的 reservation
    const index = this.reservation.findIndex(r => r.id === updatedItem.id);

    if (index !== -1) {
      // 1. 更新主 reservation 列表
      this.reservation[index] = updatedItem;
      // 2. 重新載入活動以更新畫面
      this.loadActivities(this.selectedDay());
      // 3. 更新詳細資訊面板（如果更新的是當前顯示的這筆）
      //    由於 loadActivities 會重新計算 scheduleItem，我們需要重新找到它
      const updatedScheduleItem = this.currentDayReserve().find(
        (item) => item.id === updatedItem.id
      );
      this.selectedReservationDetail.set(updatedScheduleItem || null);

      // 重新設定 dataService 中的資料（假設 dataService.reservation 是您的資料來源）
      // 如果您使用 DataService 儲存，可能需要呼叫一個 service 方法來更新它。
      // 這裡我們暫時假設 this.reservation 陣列是最終的資料來源。
    }
  }

  // 刪除預約後更新排程
  removeReservationFromSchedule(itemToRemove: scheduleItem): void {
    // 1. 從主 reservation 列表移除
    this.reservation = this.reservation.filter(r => r.id !== itemToRemove.id);

    // 2. 重新載入活動以更新畫面
    this.loadActivities(this.selectedDay());

    // 3. 清空詳細資訊面板
    this.selectedReservationDetail.set(null);
  }

  deleteReserve(): void {
    const detail = this.selectedReservationDetail();
    if (detail) {
      if (confirm(`確定要刪除顧客 ${detail.reservationName} 的訂單嗎？`)) {
        this.removeReservationFromSchedule(detail);
      }
    }
  }

  // 顯示訂單詳細資訊
  showReservationDetail(item: scheduleItem): void {
    this.selectedReservationDetail.set(item);
  }


  // 用來在 HTML 判斷該格子是否可點擊 (給 CSS 用)
  isAllowedHour(hour: number): boolean {
    return this.ALLOWED_START_HOURS.includes(hour);
  }


  // 指定桌位在給定小時是否有活動覆蓋
  // 新增可選參數: 忽略一個活動，主要用於拖曳時，排除自身重疊檢查
  isTimeSlotAvailable(tableId: string, startHour: number, ignoreItem?: scheduleItem): boolean {
    // 預約的時長是 DEFAULT_DURATION_MINUTES (120 分鐘)
    const newReservationDuration = this.DEFAULT_DURATION_MINUTES;
    const startTimeInMinutes = startHour * 60;

    const endTimeInMinutes = startTimeInMinutes + newReservationDuration; // 新預約的結束時間（分鐘）
    const reservations = this.currentDayReserve(); // 取得當天所有預約資料

    // 檢查當天所有的現有活動
    for (let item of reservations) {

      // 【新增】如果是要忽略的項目，則跳過重疊檢查
      if (ignoreItem && item.tableId === ignoreItem.tableId && item.reservationTime === ignoreItem.reservationTime) {
        continue;
      }

      if (item.tableId == tableId) {
        // 解析現有活動的開始時間（分鐘）
        const [rStartHour, rStartMinute] = item.reservationTime.split(':').map(Number);
        const rStartTimeInMinutes = rStartHour * 60 + rStartMinute;

        // 現有活動的結束時間（分鐘）
        const rEndTimeInMinutes = rStartTimeInMinutes + item.useTime;

        // 檢查時間重疊：[rStartTimeInMinutes, rEndTimeInMinutes) 和 [startTimeInMinutes, endTimeInMinutes) 是否有交集
        if (rStartTimeInMinutes < endTimeInMinutes && startTimeInMinutes < rEndTimeInMinutes) {
          return false; // 時段已被佔用
        }
      }
    }
    return true; // 時段可用
  }

  // 檢查選定的日期是否是過去的日期
  isPastDay(): boolean {
    const today = new Date();
    // 將今天和選定日期進行日期比較
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedStart = new Date(this.selectedDay().getFullYear(), this.selectedDay().getMonth(), this.selectedDay().getDate());
    return selectedStart < todayStart;  // 如果選定的日期比今天早，則為過去的日期
  }

  // 檢查該時段是否已過期 (用於當天)
  isPastHourSlot(startHour: number): boolean {
    const now = new Date();
    const selectedDayStart = new Date(this.selectedDay().getFullYear(), this.selectedDay().getMonth(), this.selectedDay().getDate());
    const slotStart = new Date(selectedDayStart);
    slotStart.setHours(startHour, 0, 0, 0);
    return slotStart <= now;
  }

  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
  }

  // 判斷兩個日期是否在同一個月份
  isSameMonth(d1: Date, d2: Date): boolean {
    return d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDate(date, today);
  }

  hasActivity(date: Date): boolean {
    const key = this.formatDateStr(date);
    return this.reservation.some(r => r.reservationDate == key);
  }

  // 日期轉字串
  formatDateStr(date: Date): string {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // padStart: 若只有 1 位數，前面補 0
    let day = date.getDate().toString().padStart(2, '0');
    return year + "-" + month + "-" + day;
  }

}
