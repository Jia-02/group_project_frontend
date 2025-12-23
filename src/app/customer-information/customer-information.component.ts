import { Component, inject } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogNoticeComponent } from '../@dialog/dialog-notice/dialog-notice.component';

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
  readonly dialog = inject(MatDialog);

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
      this.dialog.open(DialogNoticeComponent, {
        data: { noticeType: 'isRequired' }
      })
      return;
    }
    // 新增：電話 7–10 碼限制
    if (this.customerPhone.length < 7 || this.customerPhone.length > 10) {
      this.dialog.open(DialogNoticeComponent, {
        data: { noticeType: 'isRequired' }
      })
      return;
    }
    if (this.orderService.currentOrder.ordersType === 'D' && !this.customerAddress) {
      this.dialog.open(DialogNoticeComponent, {
        data: { noticeType: 'isRequired' }
      })
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
