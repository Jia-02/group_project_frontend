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

@Component({
  selector: 'app-order-page',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.scss'
})
export class OrderPageComponent {
  displayedColumns: string[] = ['code', 'type', 'date', 'paymentType', 'paid', 'details'];
  dataSource = new MatTableDataSource<OrderElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public dialog: MatDialog,
    public dataService: DataService,
  ) { }

  date!: string;
  type: string = 'all';
  paymentType: string = 'all';
  paid: string = 'all';

  searchOrders() {
    console.log('訂單類型:', this.type);
    console.log('付款方式:', this.paymentType);
    console.log('付款狀態:', this.paid);
    console.log('日期:', this.date);

    const searchData = {
      type: this.type,
      paymentType: this.paymentType,
      paid: this.paid,
      date: this.date,
    };

    this.dataService.postApi('/api/orders/search', searchData)
    .subscribe((res: any) => {
        console.log('訂單查詢成功:', res);
      }
    );
  }

  openDialog(element: OrderElement) {
    if (element.paid) {
      this.dialog.open(OrderDialogComponent, {
        width: '500px',
        height: '700px',
        data: element,
      });
    } else {
      this.dialog.open(CheckOutDialogComponent, {
        width: '800px',
        height: '600px',
        data: element,
      });
    }
  }
}

export interface OrderElement {
  code: string;
  type: string;
  date: string;
  paymentType: string;
  paid: boolean;
  details: string;
}

const ELEMENT_DATA: OrderElement[] = [
  { code: '1', type: '內用', date: '2025-12-08', paymentType: '其他', paid: true, details: '' },
  { code: '2', type: '外帶', date: '2025-12-06', paymentType: '信用卡', paid: true, details: '' },
  { code: '3', type: '外送', date: '2025-12-07', paymentType: '現金', paid: false, details: '' },

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
  orderId: string | number;
  orderType: string;
  orderDate: string;
  orderTime: string;
  totalPrice: number;
  paymentType: string;
  paid: boolean;
  orderCode: string;
  tableId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  order_detailsList: OrderDetailsGroup[];
}
