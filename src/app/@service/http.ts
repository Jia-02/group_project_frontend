import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Http {

  // private baseUrl = 'http://localhost:8080';
  private baseUrl="http://192.168.0.174:8080/";
  constructor(private http: HttpClient) { }

  register(account: AccountRegisterReq): Observable<BasicRes> {
    return this.http.post<BasicRes>(`${this.baseUrl}/addAccount`, account);
  }

  login(req: AccountLoginReq): Observable<BasicRes<LoginRes>> {
    return this.http.post<BasicRes<LoginRes>>(`${this.baseUrl}/login`, req);
  }

  selectUser(userName: string) {
    return this.http.get<BasicRes>(`${this.baseUrl}/deliveryUser/select`, {
      params: { userName }
    });
  }

  // 可接單列表
  getAvailableTasks(): Observable<BasicRes<DeliveryTask[]>> {
    return this.http.get<BasicRes<DeliveryTask[]>>(`${this.baseUrl}/api/v1/deliverytask/list/available`);
  }

  // 外送員接單
  takeOrder(orderNo: string, deliveryId: number): Observable<BasicRes> {
    return this.http.post<BasicRes>(`${this.baseUrl}/api/v1/deliverytask/user/takeorder`, {
      orderNo,
      deliveryId
    });
  }

  // 取得外送員已接單列表
  getTakingTasks(deliveryId: number): Observable<BasicRes<DeliveryTask[]>> {
    return this.http.get<BasicRes<DeliveryTask[]>>(`${this.baseUrl}/api/v1/deliverytask/list/taking`, {
      params: { deliveryId }
    });
  }

  updateStatus(orderNo: string, status: string, estimatedTime: number): Observable<BasicRes> {
  return this.http.post<BasicRes>(
    `${this.baseUrl}/api/v1/deliverytask/user/statusupdate`,
    { orderNo, status, estimatedTime }
  );
}


  // 取得外送員歷史完成訂單列表
  getAllByDeliveryid(deliveryId: number): Observable<BasicRes<DeliveryTask[]>> {
    return this.http.get<BasicRes<DeliveryTask[]>>(`${this.baseUrl}/api/v1/deliverytask/list/completed`, {
      params: { deliveryId }
    });
  }

  // 依日期查詢當天完成的訂單
  getCompletedByDate(date: string, deliveryId: number) {
    return this.http.get<BasicRes<DeliveryTask[]>>(
      `${this.baseUrl}/api/v1/deliverytask/list/complete/date`,
      { params: { date, deliveryId } }
    );
  }


  // 更新外送費和距離
  updateDistanceAndMoney(orderNo: string, distanceKm: number, money: number) {
    return this.http.post<BasicRes>(
      `${this.baseUrl}/api/v1/deliverytask/user/update-money`,
      { orderNo, distanceKm, money }
    );
  }


  // 抓取訂單詳細資料（依 orderNo）
getOrderDetailByCode(orderNo: string): Observable<OrderDetailRes> {
  return this.http.get<OrderDetailRes>(
    `${this.baseUrl}/orders/code`,
    { params: { orderNo } }
  );
}
}




export interface AccountRegisterReq {
  userName: string;
  password: string;
  name: string;
  phone: string;

}
export interface LoginRes {
  id: number;
  name: string;
  phone: string;
}

export interface BasicRes<T = any> {
  code: number;
  message: string;
  data?: T;      // 針對泛型資料
  dtaskList?: T; // 外送任務列表
  id?: number;
  name?: string;
  phone?: string;
}

export interface AccountLoginReq {
  userName: string;
  password: string;
}

export interface DeliveryTask {
  customerAddress: string;
  totalPrice: number;
  products: { name: string; price: number; options: string[]; }[];
  orderNo: string;
  deliveryId: number;
  date: string;
  distanceKm: number;
  status: string;
  money: number;
  receiveMoney: boolean;
  estimatedTime?: number;
  calculated?: boolean;
}
export interface OrderDetailRes {
  ordersCode: string;
  customerAddress: string;
  totalPrice: number;
  orderDetailsList: {
    orderDetails: {
      productName: string;
      productPrice: number;
      detailList: {
        option: string;
        addPrice: number;
      }[];
    }[];
  }[];
}
