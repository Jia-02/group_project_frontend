import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CalendarService, Activity } from '../@service/calendar.service';

@Component({
  selector: 'app-board',
  imports: [
    DatePipe
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  constructor(private calendarService: CalendarService) { }

  ongoingAndUpcoming: Activity[] = [];

  ngOnInit(): void {
    this.ongoingAndUpcoming = this.calendarService.getOngoingAndUpcoming();
  }


}
