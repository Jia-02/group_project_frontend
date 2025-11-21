import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-calendar',
  imports: [
    DatePipe
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  currentMonth: Date = new Date();

  // 顯示星期幾的名稱 (可自行調整順序，這裡以週日為第一天)
  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六'];

  // 用於在 HTML 模板中迭代，是一個二維陣列 (6週 x 7天)
  monthWeeks: (Date | null)[][] = [];

  // 用於顯示日曆下方活動的屬性
  selectedDay: Date | null = new Date();
  selectedDayActivities: any[] = []; // 替換為您的活動資料結構

  // 假設的活動資料 (您需要從服務或 API 獲取實際資料)
  // key 是 'YYYY-MM-DD' 格式的日期字串
  mockActivities: { [key: string]: { time: string, title: string }[] } = {
    '2025-11-17': [{ time: '10:00', title: '部門會議' }],
    '2025-11-20': [{ time: '14:30', title: '客戶拜訪' }, { time: '18:00', title: '晚餐聚會' }],
    // ... 其他月份的活動
  };

  ngOnInit() {
    this.generateCalendar(this.currentMonth);
    this.selectedDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), new Date().getDate());
    this.loadActivities(this.selectedDay!);
  }

  // 生成日曆網格的方法
  generateCalendar(date: Date): void {
    this.monthWeeks = []; // 清空舊資料
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    // 獲取當月的第一天
    const firstDayOfMonth = new Date(year, month, 1);
    // 獲取當月第一天是星期幾 (0=週日, 6=週六)
    const startingDay = firstDayOfMonth.getDay();

    // 獲取當月的總天數
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let currentDay = 1;
    // 創建多達 6 週的網格
    for (let w = 0; w < 6; w++) {
      const week: (Date | null)[] = [];
      for (let d = 0; d < 7; d++) {
        if (w === 0 && d < startingDay) {
          // 第一週，在當月第一天之前的日子，填補 null (空白)
          week.push(null);
        } else if (currentDay <= daysInMonth) {
          // 填入當月日期
          week.push(new Date(year, month, currentDay));
          currentDay++;
        } else {
          // 超過當月天數後，填補 null (空白)
          week.push(null);
        }
      }
      this.monthWeeks.push(week);
      // 如果當月所有天數都已經填完，則退出循環
      if (currentDay > daysInMonth) break;
    }
  }

  // 切換到上個月
  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar(this.currentMonth);
    // 可選：切換月份後，預設選擇新月份的第一天
    this.selectedDay = this.monthWeeks[0].find(d => d !== null) || null;
    if (this.selectedDay) this.loadActivities(this.selectedDay);
  }

  // 切換到下個月
  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar(this.currentMonth);
    // 可選：切換月份後，預設選擇新月份的第一天
    this.selectedDay = this.monthWeeks[0].find(d => d !== null) || null;
    if (this.selectedDay) this.loadActivities(this.selectedDay);
  }

  // 點擊日曆中的某一天
  selectDay(day: Date | null): void {
    if (day) {
      this.selectedDay = day;
      this.loadActivities(day);
    }
  }

  // 加載所選日期的活動
  loadActivities(date: Date): void {
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    // 從您的資料來源獲取活動
    this.selectedDayActivities = this.mockActivities[dateKey] || [];
  }

  formatDateToKey(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // **新增：檢查日期是否有活動**
  hasActivity(date: Date | null): boolean {
    if (!date) return false;
    const dateKey = this.formatDateToKey(date);
    return !!this.mockActivities[dateKey];
  }

  addActivity(){

  }

}
