import { Injectable } from '@angular/core';
import { reservation } from '../@interface/interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  // reservation: reservation[] = [
  //   {
  //     newDate: '',
  //     reservationDate: '2025-11-25',
  //     reservationTime: '11:00',
  //     reservationPhone: '0912-345-678',
  //     reservationName: '李先生',
  //     reservationCount: 4,
  //     reservationAdultCount: 2,
  //     reservationChildCount: 2,
  //     reservationStatus: true,
  //     reservationNote: '',
  //     childSeat: 0,
  //     tableId: 'A01'
  //   },
  //   // ... 其他資料
  // ];

  reservation: reservation[] = [];
}
