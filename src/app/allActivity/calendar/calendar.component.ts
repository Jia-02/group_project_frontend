import { DataService } from '../../@service/data.service';
import { ActivityCheckDialogComponent } from '../activity-check-dialog/activity-check-dialog.component';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivityReadDialogComponent } from '../activity-read-dialog/activity-read-dialog.component';
import { ActivityDialogComponent, DialogResult } from '../activity-dialog/activity-dialog.component';
import { ActivityCreateDialogComponent } from '../activity-create-dialog/activity-create-dialog.component';
import { BoardDialogComponent } from '../../board-dialog/board-dialog.component';

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
    const apiUrl = 'calendar/all';

    this.dataService.getApi(apiUrl).subscribe((res: any) => {
      let rawData = res.calendarList || res.activities || res;

      const activitiesToProcess: Activity[] = Array.isArray(rawData)
        ? rawData
        : (rawData ? [rawData] : []);

      const processedActivities = activitiesToProcess.map((act: any) => {

        let startDate = new Date(act.calendarStartDate);
        startDate.setHours(0, 0, 0, 0);
        let endDate = new Date(act.calendarEndDate);
        endDate.setHours(0, 0, 0, 0);

        let photoName = act.calendarPhoto;
        if (photoName && typeof photoName === 'string') {
          const parts = photoName.split('/');
          photoName = parts[parts.length - 1];
        }

        return {
          calendarId: act.calendarId,
          calendarTitle: act.calendarTitle,
          calendarDescription: act.calendarDescription,
          calendarPhoto: photoName,
          calendarStartDate: startDate,
          calendarEndDate: endDate,
          calendarStatus: act.calendarStatus ? 'published' : 'draft' as 'published' | 'draft'
        };
      });

      this.activities = processedActivities;
      this.boardActivities = this.filterBoardActivities(processedActivities);

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

      for (let d = 0; d < 7; d++) {
        if (w === 0 && d < prevMonthDaysToShow) {
          const prevMonthDay = daysInPrevMonth - prevMonthDaysToShow + d + 1;
          week.push(new Date(year, month - 1, prevMonthDay));
        }
        else if (currentDay <= daysInCurrentMonth) {
          week.push(new Date(year, month, currentDay));
          currentDay++;
        }
        else {
          week.push(new Date(year, month + 1, nextMonthDay));
          nextMonthDay++;
        }
      }
      this.monthWeeks.push(week);
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
      width: '80%',
      height: 'auto'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const { formData } = result;

      const checkRef = this.dialog.open(ActivityDialogComponent, {
        width: '80%',
        height: 'auto',
        data: formData
      });

      checkRef.afterClosed().subscribe((finalResult) => {
        if (!finalResult) return;

        let activityData = finalResult.data;

        if (activityData.calendarPhoto && typeof activityData.calendarPhoto === 'string') {
          const parts = activityData.calendarPhoto.split('/');
          activityData.calendarPhoto = parts[parts.length - 1];
        }

        const newActivity: Activity = {
          ...activityData,
          calendarId: activityData.calendarId,
          calendarStartDate: new Date(activityData.calendarStartDate),
          calendarEndDate: new Date(activityData.calendarEndDate),
          calendarTitle: activityData.calendarTitle,
          calendarDescription: activityData.calendarDescription,
          calendarPhoto: activityData.calendarPhoto,
          calendarStatus: 'draft'
        };

        this.activities.push(newActivity);
        this.activities = [...this.activities];
        this.loadActivities();

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
      this.photoUrl = this.selectedPhotoFile.name;
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
      width: '80%',
      height: 'auto',
      data: activity,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Published Dialog 關閉，結果:', result);
    });
  }

  private ActivityCheckDialog(activity: Activity) {
    const dialogRef = this.dialog.open(ActivityCheckDialogComponent, {
      width: '80%',
      height: 'auto',
      data: { ...activity },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      if (result.action === 'delete') {
        this.activities = this.activities.filter(act => act.calendarId !== result.calendarId);

        console.log(`活動 ID ${result.calendarId} 已刪除，列表已更新。`);

      } else if (result.action === 'publish' || result.action === 'saveDraft') {

        const updatedData = result.data;

        const mainIndex = this.activities.findIndex(act => act.calendarId === updatedData.calendarId);

        if (mainIndex > -1) {
          const newStartDate = new Date(updatedData.calendarStartDate);
          const newEndDate = new Date(updatedData.calendarEndDate);

          const newActivity: Activity = {
            ...this.activities[mainIndex],
            ...updatedData,
            calendarStartDate: newStartDate,
            calendarEndDate: newEndDate,
            calendarPhoto: result.photoFile ? result.photoFile.name : (updatedData.calendarPhoto || null),
            calendarStatus: updatedData.calendarStatus === true || updatedData.calendarStatus === 'published' ? 'published' : 'draft',
          };

          this.activities[mainIndex] = newActivity;

          console.log(`活動 ${newActivity.calendarTitle} 已更新，日曆準備刷新。`);
        }
      }

      this.activities = [...this.activities];

      this.boardActivities = this.filterBoardActivities(this.activities);

      this.generateCalendar(this.currentMonth);

      if (this.selectedDay) {
        this.selectedDayActivities = this.getDayActivities(this.selectedDay);
      }
    });
  }

  openBoardDialog(): void {
    const apiUrl = 'calendar/selectDate';

    this.dataService.getApi(apiUrl)
      .subscribe((res: any) => {
        let rawActivities: any[] = [];
        if (Array.isArray(res)) {
          rawActivities = res;
        } else if (res && (res.activities || res.calendarList)) {
          rawActivities = res.activities || res.calendarList;
        }

        if (!Array.isArray(rawActivities)) {
          console.error('API 返回的數據結構不符合預期，無法提取活動列表。');
          rawActivities = [];
        }

        const processedActivities: Activity[] = rawActivities.map((act: any) => {
          return {
            ...act,
            calendarStartDate: new Date(act.calendarStartDate),
            calendarEndDate: new Date(act.calendarEndDate)
          };
        });

        const hasActivities = processedActivities.length > 0;

        if (hasActivities) {
          console.log(`活動資料載入成功: 共 ${processedActivities.length} 筆`);
        } else {
          console.log('API 呼叫完成，但目前沒有公告活動。');
        }

        this.dialog.open(BoardDialogComponent, {
          data: { activities: processedActivities },
          width: '80%',
          height: 'auto',
          panelClass: 'full-screen-dialog'
        });
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


