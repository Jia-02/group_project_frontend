import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogReservationComponent } from '../@dialog/dialog-reservation/dialog-reservation.component';
import { tables, reservation, scheduleItem, timeLabel } from '../@interface/interface';

@Component({
  selector: 'app-reservation',
  imports: [CommonModule],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})


export class ReservationComponent {
  // signal = 會自動通知 HTML 重新更新的變數
  currentMonth: WritableSignal<Date> = signal(new Date()); // 用來放日曆顯示的月份
  selectedDay: WritableSignal<Date> = signal(new Date());  // 用來放使用者目前選到哪一天
  currentDayReserve: WritableSignal<scheduleItem[]> = signal([]); // 存放當前選中日期的活動
  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六']; // 星期
  monthWeeks: Date[][] = []; // 存放日期的月曆

  readonly dialog = inject(MatDialog);

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
  ]);

  // 時間列表
  timeLabels: timeLabel[] = [];

  // 每小時的高度 (CSS 中定義，用於計算)
  readonly HOUR_HEIGHT_PX = 40;
  // 預設預約長度 (2 小時 = 120 分鐘)
  readonly DEFAULT_DURATION_MINUTES = 120;

  // 模擬活動資料 (Key: YYYY-MM-DD)
  mockActivities: { [key: string]: scheduleItem[] } = {};
  private nextActivityId: number = 100;

  ngOnInit() {
    this.timeLabelsColumns();
    this.generateMockData();

    // 1. 初始化日曆
    this.calendar(this.currentMonth());
    // 2. 設定選中今天
    let today = new Date();
    let todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    this.selectedDay.set(todayZero);
    this.loadActivities(todayZero);
  }

  // 設定星期幾
  getDayName(date: Date): string {
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return dayNames[date.getDay()];
  }

  // 時間欄
  timeLabelsColumns() {
    this.timeLabels = [];  // 把 timeLabels 清空，重新建立新的時間列表
    for (let hour = 10; hour <= 22; hour++) {
      let hourStr = hour.toString().padStart(2, '0'); // padStart: 若只有 1 位數，前面補 0
      let time = hourStr + ":00";
      let display = hourStr + ":00";
      this.timeLabels.push({ time, display, hour });
    }
  }

  // 計算時間區塊的位置 (px)
  getTopPosition(startTime: string): number {
    let [hours, minutes] = startTime.split(':').map(Number); // hours = 18, minutes = 30
    let totalMin = (hours - 10) * 60 + minutes;
    return totalMin * (this.HOUR_HEIGHT_PX / 60);  // 每分鐘對應的像素 this.HOUR_HEIGHT_PX 是 一小時的高度（像素）。
  }

  // 計算活動區塊的高度 (px)
  getHeight(durationMin: number): number {
    return durationMin * (this.HOUR_HEIGHT_PX / 60); // this.HOUR_HEIGHT_PX 是 一小時在日程表上的高度（像素）
  }

  // 計算活動應位於的網格欄位
  getTableGridColumn(item: scheduleItem): string {
    // 找到對應的桌位
    let index = this.tables().findIndex(t => t.table_id == item.tableId); // 找桌號
    let gridStart = index + 1;
    return `${gridStart} / span 1`;
  }

  // ------------------------------------


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

    if (!this.isSameMonth(day, this.currentMonth())) { // 判斷若使用者點選日期不在當月
      this.currentMonth.set(new Date(day.getFullYear(), day.getMonth(), 1)); // 更新當前日曆
      this.calendar(this.currentMonth()); // 重新產生日曆
    }
  }

  // 載入活動
  loadActivities(date: Date): void {
    let dateStr = this.formatDateStr(date);
    let dayReserve = this.mockActivities[dateStr] || [];
    this.currentDayReserve.set(dayReserve);
  }

  // 切換桌位開放狀態
  tableAvailabe(t: tables): void {
    this.tables.update(currentTables => {
      return currentTables.map(table => {
        if (table.table_id == t.table_id) {
          // 如果目前是"開放" 則切換為 "關閉"，反之亦然
          let newStatus = '';
          if (table.table_status == '開放') {
            newStatus = '關閉';
          } else {
            newStatus = '開放';
          }
          return { ...table, table_status: newStatus };
        }
        return table;
      });
    });
  }

  addReservation(tableId: string, hour: number): void {
    this.dialog.open(DialogReservationComponent);
    const targetTable = this.tables().find(t => t.table_id === tableId);

    // 檢查狀態字串
    if (!targetTable || targetTable.table_status !== '開放') return;
    if (hour < 8 || hour > 19) {
      console.warn('非營業時間');
      return;
    }
  }

  // ------------------------------------

  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() == d2.getFullYear() &&
      d1.getMonth() == d2.getMonth() &&
      d1.getDate() == d2.getDate();
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
    return !!this.mockActivities[key] && this.mockActivities[key].length > 0;
  }

  // 日期轉字串
  formatDateStr(date: Date): string {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // padStart: 若只有 1 位數，前面補 0
    let day = date.getDate().toString().padStart(2, '0');
    return year + "-" + month + "-" + day;
  }


  // 模擬資料 (根據新結構調整)
  generateMockData() {
    // 取得今日時間
    let today = new Date();
    let keyToday = this.formatDateStr(today);

    // 計算訂位結束時間
    let calculateEndTime = (startTime: string, durationMinutes: number): string => {
      let [startHour, startMinute] = startTime.split(':').map(Number);  // ["11", "00"] > [11, 0]
      let totalMinutes = startHour * 60 + startMinute + durationMinutes;
      let endHour = Math.floor(totalMinutes / 60) % 24;  //Math.floor 無條件捨去
      let endMinute = totalMinutes % 60;
      return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;  // 結果變成 “12:30” 格式
    };

    // 將後端 reservation → 前端 scheduleItem
    const scheduleList: scheduleItem[] = this.reservation.map(r => {
      const duration = 120; // 若後端未提供 duration，可固定值 or 改成 r.useTime
      const endTime = calculateEndTime(r.reservationTime, duration);

      return {
        ...r,
        id: this.nextActivityId++,
        endTime: endTime,
        useTime: duration
      };
    });

    this.mockActivities = {
      [keyToday]: scheduleList
    };
  }


  reservation: reservation[] = [
    {
      newDate: '',
      reservationDate: '2025-11-25',
      reservationTime: '11:00',
      reservationPhone: '0912-345-678',
      reservationName: '李先生',
      reservationCount: 4,
      reservationAdultCount: 4,
      reservationChildCount: 0,
      reservationStatus: true,
      reservationNote: '',
      childSeat: 0,
      tableId: 'A01'
    },
    // ... 其他資料
  ];
}





