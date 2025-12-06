import { scheduleItem, tables, timeLabel } from './../@interface/interface';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-reserve',
  imports: [CommonModule],
  templateUrl: './reserve.component.html',
  styleUrl: './reserve.component.scss'
})
export class ReserveComponent {

  // signal = 會自動通知 HTML 重新更新的變數
  currentMonth: Date = new Date(); // 目前日曆顯示的月份
  selectedDay: Date = new Date(); // 使用者目前選擇的日期
  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六']; // 星期的標題
  monthWeeks: Date[][] = []; // 存6 週 x 7 天的月曆 [週][天]
  tables = <tables[]>([]); // 儲存當前選中日期的桌位列表及其狀態
  timeLabel: timeLabel[] = []; // 排程左側時間軸

  // 排程圖區塊
  readonly DISPLAY_START_HOUR = 10; // 排程圖顯示的開始時間（從 10:00 開始)
  readonly HOUR_HEIGHT_PX = 45;   // 每小時區塊對應的像素高度
  readonly ACTIVITY_VERTICAL_MARGIN = 10; // 每筆預約上下間隔

  ngOnInit(): void {
    this.calendar(this.currentMonth);
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
    let weeks: Date[][] = []; // 7天的陣列，共6週
    let currentLoopDate = new Date(startDate); // 這個月的第一天
    for (let i = 0; i < 6; i++) { // 日曆要顯示6週，跑6次迴圈
      let week: Date[] = []; // 一週的陣列
      for (let j = 0; j < 7; j++) { // 一週7天
        week.push(new Date(currentLoopDate));
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
  selectDay(): void {

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

  // 計算預約區塊的高度 (px)
  getHeight(stayMin: number): number {
    let baseHeight = stayMin * (this.HOUR_HEIGHT_PX / 60); // 分鐘數 * (每分鐘對應的像素)
    return baseHeight - this.ACTIVITY_VERTICAL_MARGIN; // 減去上下間隔後的最終高度
  }

  // 計算預約位於的網格欄位
  getTableGridColumn(item: scheduleItem): string {
    let index = this.tables.findIndex(t => t.table_id == item.tableId); // 找到對應的桌位
    let gridStart = index + 2; // 計算網格開始位置 (索引 + 2，因為左側有時間欄位和標頭佔用)
    return `${gridStart} / span 1`; // 讓預約放到對應的直欄
  }
}
