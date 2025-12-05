import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
<<<<<<< HEAD
import { TableComponent } from './table/table.component';
import { MealStatusComponent } from './meal-status/meal-status.component';
import { MealStatusUserComponent } from './meal-status-user/meal-status-user.component';

export const routes: Routes = [
  {path:'tabs',component:TabsComponent},
  {path:'table',component:TableComponent},
  {path:'meal/status',component:MealStatusComponent},
  {path:'meal/status/user',component:MealStatusUserComponent},
=======
import { ReservationComponent } from './reservation/reservation.component';
import { MenuAdminComponent } from './menu-admin/menu-admin.component';

export const routes: Routes = [
  { path: 'tabs', component: TabsComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: 'menuAdmin', component: MenuAdminComponent}

>>>>>>> reservation
];
