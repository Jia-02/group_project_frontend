import { Component } from '@angular/core';
import { DataService, Order, OrderProductList, OrderDetail, Option } from '../@service/data.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-meal-status-user',
  imports: [FormsModule],
  templateUrl: './meal-status-user.component.html',
  styleUrl: './meal-status-user.component.scss'
})
export class MealStatusUserComponent {

  constructor(private service:DataService){}

  mealStatus!:MealStatus;

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
  phone!:string;
  mealStatusArray!:MealStatus[];

  status1!: string[];
  status2!: string[];
  workStationId1!: number[];
  workStationId2!: number[];

  ngOnInit(): void {


    this.orderProductOption = [{ id: 1, option: "加蛋", addprice: 10 }, { id: 2, option: "不要洋蔥", addprice: 0 }]
    this.orderProductOption1 = [{ id: 1, option: "加大", addprice: 10 }, { id: 2, option: "番茄醬", addprice: 0 }]
    this.orderProductOption2 = [{ id: 1, option: "加大", addprice: 10 }, { id: 2, option: "少冰", addprice: 0 }]

    this.orderProductOption3 = [{ id: 1, option: "加大", addprice: 10 }, { id: 2, option: "加辣", addprice: 0 }]

    this.orderProductDetail = [{
      workStationId: 3, productId: 5, productionStatus: "準備中",
      productName: "起司牛肉漢堡", productPrice: 100, detailList: this.orderProductOption
    },
    {
      workStationId: 2, productId: 8, productionStatus: "待送餐",
      productName: "薯條", productPrice: 30, detailList: this.orderProductOption1
    },
    {
      workStationId: 1, productId: 3, productionStatus: "已送達",
      productName: "可樂", productPrice: 30, detailList: this.orderProductOption2
    }]

    this.orderProductDetail1 = [{
      workStationId: 6, productId: 9, productionStatus: "待送餐",
      productName: "炒麵", productPrice: 100, detailList: this.orderProductOption3
    }]

    this.orderProductDetail2 = [{
      workStationId: 6, productId: 9, productionStatus: "待送餐",
      productName: "炒麵", productPrice: 100, detailList: this.orderProductOption3
    }]

    this.orderProductList = [{ orderDetailsId: 1, orderDetailsPrice: 180, settingId: 3, orderDetail: this.orderProductDetail },
    { orderDetailsId: 2, orderDetailsPrice: 110, settingId: -1, orderDetail: this.orderProductDetail1 }]

    this.orderProductList1 = [{ orderDetailsId: 1, orderDetailsPrice: 110, settingId: -1, orderDetail: this.orderProductDetail2 }]
    this.status1 = [];
    this.status2 = [];
    this.workStationId1 = [];
    this.workStationId2 = [];

    for (let i = 0; i < this.orderProductList.length; i++) {
      for (let j = 0; j < this.orderProductList[i].orderDetail.length; j++) {
        if (!this.status1.includes(this.orderProductList[i].orderDetail[j].productionStatus)) {
          this.status1.push(this.orderProductList[i].orderDetail[j].productionStatus);
        }
        if (!this.workStationId1.includes(this.orderProductList[i].orderDetail[j].workStationId)) {
          this.workStationId1.push(this.orderProductList[i].orderDetail[j].workStationId)
        }
      }
    }

    for (let i = 0; i < this.orderProductList1.length; i++) {
      for (let j = 0; j < this.orderProductList1[i].orderDetail.length; j++) {
        if (!this.status2.includes(this.orderProductList1[i].orderDetail[j].productionStatus)) {
          this.status2.push(this.orderProductList1[i].orderDetail[j].productionStatus);
        }
        if (!this.workStationId2.includes(this.orderProductList1[i].orderDetail[j].workStationId)) {
          this.workStationId2.push(this.orderProductList1[i].orderDetail[j].workStationId)
        }
      }
    }


    this.orderList = [{ orderId: "2511160326A01", orderProductList: this.orderProductList, tableId: "A01", price: 290, status: this.status1,workStationId:this.workStationId1 },
    { orderId: "2511160326T01", orderProductList: this.orderProductList1, tableId: "", price: 100, status: this.status2,workStationId:this.workStationId2 }
    ];
    console.log(this.orderList)

    this.mealStatus = {orderId:"2511160326A01",orderTime:"2025-12-04 16:00", phone:"0912345678",
      estimatedTime:"2025-12-04 16:30",mealStatus:"製作中",paymentType:"現金",paid:"尚未付款",orderDetail:this.orderProductList}

  }

  searchOrder(){
    this.mealStatusArray = [];
    if(this.phone == this.mealStatus.phone){
      this.mealStatusArray.push(this.mealStatus)
    }
  }


}


interface MealStatus{
  orderId:string; //訂單 id
  orderTime:string; //訂單產生時間 2025-12-04 16:00
  estimatedTime:string; //訂單預計完成時間 2025-12-04 16:30
  phone:string;
  mealStatus:string; // 製作中 待送餐 已取餐 外送中
  paymentType:string; // 現金
  paid:string; // 已付款 尚未付款
  orderDetail:OrderProductList[]; //訂單明細
}
