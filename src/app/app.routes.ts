import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { TableComponent } from './table/table.component';
import { MealStatusComponent } from './meal-status/meal-status.component';

export const routes: Routes = [
  {path:'tabs',component:TabsComponent},
  {path:'table',component:TableComponent},
  {path:'meal/status',component:MealStatusComponent},
];
