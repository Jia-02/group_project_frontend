import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(private http: HttpClient) { }
  baseUrl = 'http://localhost:8080/';

  // 讀取
  getApi(url: string) {
    url = this.baseUrl + url;
    return this.http.get(url);
  }

  // 新增
  postApi(url: string, postData: any) {
    url = this.baseUrl + url;
    return this.http.post(url, postData);
  }
}
