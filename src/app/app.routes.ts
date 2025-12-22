import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { TableComponent } from './table/table.component';
import { MealStatusComponent } from './meal-status/meal-status.component';
import { MealStatusUserComponent } from './meal-status-user/meal-status-user.component';
import { ReserveComponent } from './reserve/reserve.component';
import { MenuAdminComponent } from './menu-admin/menu-admin.component';
import { CalendarComponent } from './allActivity/calendar/calendar.component';
import { OrderPageComponent } from './order-page/order-page.component';
import { InnerStartPageComponent } from './inner-start-page/inner-start-page.component';
import { NonInnerStartPageComponent } from './non-inner-start-page/non-inner-start-page.component';
import { CustomerInformationComponent } from './customer-information/customer-information.component';
import { MenuComponent } from './menu/menu.component';
import { MenuCComponent } from './menu-c/menu-c.component';
import { PetComponent } from './pet/pet.component';


export const routes: Routes = [
  { path: 'workstation', component: TabsComponent },
  { path: 'table', component: TableComponent },
  { path: 'meal/status', component: MealStatusComponent },
  { path: 'meal/status/user', component: MealStatusUserComponent },
  { path: 'menuAdmin', component: MenuAdminComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'reserve', component: ReserveComponent },
  { path: 'order-page', component: OrderPageComponent },
  { path: 'inner-start-page', component: InnerStartPageComponent },
  { path: 'non-inner-start-page', component: NonInnerStartPageComponent },
  { path: 'customer-information', component: CustomerInformationComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'menuC', component: MenuCComponent },
  { path: 'pet', component: PetComponent },
  { path: '**', component: ReserveComponent}
]




