import { categoryDto, productList, productListRes } from './../@interface/interface';
import { Injectable } from '@angular/core';
import { reservation, scheduleItem, tables } from '../@interface/interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  reservation: reservation[] = [];
  allCategoryDto: categoryDto[] = [];
  productList: productList[] = [];
  productListRes!: productListRes;


    // 每天所有預約的 scheduleItem 列表
  dailyReservations: Map<string, scheduleItem[]> = new Map();

  // 用 Map 保存每個日期的桌位狀態，讓不同日期可以有獨立的桌位設定
  tableAvailableByDate: Map<string, tables[]> = new Map();

  // 觀察菜單分類
  private category$ = new BehaviorSubject<categoryDto[]>([]);
  _catagory$ = this.category$.asObservable();



}
