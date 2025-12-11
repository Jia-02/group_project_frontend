import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { DataService } from '../data/data.service';
import { Observable, of } from 'rxjs';
import { ProductDetailDialogComponent } from '../product-detail-dialog/product-detail-dialog.component';
import { SettingDetailDialogComponent } from '../setting-detail-dialog/setting-detail-dialog.component';

@Component({
  selector: 'app-menu',
  imports: [
    MatTabsModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {

  public categories: Category[] = [];
  private SETTING_TAB_LABEL = '套餐';
  public isLoadingCategories = true;

  constructor(
    private dataService: DataService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.dataService.getApi(`http://localhost:8080/category/list`).subscribe(
      (res: any) => {
        if (res.code === 200 && res.categoryDto) {
          this.categories = res.categoryDto.map(
            (item: any) => ({
              ...item,
              categoryType: item.categoryType
            }));

          this.isLoadingCategories = false;

          if (this.categories.length > 0) {
            this.loadProductsForCategory(0);
          }
        } else {
          console.error('API 返回錯誤或無效資料:', res);
          this.isLoadingCategories = false;
        }
      }
    );
  }

  onTabChange(event: MatTabChangeEvent): void {
    if (event.index < this.categories.length) {
      this.loadProductsForCategory(event.index);
    }
  }

  loadProductsForCategory(categoryIndex: number): void {
    const category = this.categories[categoryIndex];

    if (category && category.products === undefined) {
      const categoryId = category.categoryId;
      category.isLoadingProducts = true;

      let apiObservable: Observable<any>;
      let dataKey: string;

      if (category.categoryType !== this.SETTING_TAB_LABEL) {
        const productUrl = `http://localhost:8080/product/list/user?categoryId=${categoryId}`;
        apiObservable = this.dataService.getApi(productUrl);
        dataKey = 'productList';
      } else {
        const settingUrl = `http://localhost:8080/setting/list/user?categoryId=${categoryId}`;
        apiObservable = this.dataService.getApi(settingUrl);
        dataKey = 'optionVoList';
      }

      apiObservable.subscribe((res: any) => {
        if (res.code === 200 && res[dataKey]) {
          if (dataKey == 'productList') {
            category.products = res[dataKey];
          } else if (dataKey == 'optionVoList') {
            category.products = res[dataKey].map((item: any) => ({
              productId: item.settingId,
              productName: item.settingName,
              productPrice: item.settingPrice
            }));
          }
          console.log(res);

        } else {
          console.warn(`載入分類 ${category.categoryType} 失敗:`, res.message);
          category.products = [];
        }
        category.isLoadingProducts = false;
      }
      );
    }
  }

  openProductDetail(categoryId: number, itemId: number): void {
    const isSetting = this.categories.some(c =>
      c.categoryId === categoryId && c.categoryType === this.SETTING_TAB_LABEL
    );

    let detailUrl: string;

    if (isSetting) {
      detailUrl = `http://localhost:8080/setting/detail?settingId=${itemId}`;
      console.log('準備載入套餐詳情:', detailUrl);
    } else {
      detailUrl = `http://localhost:8080/product/detail?categoryId=${categoryId}&productId=${itemId}`;
      console.log('準備載入單點詳情:', detailUrl);
    }

    this.dataService.getApi(detailUrl).subscribe((res: any) => {

      if (res.code == 200) {

        console.log('獲取詳情成功:', res);

        if (isSetting) {
          this.dialog.open(SettingDetailDialogComponent, {
            width: '400px',
            height: '900px',
            data: res
          })
        } else {
          this.dialog.open(ProductDetailDialogComponent, {
            width: '400px',
            height: '900px',
            data: res
          })
        }
      }
    })
  }
}

interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl: string;
}

interface Category {
  categoryId: number;
  categoryType: string;
  workstationId: number;
  products?: (Product | { productId: number, productName: string, productPrice: number })[];
  isLoadingProducts?: boolean;
}


