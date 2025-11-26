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
    console.log(this.activities);

  }

  // ngOnInit(): void {
  //   if (this.activities.length === 0) {
  //     console.log('BoardComponent: Activities input is empty. Displaying placeholder data.');
  //     this.activities = [
  //       {
  //         id: 99,
  //         title: '主廚特選優惠活動！',
  //         description: '消費滿額即贈送主廚招待券一張，限時兩週，即時傳愛。',
  //         startDate: new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000)),
  //         endDate: new Date(new Date().getTime() + (17 * 24 * 60 * 60 * 1000)),
  //         status: 'published',
  //         photo: 'https://placehold.co/600x200/5070ff/ffffff?text=Activity+Background'
  //       },
  //       {
  //         id: 98,
  //         title: '巴黎之旅即將開始',
  //         description: '為期六天的浪漫之都深度遊，一起享受法式風情！',
  //         startDate: new Date(new Date().getTime() - (1 * 24 * 60 * 60 * 1000)),
  //         endDate: new Date(new Date().getTime() + (5 * 24 * 60 * 60 * 1000)),
  //         status: 'published',
  //         photo: 'https://placehold.co/600x200/ff5050/ffffff?text=Travel+Event'
  //       }
  //     ];
  //   }
  // }

  getBackgroundStyle(url: string | null): string {
    if (!url) {
      return 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)';
    }
    return `url('${url}')`;
  }

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

