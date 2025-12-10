import { categoryDto, productList, productListRes } from './../@interface/interface';
import { Injectable } from '@angular/core';
import { reservation } from '../@interface/interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  reservation: reservation[] = [];
  allCategoryDto: categoryDto[] = [];
  productList: productList[] = [];
  productListRes!: productListRes;

  // 觀察菜單分類
  private category$ = new BehaviorSubject<categoryDto[]>([]);
  _catagory$ = this.category$.asObservable();



}
