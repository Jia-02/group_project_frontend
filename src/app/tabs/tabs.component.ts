import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';
import { BasicRes, DataService, Option, Order, OrderDetail, OrderProductList, WorkTable, WorkTableListRes } from '../data/data.service';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-tabs',
  imports: [MatTabsModule, MatButtonModule, RouterLink, RouterOutlet, MatIcon],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {

  readonly dialog = inject(MatDialog);


  constructor(private service: DataService) { }

  links!: WorkTable[];
  count!: number;
  orderList!: Order[];

  orderProductList!: OrderProductList[];
  orderProductList1!: OrderProductList[];

  orderProductDetail!: OrderDetail[];
  orderProductDetail1!: OrderDetail[];
  orderProductDetail2!: OrderDetail[];

  orderProductOption!: Option[];
  orderProductOption1!: Option[];
  orderProductOption2!: Option[];
  orderProductOption3!: Option[];

  status1!: string[];
  status2!: string[];


  addLink(event: MouseEvent) {

    event.preventDefault();  // 阻止切換
    event.stopPropagation(); // 阻止 mat-tab-group 處理事件

    const dialgoRef = this.dialog.open(DialogComponent, {
      data: { mod: "新增" },
      width: 'auto',
      height: 'auto'
    });

    dialgoRef.afterClosed().subscribe((res: any) => {
      if (res && res.name) {
        let url = "http://localhost:8080/workstation/add?workStationName=" + res.name
        let data
        this.service.postApi(url, data).subscribe((res: BasicRes) => {
          if (res.code == 200) {
            url = "http://localhost:8080/workstation/list"
            this.service.getApi(url).subscribe((res: WorkTableListRes) => {
              this.links = res.workStationList;
            })
          }
        })
      }
    })
  }

  removeLink(id: number) {

    const dialgoRef = this.dialog.open(DialogComponent, {
      data: { mod: "刪除" },
      width: 'auto',
      height: 'auto'
    });

    dialgoRef.afterClosed().subscribe((res: any) => {
      if (res && res.flag) {
        let url = "http://localhost:8080/workstation/delete?workStationId=" + id
        let data
        this.service.postApi(url, data).subscribe((res: BasicRes) => {
          if (res.code == 200) {
            url = "http://localhost:8080/workstation/list"
            this.service.getApi(url).subscribe((res: WorkTableListRes) => {
              this.links = res.workStationList;
            })
          }
        })
      }
    })

  }

  ngOnInit(): void {
    let url = "http://localhost:8080/workstation/list"
    this.service.getApi(url).subscribe((res: WorkTableListRes) => {
      this.links = res.workStationList;
    })

    this.count = 0;

    this.orderProductOption = [{ id: 1, option: "加蛋", addprice: 10 }, { id: 2, option: "不要洋蔥", addprice: 0 }]
    this.orderProductOption1 = [{ id: 1, option: "加大", addprice: 10 }, { id: 2, option: "番茄醬", addprice: 0 }]
    this.orderProductOption2 = [{ id: 1, option: "加大", addprice: 10 }, { id: 2, option: "少冰", addprice: 0 }]

    this.orderProductOption3 = [{ id: 1, option: "加大", addprice: 10 }, { id: 2, option: "加辣", addprice: 0 }]

    this.orderProductDetail = [{
      categoryId: 3, productId: 5, productionStatus: "準備中",
      productName: "起司牛肉漢堡", productPrice: 100, detailList: this.orderProductOption
    },
    {
      categoryId: 2, productId: 8, productionStatus: "待送餐",
      productName: "薯條", productPrice: 30, detailList: this.orderProductOption1
    },
    {
      categoryId: 1, productId: 3, productionStatus: "已送達",
      productName: "可樂", productPrice: 30, detailList: this.orderProductOption2
    }]

    this.orderProductDetail1 = [{
      categoryId: 6, productId: 9, productionStatus: "待送餐",
      productName: "炒麵", productPrice: 100, detailList: this.orderProductOption3
    }]

    this.orderProductDetail2 = [{
      categoryId: 6, productId: 9, productionStatus: "待送餐",
      productName: "炒麵", productPrice: 100, detailList: this.orderProductOption3
    }]

    this.orderProductList = [{ orderDetailsId: 1, orderDetailsPrice: 180, settingId: 3, orderDetail: this.orderProductDetail },
    { orderDetailsId: 2, orderDetailsPrice: 110, settingId: -1, orderDetail: this.orderProductDetail1 }]

    this.orderProductList1 = [{ orderDetailsId: 1, orderDetailsPrice: 110, settingId: -1, orderDetail: this.orderProductDetail2 }]
    this.status1 = [];
    this.status2 = [];

    for (let i = 0; i < this.orderProductDetail.length; i++) {
      if (!this.status1.includes(this.orderProductDetail[i].productionStatus)) {
        this.status1.push(this.orderProductDetail[i].productionStatus);
      }
    }
    for (let i = 0; i < this.orderProductDetail2.length; i++) {
      if (!this.status2.includes(this.orderProductDetail2[i].productionStatus)) {
        this.status2.push(this.orderProductDetail2[i].productionStatus);
      }
    }


    this.orderList = [{ orderId: "2511160326A01", orderProductList: this.orderProductList, tableId: "A01", price: 290, status: this.status1 },
    { orderId: "2511160326T01", orderProductList: this.orderProductList1, tableId: "", price: 100, status: this.status2 }
    ];
    console.log(this.orderList)

    for (const order of this.orderList) {
      for (const product of order.orderProductList) {
        for (const detail of product.orderDetail) {
          if (detail.productionStatus == "待送餐") {
            this.count++;
          }
        }
      }
    }


  }







}
