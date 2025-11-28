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

export interface UpdateReservation{
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
  newDate:string;
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

export interface ReservationNowListRes{
  code:number;
  message:string;
  reservationAndTableByTimeList:ReservationNowList[]
}

export interface ReservationNowList {
  capacity:number;
  childSeat:number;
  reservationAdultCount:number;
  reservationChildCount:number;
  reservationCount:number;
  reservationDate:string;
  reservationName:string;
  reservationNote:string;
  reservationPhone:string;
  reservationStatus:boolean;
  reservationTime:string;
  tableDailyStatus:boolean;
  tableId:string;
  tableStatus:string;
}
