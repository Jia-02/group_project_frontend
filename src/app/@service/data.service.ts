import { Injectable } from '@angular/core';
import { reservation, scheduleItem, tables } from '../@interface/interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  reservation: reservation[] = [];

  // Map<"YYYY-MM-DD", scheduleItem[]>
  // 每天所有預約的 scheduleItem 列表
  dailyReservations: Map<string, scheduleItem[]> = new Map();

  // 用 Map 保存每個日期的桌位狀態，讓不同日期可以有獨立的桌位設定
  tableAvailableByDate: Map<string, tables[]> = new Map();

}
