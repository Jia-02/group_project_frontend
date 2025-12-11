import { categoryDto, productList, productListRes } from './../@interface/interface';
import { Injectable } from '@angular/core';
import { reservation } from '../@interface/interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  // 分類列表
  allCategoryDto: categoryDto[] = [];

  // 產品列表(單點)
  productList: productList[] = [];

  // 預約資料
  reservation: reservation[] = [];

  // 套餐列表
  setList: any[] = [];

  // 客製化選項列表
  optionList: any[] = [];

  // 附餐與飲料列表
  sideDishList: productList[] = [];
  drinkDishList: productList[] = [];

  // 桌位列表
  tableIdList: any[] = [];

}
