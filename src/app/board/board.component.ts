import { Component, Input } from '@angular/core';
import { DatePipe, NgStyle } from '@angular/common';
import { Activity } from '../calendar/calendar.component';

@Component({
  selector: 'app-board',
  imports: [
    DatePipe,
    NgStyle
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  @Input() activities: Activity[] = [];

  ngOnInit(): void {
    console.log('BoardComponent: Activities received:', this.activities);
  }

  getBackgroundStyle(url: string | null): string {
    if (!url) {
      return 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
    }
    return `url('${url}')`;
  }

  getDaysUntil(startDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    const diffTime = start.getTime() - today.getTime();

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}

