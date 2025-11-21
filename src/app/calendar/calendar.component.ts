import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-calendar',
  imports: [
    DatePipe,
    NgClass
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent {
  currentMonth: Date = new Date();

  // ★ 活動資料（正確寫法）
  activities: activity[] = [
    {
      id:1,
      title: '部門會議',
      description: '...',
      startDate: new Date('2025-11-17'),
      endDate: new Date('2025-11-17'),
    },
    {
      id:2,
      title: '客戶拜訪',
      description: '...',
      startDate: new Date('2025-11-20'),
      endDate: new Date('2025-11-20'),
    },
    {
      id:3,
      title: '晚餐聚會',
      description: '...',
      startDate: new Date('2025-11-20'),
      endDate: new Date('2025-11-20'),
    },
    {
      id:4,
      title: '巴黎旅遊',
      description: '...',
      startDate: new Date('2025-11-10'),
      endDate: new Date('2025-11-15'),
    },
    {
      id:5,
      title: '專案 Sprint',
      description: '...',
      startDate: new Date('2025-11-18'),
      endDate: new Date('2025-11-22'),
    }
  ];

  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六'];
  monthWeeks: (Date | null)[][] = [];
  selectedDay: Date | null = new Date();
  selectedDayActivities: activity[] = [];

  ngOnInit() {
    this.generateCalendar(this.currentMonth);
    this.selectedDay = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      new Date().getDate()
    );
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
    this.selectedDay = this.monthWeeks[0].find(d => d !== null) || null;
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar(this.currentMonth);
    this.selectedDay = this.monthWeeks[0].find(d => d !== null) || null;
  }

  selectDay(day: Date | null): void {
    if (day) this.selectedDay = day;
  }

  getDayActivities(day: Date): activity[] {
    if (!day) return [];
    return this.activities.filter(a =>
      day >= a.startDate && day <= a.endDate
    );
  }

  activityShow(startDate: Date, endDate: Date, currentDay: Date): string {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    if (!startDate || !endDate || !currentDay) return '';

    const dayAfterEnd = new Date(endDate.getTime() + MS_PER_DAY);
    if (currentDay >= dayAfterEnd) {
      return 'status-finished';
    }

    if (currentDay >= startDate && currentDay <= endDate) {
      return 'status-in-progress';
    }

    if (currentDay < startDate) {
      const diffDays = Math.ceil((startDate.getTime() - currentDay.getTime()) / MS_PER_DAY);

      if (diffDays <= 7) {
        return 'status-upcoming-7d';
      }

      return 'status-not-started';
    }

    return '';
  }

  addActivity(){

  }
}

interface activity{
  id: number,
  title: string,
  description: string,
  startDate: Date,
  endDate: Date
}

