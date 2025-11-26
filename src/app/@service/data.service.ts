import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http:HttpClient) { }

  getApi(url:string):any{
    return this.http.get(url);
  }

  postApi(url:string,postData:any):any{
    return this.http.post(url,postData);
  }
}
