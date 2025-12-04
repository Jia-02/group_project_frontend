import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getApi(url: string): any {
    return this.http.get(url);
  }

  postApi(url: string, postData: any): any {
    return this.http.post(url, postData);
  }

}

export interface WorkTable {
  workStationId: number;
  workStationName: string;
}

export interface WorkTableListRes {
  code: number;
  message: string;
  workStationList: WorkTable[];
}

export interface Table {
  tableId: string;
  tableStatus: string;
  tableCapacity: number;
  tablePositionX: number;
  tablePositionY: number;
  lengthX: number;
  lengthY: number;
}

export interface Reservation {
  reservationDate: string;
  reservationPhone: string;
  reservationTime: string;
  reservationName: string;
  reservationCount: number;
  reservationAdultCount: number;
  reservationChildCount: number;
  reservationStatus: boolean;
  reservationNote: string;
  childSeat: number;
  tableId: string;
}

export interface UpdateReservation {
  reservationDate: string;
  reservationPhone: string;
  reservationTime: string;
  reservationName: string;
  reservationCount: number;
  reservationAdultCount: number;
  reservationChildCount: number;
  reservationStatus: boolean;
  reservationNote: string;
  childSeat: number;
  tableId: string;
  newDate: string;
}

export interface TableRes {
  code: number;
  message: string;
  tableList: Table[];
}


export interface ReservationListRes {
  code: number;
  message: string;
  reservationList: Reservation[];
}

export interface ReservationListTodayRes {
  code: number;
  message: string;
  reservationAndTableByDateList: ReservationToday[];
  reservationDate: string;
}

export interface ReservationToday {
  capacity: number;
  reservations: Reservation[];
  tableDailyStatus: boolean;
  tableId: string;
}

export interface ReservationNowListRes {
  code: number;
  message: string;
  reservationAndTableByTimeList: ReservationNowList[]
}

export interface ReservationNowList {
  capacity: number;
  childSeat: number;
  reservationAdultCount: number;
  reservationChildCount: number;
  reservationCount: number;
  reservationDate: string;
  reservationName: string;
  reservationNote: string;
  reservationPhone: string;
  reservationStatus: boolean;
  reservationTime: string;
  tableDailyStatus: boolean;
  tableId: string;
  tableStatus: string;
}

export interface BasicRes {
  code: number;
  message: string;
}


export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  tableId: string;
  capacity: number;
  reservationName?: string;
  status: string;
  selected?: boolean;
}

// 一筆資料代表一個訂單中的一份餐點/套餐
export interface OrderProductList {
  orderDetailsId: number;
  orderDetailsPrice:number;
  settingId:number;
  orderDetail:OrderDetail[];
}

// 一筆資料代表一個訂單的一個餐點的訊息
export interface OrderDetail {
  categoryId:number; //餐點類別
  productId: number; //餐點id
  productionStatus:string; //餐點狀態
  productName: string; // 餐點名稱
  productPrice:number; //餐點價格
  detailList: Option[]; //這筆訂單的這一個餐點的客製化訊息
}

// 一筆資料代表一個餐點
export interface Option {
  id:number; // 客製化的id 當一個餐點有多個客製化時也是由1~n
  option: string; //選擇的客製化名稱
  addprice: number; //選擇的客製化的價格
}

export interface Order{
  orderId:string;
  orderProductList:OrderProductList[];
  tableId:string;
  status:string[];
  price:number;
}

