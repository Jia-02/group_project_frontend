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
import { DataService } from '../data/data.service';
import { A11yModule } from "@angular/cdk/a11y";

@Component({
  selector: 'app-order-page',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    A11yModule
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
  }
  ngOnInit(): void {
    this.getOrderList();
  }

  constructor(
    public dialog: MatDialog,
    public dataService: DataService,
  ) { }

  date!: string;
  type: string = 'all';
  paymentType: string = 'all';
  paid: string = 'all';
  private originalData: OrderElement[] = [];

  getOrderList() {
    this.dataService.getApi('http://localhost:8080/orders/list')
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

  openDialog(element: OrderElement) {
    const id = element.id;
    const apiUrl = `http://localhost:8080/orders/list/detail?ordersId=${id}`;

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
          width: '500px',
          height: '900px',
          data: dataToSendToDialog,
        });
      } else {
        dialogRef = this.dialog.open(CheckOutDialogComponent, {
          width: '500px',
          height: '900px',
          data: dataToSendToDialog,
        });
      }

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          console.log('對話框回傳成功狀態，正在刷新訂單列表...');
          this.getOrderList();
        }
      });
    }
    );
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

const ELEMENT_DATA: OrderElement[] = [
  { id: 1, code: '2512081000D01', type: '外送', date: '2025-12-08', time: '10:00:00', paymentType: '電子支付', paid: '已付', details: '' },
  { id: 2, code: '2512061000T01', type: '外帶', date: '2025-12-06', time: '10:00:00', paymentType: '信用卡', paid: '已付', details: '' },
  { id: 3, code: '2512071000A01', type: '內用', date: '2025-12-07', time: '10:00:00', paymentType: '現金', paid: '未付', details: '' },
  { id: 4, code: '2512091000A03', type: '內用', date: '2025-12-09', time: '10:00:00', paymentType: '取消', paid: '未付', details: '' },
];

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

export const FULL_ORDER_DETAIL_MOCK: FullOrderData = {
  ordersId: 1001,
  ordersCode: 'A1001',
  ordersType: '內用',
  ordersDate: '2025-12-08',
  ordersTime: '10:30',
  totalPrice: 480,
  paymentType: '電子支付',
  paid: false,
  tableId: 'T05',
  customerName: '王小明',
  customerPhone: '0912345678',
  customerAddress: null,

  order_detailsList: [
    {
      orderDetailsId: 1,
      orderDetailsPrice: 180,
      settingId: 1,
      orderDetails: [
        {
          workstationId: 1,
          productId: 101,
          productName: '經典拿鐵',
          productPrice: 150,
          mealStatus: '已完成',
          detailList: [
            { option: '加一份濃縮', addPrice: 30 },
          ],
        },
      ],
    },
    {
      orderDetailsId: 2,
      orderDetailsPrice: 300,
      settingId: 1,
      orderDetails: [
        {
          workstationId: 2,
          productId: 201,
          productName: '豪華總匯三明治',
          productPrice: 250,
          mealStatus: '製作中',
          detailList: [
            { option: '醬料多一點', addPrice: 0 },
            { option: '加起司片', addPrice: 50 },
          ],
        },
      ],
    },
  ],
};
