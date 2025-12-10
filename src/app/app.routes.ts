import { Routes } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { TableComponent } from './table/table.component';
import { OrderPageComponent } from './order-page/order-page.component';
import { TestPageComponent } from './test-page/test-page.component';
import { InnerStartPageComponent } from './inner-start-page/inner-start-page.component';
import { NonInnerStartPageComponent } from './non-inner-start-page/non-inner-start-page.component';
import { CustomerInformationComponent } from './customer-information/customer-information.component';
import { MenuComponent } from './menu/menu.component';


export const routes: Routes = [
  {path:'tabs',component:TabsComponent},
  {path:'table',component:TableComponent},
  { path: 'order-page', component: OrderPageComponent},
  { path: 'test-page', component: TestPageComponent},
  { path: 'inner-start-page', component: InnerStartPageComponent},
  { path: 'non-inner-start-page', component: NonInnerStartPageComponent},
  { path: 'customer-information', component: CustomerInformationComponent},
  { path: 'menu', component:MenuComponent}
];
