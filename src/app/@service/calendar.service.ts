import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  activities: Activity[] = [
    { id: 1, title: '部門會議', description: '會議', startDate: new Date('2025-11-17'), endDate: new Date('2025-11-17'), status: 'published' },
    { id: 2, title: '客戶拜訪', description: '拜訪', startDate: new Date('2025-11-20'), endDate: new Date('2025-11-20'), status: 'published' },
    { id: 3, title: '晚餐聚會', description: '聚會', startDate: new Date('2025-11-20'), endDate: new Date('2025-11-20'), status: 'draft' },
    { id: 4, title: '巴黎旅遊', description: '旅遊', startDate: new Date('2025-11-10'), endDate: new Date('2025-11-15'), status: 'draft' },
    { id: 5, title: '專案 Sprint', description: 'Sprint', startDate: new Date('2025-11-18'), endDate: new Date('2025-11-25'), status: 'published' }
  ];

  /** 取得所有活動 */
  getActivities(): Activity[] {
    return this.activities;
  }

  /** 取得進行中 + 即將開始的活動 */
  getOngoingAndUpcoming(): Activity[] {
    const today = new Date();

    return this.activities.filter(a =>
      a.status === 'published' &&
      (
        (a.startDate <= today && a.endDate >= today) ||  // 進行中
        (a.startDate > today)                            // 即將開始
      )
    );
  }
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'published' | 'draft';
}
