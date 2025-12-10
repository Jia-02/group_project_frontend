import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { DataService } from '../data/data.service';
import { Observable, of } from 'rxjs';
import { ProductDetailDialogComponent } from '../product-detail-dialog/product-detail-dialog.component';

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

  openProductDetail(categoryId: number, productId: number): void {
    const isSetting = this.categories.some(c => c.categoryId === categoryId && c.categoryType === this.SETTING_TAB_LABEL);

    this.dialog.open(ProductDetailDialogComponent, {
      width: '400px',
      data: {
        type: isSetting ? 'setting' : 'product',
        categoryId: categoryId,
        productId: productId,
        settingId: isSetting ? productId : undefined
      }
    });
  }

  openSettingDetail(settingId: number): void {
    // 暫時留空
  }

}

interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  imageUrl: string;
}

interface SettingItem {
  settingId: number;
  settingName: string;
  settingPrice: number;
  // settingDetail: Product[];
}

interface Category {
  categoryId: number;
  categoryType: string;
  workstationId: number;
  products?: (Product | { productId: number, productName: string, productPrice: number })[];
  isLoadingProducts?: boolean;
}

interface ProductApiResponse {
  code: number;
  message: string;
  categoryId: number;
  productList: Product[];
}

interface SettingApiResponse {
  code: number;
  message: string;
  categoryId: number;
  optionVoList: SettingItem[];
}
