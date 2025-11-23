import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { ReservationComponent } from './reservation/reservation.component';

export const routes: Routes = [
  { path: 'tabs', component: TabsComponent },
  { path: 'reservation', component: ReservationComponent }
];
