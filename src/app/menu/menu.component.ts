import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { DataService } from '../data/data.service';
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
  private baseUrl = 'http://localhost:8080';

  public categories: Category[] = [];
  public settings: Setting[] = [];
  public isLoadingCategories = true;

  constructor(
    private dataService: DataService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    // 載入類別: http://localhost:8080/category/list
    const categoryUrl = `${this.baseUrl}/category/list`;
    this.dataService.getApi(categoryUrl).subscribe((categories: Category[]) => {
        this.categories = categories;
        this.isLoadingCategories = false;

        if (this.categories.length > 0) {
          this.loadProductsForCategory(0);
        }
      }
    );

    // 獨立載入套餐: http://localhost:8080/setting/list/user
    const settingUrl = `${this.baseUrl}/setting/list/user`;
    this.dataService.getApi(settingUrl).subscribe((settings: Setting[]) => {
        this.settings = settings;
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

    if (category && !category.products) {
      const categoryId = category.categoryId;
      category.isLoadingProducts = true;

      // 構建帶有查詢參數的 URL: http://localhost:8080/product/list/user?categoryId={id}
      const productUrl = `${this.baseUrl}/product/list/user?categoryId=${categoryId}`;

      this.dataService.getApi(productUrl).subscribe((products: Product[]) => {
          category.products = products;
          category.isLoadingProducts = false;
        }
      );
    }
  }

  openProductDetail(categoryId: number, productId: number): void {
    this.dialog.open(ProductDetailDialogComponent, {
      width: '400px',
      data: {
        type: 'product',
        categoryId: categoryId,
        productId: productId
      }
    });
  }

  openSettingDetail(settingId: number): void {
    this.dialog.open(ProductDetailDialogComponent, {
      width: '400px',
      data: {
        type: 'setting',
        settingId: settingId
      }
    });
  }

}

interface Product {
  productId: number;
  productName: string;
  productPrice: number;
  categoryId: number;
}

interface Setting {
  settingId: number;
  settingName: string;
  settingPrice: number;
}

interface Category {
  categoryId: number;
  categoryName: string;
  products?: Product[];
  isLoadingProducts?: boolean;
}
