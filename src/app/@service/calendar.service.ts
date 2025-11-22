import { Injectable } from '@angular/core';
import { Activity } from '../calendar/calendar.component';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  activities: Activity[] = []; // 假資料或 API 回傳資料

  /** 公告欄資料：已發布 + 正在進行中 + 三天內即將開始 */
  getBoardActivities(): Activity[] {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    return this.activities.filter(act => {
      if (act.status !== 'published') return false;

      const start = new Date(act.startDate);
      const end = new Date(act.endDate);

      const isOngoing = start <= today && end >= today;
      const isStartingSoon = start > today && start <= threeDaysLater;

      return isOngoing || isStartingSoon;
    });
  }

  constructor() { }
}

