import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivityDialogComponent, DialogResult } from '../activity-dialog/activity-dialog.component';
import { ActivityCheckDialogComponent } from '../activity-check-dialog/activity-check-dialog.component';
import { BoardComponent } from '../board/board.component';

@Component({
  selector: 'app-calendar',
  imports: [
    DatePipe,
    FormsModule,
    NgClass,
    BoardComponent
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  currentMonth: Date = new Date();

  activities: Activity[] = [
    { id: 1, title: '部門會議', description: '會議', startDate: new Date('2025-11-17'), endDate: new Date('2025-11-17'), status: 'published', photo: null },
    { id: 3, title: '晚餐聚會', description: '聚會', startDate: new Date('2025-11-20'), endDate: new Date('2025-11-20'), status: 'draft', photo: null },
    { id: 4, title: '巴黎旅遊', description: '旅遊', startDate: new Date('2025-11-10'), endDate: new Date('2025-11-15'), status: 'draft', photo: null },
    { id: 5, title: '部門會議', description: '會議', startDate: new Date('2025-11-25'), endDate: new Date('2025-11-30'), status: 'published', photo: null }
  ];

  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六'];
  monthWeeks: (Date | null)[][] = [];
  selectedDay: Date | null = null;
  selectedDayActivities: Activity[] = [];

  inputText: string = '';
  startDate: string = '';
  selectedPhotoFile: File | null = null;
  photoBase64: string | null = null;

  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.generateCalendar(this.currentMonth);
    const today = new Date();
    this.selectedDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (this.selectedDay) {
      this.selectedDayActivities = this.getDayActivities(this.selectedDay);
    }

    this.startDate = new Date().toISOString().split('T')[0];
  }

  generateCalendar(date: Date): void {
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

  getDayActivities(day: Date) {
    const currentDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());

    return this.activities.filter((a: Activity) => {
      const startDate = new Date(a.startDate.getFullYear(), a.startDate.getMonth(), a.startDate.getDate());
      const endDate = new Date(a.endDate.getFullYear(), a.endDate.getMonth(), a.endDate.getDate());

      return currentDay.getTime() >= startDate.getTime() && currentDay.getTime() <= endDate.getTime();
    });
  }

  isMultiDay(a: Activity): boolean {
    return a.startDate.toDateString() !== a.endDate.toDateString();
  }

  isActivityStartDay(activity: Activity, currentDay: Date): boolean {
    if (!currentDay || !activity.startDate || !this.isMultiDay(activity)) {
      return false;
    }

    const start = new Date(activity.startDate.getFullYear(), activity.startDate.getMonth(), activity.startDate.getDate());
    const current = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());

    return current.getTime() === start.getTime();
  }

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

    return 7;
  }

  openDialog(): void {
    if (!this.startDate || !this.inputText.trim() || !this.selectedPhotoFile) {
      alert('請填寫所有活動資訊');
      return;
    }

    const createData: CreateActivity = {
      inputText: this.inputText.trim(),
      startDate: this.startDate,
      photoFile: this.selectedPhotoFile,
      photoBase64: this.photoBase64
    };
    console.log('準備新增的活動資料:', createData);

    const dialogRef = this.dialog.open(ActivityDialogComponent, {
      width: '400px',
      height: '400px',
      data: createData
    });

    dialogRef.afterClosed().subscribe((result: DialogResult) => {
      if (result && (result.action === 'publish' || result.action === 'save')) {

        const durationDays = this.detectDuration(createData.inputText);
        const start = new Date(createData.startDate);
        const end = new Date(start);

        end.setDate(start.getDate() + durationDays - 1);

        const nextId = this.activities.length > 0 ?
          Math.max(...this.activities.map(a => a.id)) + 1 :
          1;

        const status = result.action === 'publish' ? 'published' : 'draft';

        const newActivity: Activity = {
          id: nextId,
          title: this.extractTitle(createData.inputText),
          description: createData.inputText,
          startDate: start,
          endDate: end,
          status: status,
          photo: this.photoBase64,
        };

        this.activities = [...this.activities, newActivity];

        this.generateCalendar(this.currentMonth);
        if (this.selectedDay) {
          this.selectedDayActivities = this.getDayActivities(this.selectedDay);
        }

        this.resetForm();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPhotoFile = input.files[0];
      this.convertToBase64(this.selectedPhotoFile);
    } else {
      this.selectedPhotoFile = null;
      this.photoBase64 = null;
    }
  }

  convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.photoBase64 = reader.result as string;
      console.log('圖片已轉換為 Base64');
    };
    reader.onerror = (error) => {
      console.error('檔案讀取失敗', error);
      this.photoBase64 = null;
    };
    reader.readAsDataURL(file);
  }

  openActivity(activity: Activity) {
    this.dialog.open(ActivityCheckDialogComponent, {
      width: '400px',
      height: '500px',
      data: { ...activity }
    }).afterClosed().subscribe(result => {
      if (result) {
        Object.assign(activity, result);
      }
    })
  }

  private resetForm(): void {
    this.inputText = '';
    this.selectedPhotoFile = null;
    this.photoBase64 = null;
    this.startDate = new Date().toISOString().split('T')[0];
  }

  readonly BOARD_THRESHOLD_DAYS = 3;

  get boardActivities(): Activity[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('DEBUG: Today (midnight) is:', today.toLocaleDateString());

    const futureCutoff = new Date(today);
    futureCutoff.setDate(today.getDate() + this.BOARD_THRESHOLD_DAYS);
    console.log('DEBUG: Future Cutoff is:', futureCutoff.toLocaleDateString());

    return this.activities.filter(activity => {
      if (activity.status !== 'published') {
        return false;
      }

      const startDate = new Date(activity.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(activity.endDate);
      endDate.setHours(0, 0, 0, 0);

      const isOngoing = startDate.getTime() <= today.getTime() && today.getTime() <= endDate.getTime();

      const isUpcoming = today.getTime() < startDate.getTime() && startDate.getTime() <= futureCutoff.getTime();

      console.log(`DEBUG Activity ID ${activity.id} (${activity.title}): isOngoing=${isOngoing}, isUpcoming=${isUpcoming}, Start=${startDate.toLocaleDateString()}, End=${endDate.toLocaleDateString()}`);

      return isOngoing || isUpcoming;
    });
  }
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'published' | 'draft';
  photo: string | null;
}

export interface CreateActivity {
  inputText: string;
  startDate: string;
  photoFile?: File | null;
  photoBase64?: string | null;
}

