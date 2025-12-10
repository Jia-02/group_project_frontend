import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { MenuAdminComponent } from './menu-admin/menu-admin.component';
import { ReserveComponent } from './reserve/reserve.component';

export const routes: Routes = [
  { path: 'tabs', component: TabsComponent },
  { path: 'menuAdmin', component: MenuAdminComponent},
  { path: 'reserve', component: ReserveComponent},

];
