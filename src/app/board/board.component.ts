import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Activity } from '../calendar/calendar.component';

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

  getDaysUntil(startDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }


}
