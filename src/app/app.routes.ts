import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { TableComponent } from './table/table.component';
import { OrderPageComponent } from './order-page/order-page.component';
import { TestPageComponent } from './test-page/test-page.component';


export const routes: Routes = [
  {path:'tabs',component:TabsComponent},
  {path:'table',component:TableComponent},
  { path: 'order-page', component: OrderPageComponent},
  { path: 'test-page', component: TestPageComponent},
];
