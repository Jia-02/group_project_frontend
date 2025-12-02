import { Component } from '@angular/core';

@Component({
  selector: 'app-meal-status',
  imports: [],
  templateUrl: './meal-status.component.html',
  styleUrl: './meal-status.component.scss'
})
export class MealStatusComponent {

  count!:number;
  optionCount!:number;

  orderMealList!: OrderMealList[];
  optionsNote!: optionNote[];
  reg = /[A-Z]/;

  detailList1!: option[];
  detailList2!: option[];
  detailList3!: option[];

  ngOnInit(): void {

    this.count = 0;
    this.optionCount = 1;
    this.orderMealList = [];
    this.detailList1 = [{ option: "加蛋", addprice: 10 }, { option: "不要洋蔥", addprice: 0 }];
    this.detailList2 = [{ option: "加大", addprice: 10 }, { option: "番茄醬", addprice: 0 }];
    this.detailList3 = [{ option: "加大", addprice: 10 }, { option: "去冰", addprice: 0 }];

    this.optionsNote =
      [{categoryId:3, productId: 1, productName: "起司牛肉漢堡",productPrice:170, detailList: this.detailList1 },
      {categoryId:4, productId: 2, productName: "薯條",productPrice:30, detailList: this.detailList2 },
      {categoryId:5, productId: 3, productName: "可樂",productPrice:30, detailList: this.detailList3 }]

    for(const option of this.detailList1){
      option.id = this.optionCount++;
      console.log(option.id)
    }
    this.optionCount = 1;
    for(const option of this.detailList2){
      option.id = this.optionCount++;
      console.log(option.id)
    }
    this.optionCount = 1;
    for(const option of this.detailList3){
      option.id = this.optionCount++;
      console.log(option.id)
    }


    this.orderMealList.push({ orderDetailsId: 1, optionsDetail: this.optionsNote,
       orderDetailsPrice:100,innerId:"2511160326A01",settingId:3,orderStatus:"準備中"})

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

    console.log(this.orderMealList)

  }

}

interface OrderMealList {
  orderDetailsId: number;
  optionsDetail: optionNote[];
  orderDetailsPrice: number;
  innerId?: string;
  takeOutId?: string;
  settingId?: number;
  orderStatus: string;
  tableId?:string;
}

interface optionNote {
  categoryId:number;
  productId: number;
  productName: string;
  productPrice:number;
  detailList: option[];
}

interface option {
  id?:number;
  option: string;
  addprice: number;
}

