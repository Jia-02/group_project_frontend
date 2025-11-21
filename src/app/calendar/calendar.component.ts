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
  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六'];
  monthWeeks: (Date | null)[][] = [];
  selectedDay: Date | null = new Date();
  selectedDayActivities: any[] = [];

  ngOnInit() {
    this.generateCalendar(this.currentMonth);
    this.selectedDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), new Date().getDate());
    this.loadActivities(this.selectedDay!);
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
    if (this.selectedDay) this.loadActivities(this.selectedDay);
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar(this.currentMonth);
    this.selectedDay = this.monthWeeks[0].find(d => d !== null) || null;
    if (this.selectedDay) this.loadActivities(this.selectedDay);
  }

  loadActivities(date: Date): void {
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    this.selectedDayActivities = this.mockActivities[dateKey] || [];
  }

  mockActivities: { [key: string]: { time: string, title: string }[] } = {
    '2025-11-17': [{ time: '10:00', title: '部門會議' }],
    '2025-11-20': [{ time: '14:30', title: '客戶拜訪' }, { time: '18:00', title: '晚餐聚會' }],
    // 串api會改的地方
  }

  hasActivity(date: Date | null): boolean {
    if (!date) return false;
    const dateKey = this.formatDateToKey(date);
    return !!this.mockActivities[dateKey];
  }

  formatDateToKey(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectDay(day: Date | null): void {
    if (day) {
      this.selectedDay = day;
      this.loadActivities(day);
    }
  }
}
