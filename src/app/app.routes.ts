import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { CalendarComponent } from './calendar/calendar.component';
import { BoardComponent } from './board/board.component';


export const routes: Routes = [
  {path:'tabs',component:TabsComponent},
  { path: 'calendar', component: CalendarComponent},
  { path: 'board', component: BoardComponent}
];
