import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { DataService } from '../data/data.service';
import { Observable, of } from 'rxjs';
import { ProductDetailDialogComponent } from '../product-detail-dialog/product-detail-dialog.component';
import { SettingDetailDialogComponent } from '../setting-detail-dialog/setting-detail-dialog.component';
import { OrderService } from '../order.service';
import { SendOrderDialogComponent } from '../send-order-dialog/send-order-dialog.component';

@Component({
  selector: 'app-menu',
  imports: [
    MatTabsModule
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  ordersType: string = '';
  tableId: string = '';
  currentCart: any[] = [];

  displayOrderType: string = '';
  displayTableId: string = '';

  public categories: Category[] = [];
  private SETTING_TAB_LABEL = '套餐';
  public isLoadingCategories = true;

  constructor(
    private dataService: DataService,
    private dialog: MatDialog,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.loadOrderDataFromService();
    this.loadInitialData();
  }

  loadOrderDataFromService(): void {
    const order = this.orderService.currentOrder;

    this.ordersType = order.ordersType;
    this.tableId = order.tableId || '';

    this.displayOrderType = ORDER_TYPE_MAP[this.ordersType] || '未知模式';
    this.displayTableId = this.tableId;

    this.currentCart = order.orderDetailsList;
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
    } else {
      detailUrl = `http://localhost:8080/product/detail?categoryId=${categoryId}&productId=${itemId}`;
    }

    this.dataService.getApi(detailUrl).subscribe((res: any) => {
      if (res.code == 200) {
        console.log('獲取詳情成功:', res);
        let dialogRef;

        if (isSetting) {
          dialogRef = this.dialog.open(SettingDetailDialogComponent, {
            width: '400px',
            height: '900px',
            data: res
          });
        } else {
          dialogRef = this.dialog.open(ProductDetailDialogComponent, {
            width: '400px',
            height: '900px',
            data: res
          });
        }

        dialogRef.afterClosed().subscribe((result: any) => {
          if (result && result.itemDetail) {
            this.addOrderDetailItemToCart(result);
          }
        });
      }
    });
  }

  addOrderDetailItemToCart(item: any): void {
    const quantity = item.itemDetail.quantity;

    if (!quantity || quantity < 1) return;

    for (let i = 0; i < quantity; i++) {
      const newDetailItem = {
        ...item,
        orderDetailsId: this.orderService.currentOrder.orderDetailsList.length + 1 + i,
        orderDetailsPrice: item.itemDetail.pricePerUnit,
        settingOptions: undefined,
      };

      this.orderService.currentOrder.orderDetailsList.push(newDetailItem);
    }

    this.currentCart = this.orderService.currentOrder.orderDetailsList;

    console.log('已加入購物車。當前總項數:', this.currentCart.length);
  }

  submitCart() {
    if (this.currentCart.length === 0) {
      alert('請至少選擇一個商品！');
      return;
    }

    const originalOrder = this.orderService.currentOrder;

    const cleanedOrderDetailsList = originalOrder.orderDetailsList.map(item => {
      const { itemDetail, ...rest } = item;
      return rest;
    });

    const finalPayload = {
      ...originalOrder,
      orderDetailsList: cleanedOrderDetailsList
    };

    console.log(finalPayload);

    this.dialog.open(SendOrderDialogComponent, {
      width: '500px',
      height: '900px',
      data: finalPayload,
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

const ORDER_TYPE_MAP: { [key: string]: string } = {
  'A': '內用',
  'T': '外帶',
  'D': '外送',
};
