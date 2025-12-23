import { Component } from '@angular/core';
import { Order, DataService, OrdersTodayRes, UpdateOrderReq, OrderDetailList, OrderDetail, Option } from '../@service/data.service';


@Component({
  selector: 'app-meal-status',
  imports: [],
  templateUrl: './meal-status.component.html',
  styleUrl: './meal-status.component.scss'
})
export class MealStatusComponent {


  constructor(private service: DataService) { }

  count: number = 0;
  orders!: Order[];
  timerId!: any;

  ngOnInit(): void {
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
        this.count = 0;
        for (const order of res.orders) {
          let status: string[] = [];
          let workstaionId: number[] = [];
          if (order.ordersType == "A") {
            for (const product of order.orderDetailsList) {
              let settingStatus: string[] = [];
              for (const detail of product.orderDetails) {
                let optionId = 1;
                if (!workstaionId.includes(detail.workStationId)) {
                  workstaionId.push(detail.workStationId);
                }
                if (!status.includes(detail.mealStatus)) {
                  status.push(detail.mealStatus);
                }
                if (!settingStatus.includes(detail.mealStatus)) {
                  settingStatus.push(detail.mealStatus);
                }
                if (detail.mealStatus == "待送餐"  || detail.mealStatus == "餐點已完成") {
                  this.count++;
                }
                for (const option of detail.detailList) {
                  option.id = optionId;
                  optionId++;
                }
              }
              product.status = settingStatus;
            }
          } else {
            for (const product of order.orderDetailsList) {
              let settingStatus: string[] = [];
              for (const detail of product.orderDetails) {
                let optionId = 1;
                if (!workstaionId.includes(detail.workStationId)) {
                  workstaionId.push(detail.workStationId);
                }
                if (!status.includes(detail.mealStatus)) {
                  status.push(detail.mealStatus);
                }
                if (!settingStatus.includes(detail.mealStatus)) {
                  settingStatus.push(detail.mealStatus);
                }
                for (const option of detail.detailList) {
                  option.id = optionId;
                  optionId++;
                }
              }
              product.status = settingStatus;
            }
            if (!status.includes("製作中") && !status.includes("已送達")) {
              this.count++;
            }
          }
          this.orders.push({
            orderId: order.ordersId, orderType: order.ordersType, orderCode: order.ordersCode, tableId: order.tableId, orderTime: order.ordersTime,
            price: order.totalPrice, status: status, workStationId: workstaionId, orderProductList: order.orderDetailsList, paid: order.paid
          })
        }
      }
      console.log(this.orders)
    })
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
          this.count = 0;
          for (const order of res.orders) {
            let status: string[] = [];
            let workstaionId: number[] = [];
            if (order.ordersType == "A") {
              for (const product of order.orderDetailsList) {
                let settingStatus: string[] = [];
                for (const detail of product.orderDetails) {
                  let optionId = 1;
                  if (!workstaionId.includes(detail.workStationId)) {
                    workstaionId.push(detail.workStationId);
                  }
                  if (!status.includes(detail.mealStatus)) {
                    status.push(detail.mealStatus);
                  }
                  if (!settingStatus.includes(detail.mealStatus)) {
                    settingStatus.push(detail.mealStatus);
                  }
                  if (detail.mealStatus == "待送餐" || detail.mealStatus == "餐點已完成") {
                    this.count++;
                  }
                  for (const option of detail.detailList) {
                    option.id = optionId;
                    optionId++;
                  }
                }
                product.status = settingStatus;
              }
            } else {
              for (const product of order.orderDetailsList) {
                let settingStatus: string[] = [];
                for (const detail of product.orderDetails) {
                  let optionId = 1;
                  if (!workstaionId.includes(detail.workStationId)) {
                    workstaionId.push(detail.workStationId);
                  }
                  if (!status.includes(detail.mealStatus)) {
                    status.push(detail.mealStatus);
                  }
                  if (!settingStatus.includes(detail.mealStatus)) {
                    settingStatus.push(detail.mealStatus);
                  }
                  for (const option of detail.detailList) {
                    option.id = optionId;
                    optionId++;
                  }
                }
                product.status = settingStatus;
              }
              if (!status.includes("製作中") && !status.includes("已送達")) {
                this.count++;
              }
            }
            this.orders.push({
              orderId: order.ordersId, orderType: order.ordersType, orderCode: order.ordersCode, tableId: order.tableId, orderTime: order.ordersTime,
              price: order.totalPrice, status: status, workStationId: workstaionId, orderProductList: order.orderDetailsList, paid: order.paid
            })
          }
        }
        console.log(this.orders)
      })
    }, 1000)


  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }



  delivery(id: number, inner: boolean, detailId?: number, productId?: number) {
    let updateOrderReq!: UpdateOrderReq;
    let productList!: OrderDetailList[];
    let orderDetail!: OrderDetail[];
    let options!: Option[];
    if (inner) {
      for (const order of this.orders) {
        if (order.orderId == id) {
          productList = [];
          for (const product of order.orderProductList) {
            orderDetail = [];
            for (const detail of product.orderDetails) {
              options = [];
              if (detail.productId == productId && product.orderDetailsId == detailId) {
                if (order.orderType == "D") {
                  detail.mealStatus = "餐點已送出";
                } else {
                  detail.mealStatus = "已送達";
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
    } else {
      for (const order of this.orders) {
        if (order.orderId == id) {
          productList = [];
          for (const product of order.orderProductList) {
            orderDetail = [];
            for (const detail of product.orderDetails) {
              options = [];
              if (order.orderType == "D") {
                detail.mealStatus = "餐點已送出";
              } else {
                detail.mealStatus = "已送達";
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
    }

    updateOrderReq = { ordersId: id, orderDetails: productList }
    console.log(updateOrderReq)

    let url = "orders/update/ispaid"
    this.service.postApi(url, updateOrderReq).subscribe((res: any) => {
      if (res.code == 200) {
        let today = new Date();
        let year = today.getFullYear();
        let month = String(today.getMonth() + 1).padStart(2, '0');
        let day = String(today.getDate()).padStart(2, '0');
        let todayStr = year + "-" + month + "-" + day
        url = "orders/meal/list?ordersDate=" + todayStr
        this.service.getApi(url).subscribe((res: OrdersTodayRes) => {
          console.log(res)
          this.orders = [];
          this.count = 0;
          for (const order of res.orders) {
            let status: string[] = [];
            let workstaionId: number[] = [];
            for (const product of order.orderDetailsList) {
              let settingStatus: string[] = []
              for (const detail of product.orderDetails) {
                let optionId = 1;
                if (detail.mealStatus == "製作中" && !workstaionId.includes(detail.workStationId)) {
                  workstaionId.push(detail.workStationId);
                }
                if (!status.includes(detail.mealStatus)) {
                  status.push(detail.mealStatus);
                }
                if (!settingStatus.includes(detail.mealStatus)) {
                  settingStatus.push(detail.mealStatus)
                }
                if (detail.mealStatus == "待送餐"  || detail.mealStatus == "餐點已完成") {
                  this.count++;
                }
                for (const option of detail.detailList) {
                  option.id = optionId;
                  optionId++;
                }
              }
              product.status = settingStatus;
            }
            this.orders.push({
              orderId: order.ordersId, orderType: order.ordersType, orderCode: order.ordersCode, tableId: order.tableId, orderTime: order.ordersTime,
              price: order.totalPrice, status: status, workStationId: workstaionId, orderProductList: order.orderDetailsList, paid: order.paid
            })
          }
          console.log(this.orders)
        })
      }
    })
  }

}





// {
//   "ordersType": "D",
//   "ordersDate":"2025-12-10",
//   "ordersTime":"16:00:00",
//   "totalPrice": 440,
//   "paymentType": "現金",
//   "paid": false,
//   "ordersCode": null,
//   "customerName":"測試",
//   "customerPhone":"0912345678",
//   "customerAddress":"高雄市",
//   "tableId": null,
//   "orderDetailsList": [
//     {
//       "orderDetailsId": 1,
//       "orderDetailsPrice": 210,
//       "settingId": 0,
//       "orderDetails": [
//         {
//           "categoryId": 1,
//           "productId": 1,
//           "productName": "牛肉漢堡",
//           "productPrice": 180,
//           "mealStatus": "製作中",
//           "detailList": [
//             {
//               "option": "起司蛋",
//               "addPrice": 10
//             },
//             {
//               "option": "一層肉",
//               "addPrice": 20
//             }
//           ]
//         }
//       ]
//     },
//     {
//       "orderDetailsId": 2,
//       "orderDetailsPrice": 230,
//       "settingId": 1,
//       "orderDetails": [
//         {
//           "categoryId": 1,
//           "productId": 2,
//           "productName": "豬肉漢堡",
//           "productPrice": 150,
//           "mealStatus": "製作中",
//           "detailList": [
//             {
//               "option": "起司蛋",
//               "addPrice": 10
//             },
//             {
//               "option": "一層肉",
//               "addPrice": 20
//             }
//           ]
//         },
//         {
//           "categoryId": 2,
//           "productId": 1,
//           "productName": "氣泡水",
//           "productPrice": 50,
//           "mealStatus": "製作中",
//           "detailList": [
//             {
//               "option": "無糖",
//               "addPrice": 0
//             },
//             {
//               "option": "去冰",
//               "addPrice": 0
//             }
//           ]
//         }
//       ]
//     }
//   ]
// }
