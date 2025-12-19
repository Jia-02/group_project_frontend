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
  ) { }

  ngOnInit(): void {
    this.ordersType = this.route.snapshot.queryParamMap.get('ordersType') || '';
    this.orderService.currentOrder.ordersType = this.ordersType as 'T' | 'D';
  }

  onPhoneInput(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.customerPhone = input.value;
  }

  startNonInnerOrder() {
    if (!this.customerName || !this.customerPhone) {
      alert('請輸入顧客姓名和電話！');
      return;
    }
    // ✅ 新增：電話 7–10 碼限制
    if (this.customerPhone.length < 7 || this.customerPhone.length > 10) {
      alert('電話號碼需為 7 到 10 碼數字');
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
