import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-inner-start-page',
  imports: [],
  templateUrl: './inner-start-page.component.html',
  styleUrl: './inner-start-page.component.scss'
})
export class InnerStartPageComponent {
  tableId!: string;

  constructor(
    private router: Router,
    private orderService: OrderService
  ) {}

  startDineInOrder(){
    this.orderService.currentOrder.ordersType = 'A';
    this.orderService.currentOrder.tableId = this.tableId;

    this.enterMenu();
  }

  enterMenu() {
    console.log(this.orderService.currentOrder);
    this.router.navigate(['/menu']);
  }
}
