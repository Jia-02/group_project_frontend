import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { CalendarComponent } from './calendar/calendar.component';


export const routes: Routes = [
  {path:'tabs',component:TabsComponent},
  { path: 'calendar', component: CalendarComponent}
];
