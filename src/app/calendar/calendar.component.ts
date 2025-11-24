import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // 導入 OnInit
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common'; // 確保 NgClass 被導入
import { MatDialog } from '@angular/material/dialog';
import { ActivityDialogComponent, DialogResult } from '../activity-dialog/activity-dialog.component';
import { AiService } from '../@service/ai.service';


@Component({
  selector: 'app-calendar',
  imports: [
    DatePipe,
    FormsModule,
    NgClass,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit { // 實現 OnInit 介面
  currentMonth: Date = new Date();

  activities: Activity[] = [
    { id: 1, title: '部門會議', description: '會議', startDate: new Date('2025-11-17'), endDate: new Date('2025-11-17'), status: 'published' },
    { id: 2, title: '客戶拜訪', description: '拜訪', startDate: new Date('2025-11-20'), endDate: new Date('2025-11-20'), status: 'published' },
    { id: 3, title: '晚餐聚會', description: '聚會', startDate: new Date('2025-11-20'), endDate: new Date('2025-11-20'), status: 'draft' },
    { id: 4, title: '巴黎旅遊', description: '旅遊', startDate: new Date('2025-11-10'), endDate: new Date('2025-11-15'), status: 'draft' },
    { id: 5, title: '專案 Sprint', description: 'Sprint', startDate: new Date('2025-11-18'), endDate: new Date('2025-11-25'), status: 'published' }
  ];

  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六'];
  monthWeeks: (Date | null)[][] = [];
  selectedDay: Date | null = new Date();
  selectedDayActivities: Activity[] = [];

  newActivityId: number = this.activities.length > 0 ? Math.max(...this.activities.map(a => a.id)) + 1 : 1;
  newActivityTitle: string = '';
  newActivityDescription: string = '';
  newActivityStartDate: string = '';
  newActivityEndDate: string = '';

  ngOnInit() {
    this.generateCalendar(this.currentMonth);
    this.selectedDay = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      new Date().getDate()
    );
    // 預設載入選中日的活動
    if (this.selectedDay) {
      this.selectedDayActivities = this.getDayActivities(this.selectedDay);
    }
  }

  generateCalendar(date: Date): void {
    // 您的 generateCalendar 邏輯不變
    // ...
    this.monthWeeks = [];
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startingDay = firstDayOfMonth.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let currentDay = 1;

    for (let w = 0; w < 6; w++) {
      const week: (Date | null)[] = [];
      for (let d = 0; d < 7; d++) {
        if (w === 0 && d < startingDay) {
          week.push(null);
        } else if (currentDay <= daysInMonth) {
          week.push(new Date(year, month, currentDay));
          currentDay++;
        } else {
          week.push(null);
        }
      }
      this.monthWeeks.push(week);
      if (currentDay > daysInMonth) break;
    }
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar(this.currentMonth);
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar(this.currentMonth);
  }

  selectDay(day: Date | null): void {
    if (day) {
      this.selectedDay = day;
      this.selectedDayActivities = this.getDayActivities(day);
    }
  }

  // 修正後的活動篩選邏輯：精確比較年/月/日
  getDayActivities(day: Date) {
    const currentDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());

    return this.activities.filter((a: Activity) => {
      const startDate = new Date(a.startDate.getFullYear(), a.startDate.getMonth(), a.startDate.getDate());
      const endDate = new Date(a.endDate.getFullYear(), a.endDate.getMonth(), a.endDate.getDate());

      return currentDay.getTime() >= startDate.getTime() && currentDay.getTime() <= endDate.getTime();
    });
  }

  // 判斷是否為多日活動
  isMultiDay(a: Activity): boolean {
    return a.startDate.toDateString() !== a.endDate.toDateString();
  }

  // 判斷是否為多日活動的開始日 (修正後的邏輯，只判斷多日活動)
  isActivityStartDay(activity: Activity, currentDay: Date): boolean {
    if (!currentDay || !activity.startDate || !this.isMultiDay(activity)) {
      return false;
    }

    const start = new Date(activity.startDate.getFullYear(), activity.startDate.getMonth(), activity.startDate.getDate());
    const current = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());

    return current.getTime() === start.getTime();
  }

  // activityText = '';

  constructor(
    public aiService: AiService,
    public dialog: MatDialog,
  ) { }

  inputText = '';
  activityResult: CreateActivity | null = null;

  description!: string;
  startDate!: Date;

  extractTitle(text: string): string {
    const separators = ['，', ',', '。'];
    const firstPart = text.split(new RegExp(separators.join('|')))[0];
    return firstPart.replace(/優惠|活動|促銷/g, '').trim();
  }

  detectDuration(text: string): number {
    const t = text.replace(/\s+/g, '').toLowerCase();

    if (t.includes('一周') || t.includes('一週') || t.includes('7天') || t.includes('7日')) return 7;
    if (t.includes('三天') || t.includes('3天')) return 3;
    if (t.includes('兩週') || t.includes('兩周') || t.includes('2週') || t.includes('14天')) return 14;
    if (t.includes('一天') || t.includes('1天') || t.includes('當日')) return 1;
    if (t.includes('兩天') || t.includes('2天')) return 2;
    if (t.includes('一個月') || t.includes('1個月') || t.includes('30天')) return 30;

    // 若句中有 "持續X天" 類型，自行擷取數字
    const m = text.match(/持續(\d+)[天日週週天]/);
    if (m && m[1]) return parseInt(m[1], 10);

    // default fallback: 7 天
    return 7;
  }

  openDialog(): void {
    if (!this.startDate || !this.inputText) {
      alert('請填寫所有活動資訊');
      return;
    }
    const title = this.extractTitle(this.inputText);
    const durationDays = this.detectDuration(this.inputText);
    const start = new Date(this.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + durationDays - 1);



    // 1. 建立 CreateActivity 物件
    const activityData: CreateActivity = {
      title: title,
      startDate: new Date(this.startDate),
      endDate: new Date(end),
      description: this.inputText
    };
    console.log('準備新增的活動資料:', activityData);

    const dialogRef = this.dialog.open(ActivityDialogComponent, {
      width: '400px',
      height: '400px',
      data: activityData
    })

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      console.log('Dialog 已關閉, 回傳結果:', result);

      if (result && (result.action === 'publish' || result.action === 'save')) {

        let newActivity: Activity;
        const baseId = this.activities.length > 0 ? Math.max(...this.activities.map(a => a.id)) + 1 : 1; // 產生新的 ID

        const status = result.action === 'publish' ? 'published' : 'draft';

        newActivity = {
          id: baseId,
          ...activityData,
          status: status,
        };

        this.activities = [...this.activities, newActivity];

        this.generateCalendar(this.currentMonth);
        if (this.selectedDay) {
          this.selectedDayActivities = this.getDayActivities(this.selectedDay);
        }

        console.log(`活動已新增為 [${status.toUpperCase()}]，顏色將由 CSS 決定。`);
      } else {
        console.log('使用者選擇 取消 或 以非按鈕方式關閉。');
      }
    });
  }

}

export interface Activity {
  id: number,
  title: string,
  description: string,
  startDate: Date,
  endDate: Date,
  status: 'published' | 'draft',
}

interface CreateActivity {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
}
