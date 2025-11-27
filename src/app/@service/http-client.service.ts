import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(private http: HttpClient) { }

  // 讀取
  getApi(url: string) {
    return this.http.get(url);
  }

  // 新增
  postApi(url: string, postData: any) {
    return this.http.post(url, postData);
  }
}
