import { Component, Input } from '@angular/core';
import { Activity } from '../calendar/calendar.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-board',
  imports: [
    DatePipe
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  @Input() activities: Activity[] = [];

  ongoingActivities: Activity[] = [];
  upcomingActivities: Activity[] = [];

  ngOnChanges() {
    this.filterActivities();
  }

  filterActivities() {
    const today = new Date();

    /** 📌 正在進行中的活動：today 落在 startDate ~ endDate */
    this.ongoingActivities = this.activities.filter(a =>
      a.status === 'published' &&
      today >= new Date(a.startDate) &&
      today <= new Date(a.endDate)
    );

    /** 📌 未來三天內即將開始：startDate 是 1～3 天內 */
    this.upcomingActivities = this.activities.filter(a => {
      if (a.status !== 'published') return false;

      const start = new Date(a.startDate);
      const diffDays =
        (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      return diffDays > 0 && diffDays <= 3;
    });
  }

}
