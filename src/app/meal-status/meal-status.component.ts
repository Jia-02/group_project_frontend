import { Component } from '@angular/core';

@Component({
  selector: 'app-meal-status',
  imports: [],
  templateUrl: './meal-status.component.html',
  styleUrl: './meal-status.component.scss'
})
export class MealStatusComponent {

  count!:number;


  orderMealList!: OrderMealList[];
  optionsNote!: optionNote[];
  settingDetail!: orderMeal[];
  orderMeal!: orderMeal[];
  reg = /[A-Z]/;

  detailList1!: option[];
  detailList2!: option[];
  detailList3!: option[];

  ngOnInit(): void {

    this.count = 0;
    this.orderMealList = [];
    this.detailList1 = [{ option: "加蛋", addprice: 10 }, { option: "不要洋蔥", addprice: 0 }];
    this.detailList2 = [{ option: "加大", addprice: 10 }, { option: "番茄醬", addprice: 0 }];
    this.detailList3 = [{ option: "加大", addprice: 10 }, { option: "去冰", addprice: 0 }];

    this.orderMeal = [];
    this.orderMeal =
      [{ categoryId: 1, productId: 1, productName: "起司牛肉漢堡" },
      { categoryId: 2, productId: 2, productName: "薯條" },
      { categoryId: 3, productId: 3, productName: "可樂" }]

    this.optionsNote =
      [{ productId: 1, productName: "起司牛肉漢堡", detailList: this.detailList1 },
      { productId: 2, productName: "薯條", detailList: this.detailList2 },
      { productId: 3, productName: "可樂", detailList: this.detailList3 }]


    this.orderMealList.push({ orderDetailsId: 1, optionsNote: this.optionsNote,
       settingDetail:this.orderMeal,orderDetailsPrice:100,innerId:"2511160326A01",settingId:3,orderStatus:"準備中"})

    for(const order of this.orderMealList){
      if(order.innerId){
        let index = order.innerId.match(this.reg);
        console.log(order.innerId.slice(index?.index));
        order.tableId = order.innerId.slice(index?.index);
      }
      if(order.orderStatus == "待送餐"){
        this.count++;
      }
    }

  }

}

interface OrderMealList {
  orderDetailsId: number;
  optionsNote: optionNote[];
  settingDetail: orderMeal[];
  orderDetailsPrice: number;
  innerId?: string;
  takeOutId?: string;
  settingId?: number;
  orderStatus: string;
  tableId?:string;
}

interface optionNote {
  productId: number;
  productName: string;
  detailList: option[];
}

interface option {
  option: string;
  addprice: number;
}

interface orderMeal {
  categoryId: number;
  productId: number;
  productName: string;
}
