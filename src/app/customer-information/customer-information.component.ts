import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-customer-information',
  imports: [FormsModule],
  templateUrl: './customer-information.component.html',
  styleUrl: './customer-information.component.scss'
})
export class CustomerInformationComponent {
  public ordersType!: string;
  public customerName: string = '';
  public customerPhone: string = '';
  public customerAddress: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.ordersType = this.route.snapshot.queryParamMap.get('ordersType') || '';
    this.orderService.currentOrder.ordersType = this.ordersType as 'T' | 'D';
  }

  startNonInnerOrder() {
    if (!this.customerName || !this.customerPhone) {
      alert('請輸入顧客姓名和電話！');
      return;
    }
    if (this.orderService.currentOrder.ordersType === 'D' && !this.customerAddress) {
      alert('外送請輸入地址！');
      return;

    }
    this.orderService.currentOrder.customerName = this.customerName;
    this.orderService.currentOrder.customerPhone = this.customerPhone;
    this.orderService.currentOrder.customerAddress = this.customerAddress;

    this.enterMenu();
  }

  enterMenu() {
    this.router.navigate(['/menu']);
  }
}
