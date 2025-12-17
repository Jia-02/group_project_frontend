import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    private orderService: OrderService,
    private route: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tableId = params['tableId'];
      console.log(this.tableId);
    });
  }

  startDineInOrder() {
    this.orderService.currentOrder.ordersType = 'A';
    this.orderService.currentOrder.tableId = this.tableId;

    this.enterMenu();
  }

  enterMenu() {
    console.log(this.orderService.currentOrder);
    this.router.navigate(['/menu']);
  }
}
