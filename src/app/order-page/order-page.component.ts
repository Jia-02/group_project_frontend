import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FormsModule } from "@angular/forms";
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { OrderDialogComponent } from '../order-dialog/order-dialog.component';
import { CheckOutDialogComponent } from '../check-out-dialog/check-out-dialog.component';

import { A11yModule } from "@angular/cdk/a11y";
import { DataService } from '../@service/data.service';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-page',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    A11yModule,
    MatIconModule,
  ],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.scss'
})
export class OrderPageComponent {
  displayedColumns: string[] = ['code', 'type', 'date', 'time', 'paymentType', 'paid', 'details'];
  dataSource = new MatTableDataSource<OrderElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.checkAndReopenDialog();
  }
  ngOnInit(): void {
    this.getOrderList();
  }

  constructor(
    public dialog: MatDialog,
    public dataService: DataService,
    public router: Router,
    public route: ActivatedRoute,
  ) { }

  date!: string;
  type: string = 'all';
  paymentType: string = 'all';
  paid: string = 'all';
  private originalData: OrderElement[] = [];

  getOrderList() {
    this.dataService.getApi('orders/list')
      .subscribe((res: any) => {
        console.log(res);

        const apiData: OrderElement[] = res.ordersList.map((item: any) => {
          let typeText = '';
          let paidText = '';

          switch (item.ordersType) {
            case 'A':
              typeText = '內用';
              break;
            case 'D':
              typeText = '外送';
              break;
            case 'T':
              typeText = '外帶';
              break;
            default:
              typeText = item.ordersType;
          }

          switch (item.paid) {
            case true:
            case 'true':
              paidText = '已付';
              break;
            case false:
            case 'false':
              paidText = '未付';
              break;
          }

          return {
            id: item.ordersId,
            code: item.ordersCode,
            type: typeText,
            date: item.ordersDate,
            time: item.ordersTime,
            paymentType: item.paymentType,
            paid: paidText,
            details: ''
          };
        });

        this.originalData = apiData;
        this.dataSource.data = apiData;

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }

        this.checkAndReopenDialog();
      });
  }

  checkAndReopenDialog(): void {
    this.route.queryParams.subscribe(params => {
      const reopenOrderId = params['reopenOrderId'];

      if (reopenOrderId) {
        // 1. 移除 URL 參數，避免下次進入時再次彈出
        this.router.navigate([], {
          queryParams: { reopenOrderId: null },
          queryParamsHandling: 'merge'
        }).then(() => {
           // 2. 找到對應的訂單資料
            const targetOrder = this.dataSource.data.find(order =>
                order.id.toString() === reopenOrderId.toString()
            );

            if (targetOrder) {
                console.log(`偵測到訂單 ${reopenOrderId} 已更新，重新打開對話框...`);
                // 3. 重新打開對話框
                this.openDialog(targetOrder);
            } else {
                console.warn(`未找到 ID 為 ${reopenOrderId} 的訂單，無法重開。`);
            }
        });
      }
    });
  }

  searchOrders() {
    let filteredData = this.originalData;

    if (this.type !== 'all') {
      let targetType = '';
      switch (this.type) {
        case 'inner': targetType = '內用'; break;
        case 'takeOut': targetType = '外帶'; break;
        case 'delivery': targetType = '外送'; break;
      }

      filteredData = filteredData.filter(order => order.type === targetType);
    }

    if (this.paymentType !== 'all') {
      let targetPaymentType = '';
      switch (this.paymentType) {
        case 'cash': targetPaymentType = '現金'; break;
        case 'creditCard': targetPaymentType = '信用卡'; break;
        case 'ecPay': targetPaymentType = '電子支付'; break;
        case 'cancel': targetPaymentType = '取消'; break;
        default: targetPaymentType = this.paymentType;
      }
      filteredData = filteredData.filter(order => order.paymentType === targetPaymentType);
    }

    if (this.paid !== 'all') {
      const targetPaid = this.paid === 'true' ? '已付' : '未付';
      filteredData = filteredData.filter(order => order.paid === targetPaid);
    }

    if (this.date) {
      filteredData = filteredData.filter(order => order.date === this.date);
    }

    this.dataSource.data = filteredData;
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  reset() {
    this.type = 'all';
    this.paymentType = 'all';
    this.paid = 'all';
    this.date = '';

    this.dataSource.data = this.originalData;

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  editOrder(): void {
  }

  openDialog(element: OrderElement) {
    const id = element.id;
    const apiUrl = `orders/list/detail?ordersId=${id}`;

    this.dataService.getApi(apiUrl).subscribe((fullOrderDetails: any) => {
      console.log('取得訂單詳細資料成功:', fullOrderDetails);

      const mappedDetail: FullOrderData = {
        ordersId: fullOrderDetails.ordersId,
        ordersType: fullOrderDetails.ordersType,
        ordersDate: fullOrderDetails.ordersDate,
        ordersTime: fullOrderDetails.ordersTime,
        totalPrice: fullOrderDetails.totalPrice,
        paymentType: fullOrderDetails.paymentType,
        paid: fullOrderDetails.paid,
        ordersCode: fullOrderDetails.ordersCode,
        tableId: fullOrderDetails.tableId,
        customerName: fullOrderDetails.customerName,
        customerPhone: fullOrderDetails.customerPhone,
        customerAddress: fullOrderDetails.customerAddress,
        order_detailsList: fullOrderDetails.orderDetailsList,
      };

      const isPaid = element.paid === '已付';

      const dataToSendToDialog = {
        ...mappedDetail,
        isReadOnly: isPaid
      };

      let dialogRef;

      if (isPaid) {
        dialogRef = this.dialog.open(OrderDialogComponent, {
          width: '80%',
          height: 'auto',
          data: dataToSendToDialog,
        });
      } else {
        dialogRef = this.dialog.open(CheckOutDialogComponent, {
          width: '80%',
          height: 'auto',
          data: dataToSendToDialog,
        });
      }

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'edit') {
          console.log('收到編輯訂單請求，準備導航到菜單頁面...');

          this.router.navigate(['/menuC'], { queryParams: { orderId: mappedDetail.ordersId } });

        } else if (result === true) {
          console.log('訂單已結帳');
          this.getOrderList();
        } else if (result === 'reopen') {
          console.log('訂單已更新，重新打開 CheckOut Dialog');
          this.getOrderList();
        } else {
          console.log('對話框關閉');
        }

        if (result === 'reopen') {
          setTimeout(() => {
            this.openDialog(element);
          }, 100);
        }
      }
      );
    });
  }
}

export interface OrderElement {
  id: number;
  code: string;
  type: string;
  date: string;
  time: string;
  paymentType: string;
  paid: string;
  details: string;
}

const ELEMENT_DATA: OrderElement[] = [];

export interface DetailOption {
  option: string;
  addPrice: number;
}

export interface OrderProduct {
  workstationId: number;
  productId: number;
  productName: string;
  productPrice: number;
  mealStatus: string;
  categoryId: number;
  detailList: DetailOption[];
}

export interface OrderDetailsGroup {
  orderDetailsId: number;
  orderDetailsPrice: number;
  settingId: number;
  orderDetails: OrderProduct[];
}

export interface FullOrderData {
  ordersId: string | number;
  ordersType: string;
  ordersDate: string;
  ordersTime: string;
  totalPrice: number;
  paymentType: string;
  paid: boolean;
  ordersCode: string;
  tableId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  order_detailsList: OrderDetailsGroup[];
}

