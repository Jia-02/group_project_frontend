
import { categoryDto, productList, scheduleItem } from './../@interface/interface';

import { Injectable } from '@angular/core';
import { reservation } from '../@interface/interface';

import { HttpClient } from '@angular/common/http';




@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }


  // 分類列表
  allCategoryDto: categoryDto[] = [];

  // 產品列表(單點)
  productList: productList[] = [];

  // 預約資料
  reservation: reservation[] = [];


  // 每天所有預約的 scheduleItem 列表
  dailyReservations: Map<string, scheduleItem[]> = new Map();

  // 套餐列表
  setList: any[] = [];


  // 客製化選項列表
  optionList: any[] = [];

  // 附餐與飲料列表
  sideDishList: productList[] = [];
  drinkDishList: productList[] = [];
  baseUrl = 'http://localhost:8080/'


  getApi(url: string): any {
    url = this.baseUrl + url;
    return this.http.get(url);
  }

  postApi(url: string, postData: any): any {
    url = this.baseUrl + url;
    return this.http.post(url, postData);
  }


  // 桌位列表
  tableIdList: any[] = [];


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
  qrUrl: string;
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

export interface Order {
  orderId: number;
  orderCode: string;
  orderProductList: OrderDetailsList[];
  tableId: string;
  status: string[];
  workStationId: number[];
  price: number;
  paid: boolean;
}


export interface OrdersTodayRes {
  code: number;
  message: string;
  orders: Orders[];
}

interface Orders {
  ordersId: number;
  ordersType: string;
  ordersDate: string;
  ordersTime: string;
  totalPrice: number;
  paymentType: string;
  paid: boolean;
  ordersCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  tableId: string;
  orderDetailsList: OrderDetailsList[];
}

interface OrderDetailsList {
  orderDetailsId: number;
  orderDetailsPrice: number;
  settingId: number;
  status: string[];
  orderDetails: OrderDetails[];
}

interface OrderDetails {
  categoryId: number;
  workStationId: number;
  productId: number;
  productName: string;
  productPrice: number;
  mealStatus: string;
  detailList: DetailList[];
}

interface DetailList {
  id: number;
  option: string;
  addPrice: number;
}

export interface UpdateOrderReq {
  ordersId: number;
  orderDetails: OrderDetailList[];
}

export interface OrderDetailList {
  orderDetailsId: number;
  orderDetails: OrderDetail[];
}

export interface OrderDetail {
  productId: number;
  productName: string;
  categoryId: number;
  mealStatus: string;
  productPrice: number;
  detailList: Option[];
}

export interface Option {
  option: string;
  addPrice: number;
}

export interface MealStatusRes {
  code: number;
  message: string;
  mealStatus: MealStatus;
  order:Orders;
  orderDetailsList:OrderDetailsList[];
}

export interface MealStatus {
  mealStatusId: number;
  mealStatus: string;
  estimatedTime: number;
  finishTime: string;
  ordersId: number;
  order:Orders;
  orderDetailsList:OrderDetailsList[];
}
