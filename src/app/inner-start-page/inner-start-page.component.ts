import { Dialog } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../order.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogNoticeComponent } from '../@dialog/dialog-notice/dialog-notice.component';

@Component({
  selector: 'app-inner-start-page',
  imports: [],
  templateUrl: './inner-start-page.component.html',
  styleUrl: './inner-start-page.component.scss'
})

export class InnerStartPageComponent {

  tableId!: string;
  readonly dialog = inject(MatDialog);

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
    if (!this.tableId) {
      this.dialog.open(DialogNoticeComponent, {
        data: { noticeType: 'qrcode' }
      });
      return;
    }
    this.orderService.currentOrder.tableId = this.tableId;

    this.enterMenu();
  }

  enterMenu() {
    console.log(this.orderService.currentOrder);
    this.router.navigate(['/menu']);
  }
}
