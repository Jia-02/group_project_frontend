import { categoryDto } from './../@interface/interface';
import { Injectable } from '@angular/core';
import { reservation, scheduleItem, tables } from '../@interface/interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  reservation: reservation[] = [];

    // 每天所有預約的 scheduleItem 列表
  dailyReservations: Map<string, scheduleItem[]> = new Map();

  // 用 Map 保存每個日期的桌位狀態，讓不同日期可以有獨立的桌位設定
  tableAvailableByDate: Map<string, tables[]> = new Map();

  // 觀察菜單分類
  private category$ = new BehaviorSubject<categoryDto[]>([]);
  _catagory$ = this.category$.asObservable();

  // 更新菜單分類
  updateCategoryList(categories: categoryDto[]): void {
    this.category$.next(categories);
  }


}
