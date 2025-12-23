import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';

import { MatIcon } from "@angular/material/icon";
import { DataService, WorkTable, Order, BasicRes, WorkTableListRes, OrdersTodayRes, UpdateOrderReq, OrderDetailList, Option, OrderDetail } from '../@service/data.service';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-tabs',
  imports: [MatTabsModule, MatButtonModule, RouterLink, RouterOutlet, MatIcon, MatMenuModule,],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss'
})
export class TabsComponent {

  readonly dialog = inject(MatDialog);


  constructor(private service: DataService) { }

  links!: WorkTable[];
  orders!: Order[];
  timerId!: any;

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
        let url = "workstation/add?workStationName=" + res.name
        let data
        this.service.postApi(url, data).subscribe((res: BasicRes) => {
          if (res.code == 200) {
            url = "workstation/list"
            this.service.getApi(url).subscribe((res: WorkTableListRes) => {
              this.links = res.workStationList;
            })
          } else {
            this.dialog.open(DialogComponent, {
              data: { mod: "報錯", message: res.message },
              width: 'auto',
              height: 'auto'
            });
          }
        })
      }
    })
  }

  updateLink(id: number, event: MouseEvent) {
    event.preventDefault();  // 阻止切換
    event.stopPropagation(); // 阻止 mat-tab-group 處理事件

    const dialgoRef = this.dialog.open(DialogComponent, {
      data: { mod: "更新" },
      width: 'auto',
      height: 'auto'
    });

    dialgoRef.afterClosed().subscribe((res: any) => {
      if (res && res.flag && res.name) {
        let url = "workstation/update"
        let data: WorkTable = { workStationId: id, workStationName: res.name }
        console.log(data)
        this.service.postApi(url, data).subscribe((res: BasicRes) => {
          if (res.code == 200) {
            url = "workstation/list"
            this.service.getApi(url).subscribe((res: WorkTableListRes) => {
              this.links = res.workStationList;
            })
          } else {
            this.dialog.open(DialogComponent, {
              data: { mod: "報錯", message: res.message },
              width: 'auto',
              height: 'auto'
            });
          }
        })
      }
    })

  }

  removeLink(id: number, event: MouseEvent) {

    event.preventDefault();  // 阻止切換
    event.stopPropagation(); // 阻止 mat-tab-group 處理事件
    const dialgoRef = this.dialog.open(DialogComponent, {
      data: { mod: "刪除" },
      width: 'auto',
      height: 'auto'
    });

    dialgoRef.afterClosed().subscribe((res: any) => {
      if (res && res.flag) {
        let url = "workstation/delete?workStationId=" + id
        let data
        this.service.postApi(url, data).subscribe((res: BasicRes) => {
          if (res.code == 200) {
            url = "workstation/list"
            this.service.getApi(url).subscribe((res: WorkTableListRes) => {
              this.links = res.workStationList;
            })
          } else {
            this.dialog.open(DialogComponent, {
              data: { mod: "報錯", message: res.message },
              width: 'auto',
              height: 'auto'
            });
          }
        })
      }
    })

  }

  waitDelivery(id: number, detailId: number, productId: number) {
    let updateOrderReq!: UpdateOrderReq;
    let productList!: OrderDetailList[];
    let orderDetail!: OrderDetail[];
    let options!: Option[];
    for (const order of this.orders) {
      if (order.orderId == id) {
        productList = [];
        for (const product of order.orderProductList) {
          orderDetail = [];
          for (const detail of product.orderDetails) {
            options = [];
            if (detail.productId == productId && product.orderDetailsId == detailId) {
               if (order.orderType == "D") {
                  detail.mealStatus = "餐點已完成";
                } else {detail.mealStatus = "待送餐";
                  }
            }
            for (const option of detail.detailList) {
              options.push({ option: option.option, addPrice: option.addPrice });
            }
            orderDetail.push({
              productId: detail.productId, productName: detail.productName,
              productPrice: detail.productPrice, categoryId: detail.categoryId, mealStatus: detail.mealStatus, detailList: options
            })
          }
          productList.push({ orderDetailsId: product.orderDetailsId, orderDetails: orderDetail })
        }
      }
    }
    updateOrderReq = { ordersId: id, orderDetails: productList }
    console.log(updateOrderReq)

    let url = "orders/update/ispaid"
    this.service.postApi(url, updateOrderReq).subscribe((res: any) => {
      if (res.code == 400) {
        this.dialog.open(DialogComponent, {
          data: { mod: "報錯", message: res.message },
          width: 'auto',
          height: 'auto'
        });
      }
      let today = new Date();
      let year = today.getFullYear();
      let month = String(today.getMonth() + 1).padStart(2, '0');
      let day = String(today.getDate()).padStart(2, '0');
      let todayStr = year + "-" + month + "-" + day
      url = "orders/meal/list?ordersDate=" + todayStr
      this.service.getApi(url).subscribe((res: OrdersTodayRes) => {
        console.log(res)
        if (res.code == 200) {
          this.orders = [];
          for (const order of res.orders) {
            let status: string[] = [];
            let workstaionId: number[] = [];
            for (const product of order.orderDetailsList) {
              for (const detail of product.orderDetails) {
                let optionId = 1;
                if (detail.mealStatus == "製作中" && !workstaionId.includes(detail.workStationId)) {
                  workstaionId.push(detail.workStationId);
                }
                if (!status.includes(detail.mealStatus)) {
                  status.push(detail.mealStatus);
                }
                for (const option of detail.detailList) {
                  option.id = optionId;
                  optionId++;
                }
              }
            }
            this.orders.push({
              orderId: order.ordersId, orderType:order.ordersType,  orderCode: order.ordersCode, tableId: order.tableId,orderTime:order.ordersTime,
              price: order.totalPrice, status: status, workStationId: workstaionId, orderProductList: order.orderDetailsList, paid: order.paid
            })
          }
        }
        console.log(this.orders)
      })

    })

  }

  ngOnInit(): void {
    let url = "workstation/list"
    this.service.getApi(url).subscribe((res: WorkTableListRes) => {
      this.links = res.workStationList;
      let today = new Date();
      let year = today.getFullYear();
      let month = String(today.getMonth() + 1).padStart(2, '0');
      let day = String(today.getDate()).padStart(2, '0');
      let todayStr = year + "-" + month + "-" + day

      let url = "orders/meal/list?ordersDate=" + todayStr

      this.service.getApi(url).subscribe((res: OrdersTodayRes) => {
        console.log(res)
        if (res.code == 200) {
          this.orders = [];
          for (const order of res.orders) {
            let status: string[] = [];
            let workstaionId: number[] = [];
            for (const product of order.orderDetailsList) {
              for (const detail of product.orderDetails) {
                let optionId = 1;
                if (detail.mealStatus == "製作中" && !workstaionId.includes(detail.workStationId)) {
                  workstaionId.push(detail.workStationId);
                }
                if (!status.includes(detail.mealStatus)) {
                  status.push(detail.mealStatus);
                }
                for (const option of detail.detailList) {
                  option.id = optionId;
                  optionId++;
                }
              }
            }
            this.orders.push({
              orderId: order.ordersId, orderType:order.ordersType, orderCode: order.ordersCode, tableId: order.tableId,orderTime:order.ordersTime,
              price: order.totalPrice, status: status, workStationId: workstaionId, orderProductList: order.orderDetailsList, paid: order.paid
            })
          }
        }
        console.log(this.orders)
      })
    })

    //每分鐘重新更新畫面資訊 搭配ngOnDestroy()
    this.timerId = setInterval(() => {
      let today = new Date();
      let year = today.getFullYear();
      let month = String(today.getMonth() + 1).padStart(2, '0');
      let day = String(today.getDate()).padStart(2, '0');
      let todayStr = year + "-" + month + "-" + day

      let url = "orders/meal/list?ordersDate=" + todayStr

      this.service.getApi(url).subscribe((res: OrdersTodayRes) => {
        console.log(res)
        if (res.code == 200) {
          this.orders = [];
          for (const order of res.orders) {
            let status: string[] = [];
            let workstaionId: number[] = [];
            for (const product of order.orderDetailsList) {
              for (const detail of product.orderDetails) {
                let optionId = 1;
                if (detail.mealStatus == "製作中" && !workstaionId.includes(detail.workStationId)) {
                  workstaionId.push(detail.workStationId);
                }
                if (!status.includes(detail.mealStatus)) {
                  status.push(detail.mealStatus);
                }
                for (const option of detail.detailList) {
                  option.id = optionId;
                  optionId++;
                }
              }
            }
            this.orders.push({
              orderId: order.ordersId, orderType:order.ordersType, orderCode: order.ordersCode, tableId: order.tableId,orderTime:order.ordersTime,
              price: order.totalPrice, status: status, workStationId: workstaionId, orderProductList: order.orderDetailsList, paid: order.paid
            })
          }
        }
        console.log(this.orders)
      })
    }, 1000); // 每1秒執行一次


  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }





}
