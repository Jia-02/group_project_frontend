import { DataService } from './../@service/data.service';
import { ActivityCheckDialogComponent } from '../activity-check-dialog/activity-check-dialog.component';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivityReadDialogComponent } from '../activity-read-dialog/activity-read-dialog.component';
import { ActivityDialogComponent, DialogResult } from '../activity-dialog/activity-dialog.component';
import { ActivityCreateDialogComponent } from '../activity-create-dialog/activity-create-dialog.component';

@Component({
  selector: 'app-calendar',
  imports: [
    DatePipe,
    FormsModule,
    NgClass
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  currentMonth: Date = new Date();
  today: Date = new Date();

  activities: Activity[] = [];
  boardActivities: Activity[] = [];
  BOARD_THRESHOLD_DAYS = 4;

  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六'];
  monthWeeks: (Date | null)[][] = [];
  selectedDay: Date | null = null;
  selectedDayActivities: Activity[] = [];

  calendarTitle: string = '';
  calendarDescription: string = '';
  calendarStartDate: string = '';
  calendarEndDate: string = '';

  selectedPhotoFile: File | null = null;
  photoUrl: string | null = null;

  constructor(
    public dialog: MatDialog,
    private dataService: DataService,
  ) { }

  ngOnInit() {
    this.generateCalendar(this.currentMonth);
    const today = new Date();
    this.selectedDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    this.loadActivities();

    this.generateCalendar(this.currentMonth);
    if (this.selectedDay) {
      this.selectedDayActivities = this.getDayActivities(this.selectedDay);
    }


    this.calendarStartDate = new Date().toISOString().split('T')[0];
    this.calendarEndDate = this.calendarStartDate;
  }

  loadActivities(): void {
    const apiUrl = 'http://localhost:8080/calendar/list';

    this.dataService.getApi(apiUrl).subscribe((res: any) => {
      const rawActivities: Activity[] = res.activities || res;

      const processedActivities = rawActivities.map(act => {
        return {
          ...act,
          calendarStartDate: new Date(act.calendarStartDate),
          calendarEndDate: new Date(act.calendarEndDate),
          calendarStatus: act.calendarStatus ? 'published' : 'draft'
        };
      });
      // this.activities = processedActivities;
      // this.boardActivities = this.filterBoardActivities(processedActivities);
      console.log('已從後端取得所有活動:', this.activities.length);
      console.log('Board 活動數量:', this.boardActivities.length);

      this.generateCalendar(this.currentMonth);
      if (this.selectedDay) {
        this.selectedDayActivities = this.getDayActivities(this.selectedDay);
      }

    });
  }

  private filterBoardActivities(allActivities: Activity[]): Activity[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureLimit = new Date(today);
    futureLimit.setDate(today.getDate() + this.BOARD_THRESHOLD_DAYS);

    return allActivities
      .filter(act => act.calendarStatus === 'published')
      .filter(act => {
        const startDate = new Date(act.calendarStartDate);
        const endDate = new Date(act.calendarEndDate);

        const ongoingOrFuture = endDate >= today && startDate < futureLimit;

        return ongoingOrFuture;
      })
      .sort((a, b) => a.calendarStartDate.getTime() - b.calendarStartDate.getTime());
  }

  selectDay(day: Date | null): void {
    if (day) {
      this.selectedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());

      if (this.selectedDay) {
        this.selectedDayActivities = this.getDayActivities(this.selectedDay);
      }
    }
  }

  generateCalendar(date: Date): void {
    this.monthWeeks = [];
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startingDay = firstDayOfMonth.getDay();

    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const prevMonthDaysToShow = startingDay;

    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

    let currentDay = 1;
    let nextMonthDay = 1;

    for (let w = 0; w < 6; w++) {
      const week: (Date | null)[] = [];
      let hasCurrentMonthDay = false;

      for (let d = 0; d < 7; d++) {
        if (w === 0 && d < prevMonthDaysToShow) {
          const prevMonthDay = daysInPrevMonth - prevMonthDaysToShow + d + 1;
          week.push(new Date(year, month - 1, prevMonthDay));
        } else if (currentDay <= daysInCurrentMonth) {
          week.push(new Date(year, month, currentDay));
          currentDay++;
          hasCurrentMonthDay = true;
        } else {
          week.push(new Date(year, month + 1, nextMonthDay));
          nextMonthDay++;
        }
      }

      if (currentDay > daysInCurrentMonth && !hasCurrentMonthDay) break;

      this.monthWeeks.push(week);

      if (currentDay > daysInCurrentMonth && w === 5) break;

      if (currentDay > daysInCurrentMonth && week.some(day => day?.getMonth() === month)) {
      } else if (currentDay > daysInCurrentMonth) {
        break;
      }
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

  // selectDay(day: Date | null): void {
  //   if (day) {
  //     this.selectedDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());

  //     const formattedDate = day.toISOString().split('T')[0];

  //     const apiUrl = `http://localhost:8080/calendar/selectDate`;

  //     this.dataService.getApi(apiUrl).subscribe((res: any) => {
  //       const activitiesFromApi: Activity[] = res.activities || res;

  //       this.selectedDayActivities = activitiesFromApi.map(act => {
  //         return {
  //           ...act,
  //           calendarStartDate: new Date(act.calendarStartDate),
  //           calendarEndDate: new Date(act.calendarEndDate)
  //         };
  //       })
  //       console.log(`已從後端取得 ${formattedDate} 的活動:`, this.selectedDayActivities);
  //     }
  //     );
  //   }
  // }

  getDayActivities(day: Date) {
    const currentDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());

    return this.activities.filter((a: Activity) => {
      const startDate = new Date(a.calendarStartDate.getFullYear(), a.calendarStartDate.getMonth(), a.calendarStartDate.getDate());
      const endDate = new Date(a.calendarEndDate.getFullYear(), a.calendarEndDate.getMonth(), a.calendarEndDate.getDate());

      return currentDay.getTime() >= startDate.getTime() && currentDay.getTime() <= endDate.getTime();
    });
  }

  isMultiDay(a: Activity): boolean {
    return a.calendarStartDate.toDateString() !== a.calendarEndDate.toDateString();
  }

  isActivityStartDay(activity: Activity, currentDay: Date): boolean {
    if (!currentDay || !activity.calendarStartDate) {
      return false;
    }

    const start = new Date(activity.calendarStartDate.getFullYear(), activity.calendarStartDate.getMonth(), activity.calendarStartDate.getDate());
    const current = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate());

    return current.getTime() === start.getTime();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ActivityCreateDialogComponent, {
      width: '500px',
      height: 'auto'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const { formData, photoFile } = result;

      // 👉 呼叫你的確認頁面 (ActivityDialogComponent)
      const checkRef = this.dialog.open(ActivityDialogComponent, {
        width: '400px',
        height: '400px',
        data: formData
      });

      checkRef.afterClosed().subscribe((finalResult) => {
        if (!finalResult) return;

        const newActivity: Activity = {
          ...finalResult.data,
          calendarStartDate: new Date(finalResult.data.calendarStartDate),
          calendarEndDate: new Date(finalResult.data.calendarEndDate)
        };

        this.activities.push(newActivity);
        this.activities = [...this.activities];

        this.generateCalendar(this.currentMonth);
        if (this.selectedDay) {
          this.selectedDayActivities = this.getDayActivities(this.selectedDay);
        }
      });

    })
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPhotoFile = input.files[0];
      this.photoUrl = `calendar/images/${this.selectedPhotoFile.name}`;
    } else {
      this.selectedPhotoFile = null;
      this.photoUrl = null;
    }
  }

  openActivity(activity: Activity) {
    if (activity.calendarStatus === 'published') {
      this.ActivityReadDialog(activity);
    } else if (activity.calendarStatus === 'draft') {
      this.ActivityCheckDialog(activity);
    }
  }

  private ActivityReadDialog(activity: Activity) {
    const dialogRef = this.dialog.open(ActivityReadDialogComponent, {
      width: '400px',
      maxHeight: '600px',
      data: activity,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Published Dialog 關閉，結果:', result);
    });
  }

  private ActivityCheckDialog(activity: Activity) {
    const dialogRef = this.dialog.open(ActivityCheckDialogComponent, {
      width: '400px',
      maxHeight: '600px',
      data: { ...activity },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let updatedActivity = result.data;
        const newPhotoFile: File | null = result.photoFile;
        const mainIndex = this.activities.findIndex(act => act.calendarId === updatedActivity.calendarId);

        if (mainIndex > -1) {

          if (newPhotoFile) {
            // 模擬 Public 路徑儲存
            updatedActivity.calendarPhoto = `calendar/images/${newPhotoFile.name}`;
          }

          if (updatedActivity.calendarStartDate && typeof updatedActivity.calendarStartDate === 'string') {
            updatedActivity.calendarStartDate = new Date(updatedActivity.calendarStartDate);
          }
          if (updatedActivity.calendarEndDate && typeof updatedActivity.calendarEndDate === 'string') {
            updatedActivity.calendarEndDate = new Date(updatedActivity.calendarEndDate);
          }

          this.activities[mainIndex] = updatedActivity;

          this.activities = [...this.activities];

          this.generateCalendar(this.currentMonth);
          if (this.selectedDay) {
            this.selectedDayActivities = this.getDayActivities(this.selectedDay);
          }

          if (result.action === 'published') {
            console.log(`活動 ${updatedActivity.calendarTitle} 已發布，呼叫發布 API...`);
          } else if (result.action === 'saveDraft') {
            console.log(`活動 ${updatedActivity.calendarTitle} 已暫存，呼叫暫存 API...`);
          }

        } else {
          console.error(`找不到 ID 為 ${updatedActivity.calendarId} 的活動來更新。`);
        }

      }
    });
  }

  private resetForm(): void {
    this.calendarTitle = '';
    this.calendarDescription = '';
    this.selectedPhotoFile = null;
    this.photoUrl = null;
    this.calendarStartDate = new Date().toISOString().split('T')[0];
    this.calendarEndDate = this.calendarStartDate;
  }

}

export interface Activity {
  calendarId: number;
  calendarTitle: string;
  calendarDescription: string;
  calendarStartDate: Date;
  calendarEndDate: Date;
  calendarStatus: 'published' | 'draft';
  calendarPhoto: string | null;
}

export interface CreateActivity {
  calendarTitle: string;
  calendarDescription: string;
  calendarStartDate: string;
  calendarEndDate: string;
  calendarPhoto?: string | null;
}

