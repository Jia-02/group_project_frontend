import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

import { Observable, of } from 'rxjs';
import { ProductDetailDialogComponent } from '../product-detail-dialog/product-detail-dialog.component';
import { SettingDetailDialogComponent } from '../setting-detail-dialog/setting-detail-dialog.component';
import { OrderService } from '../order.service';
import { SendOrderDialogComponent } from '../send-order-dialog/send-order-dialog.component';
import { DataService } from '../@service/data.service';
import { BoardDialogComponent } from '../board-dialog/board-dialog.component';
import { Activity } from '../allActivity/calendar/calendar.component';

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
    private orderService: OrderService,
  ) { }

  ngOnInit(): void {
    this.loadOrderDataFromService();
    this.loadInitialData();
    this.openBoard();
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
    this.dataService.getApi(`category/list`).subscribe(
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

  openBoard() {
    const apiUrl = 'calendar/selectDate';

    this.dataService.getApi(apiUrl)
      .subscribe((res: any) => {
        let rawActivities: any[] = [];
        if (Array.isArray(res)) {
          rawActivities = res;
        } else if (res && (res.activities || res.calendarList)) {
          rawActivities = res.activities || res.calendarList;
        }

        if (!Array.isArray(rawActivities)) {
          console.error('API 返回的數據結構不符合預期，無法提取活動列表。');
          rawActivities = [];
        }

        const processedActivities: Activity[] = rawActivities.map((act: any) => {
          return {
            ...act,
            calendarStartDate: new Date(act.calendarStartDate),
            calendarEndDate: new Date(act.calendarEndDate)
          };
        });

        const hasActivities = processedActivities.length > 0;

        if (hasActivities) {
          console.log(`活動資料載入成功: 共 ${processedActivities.length} 筆`);
        } else {
          console.log('API 呼叫完成，但目前沒有公告活動。');
        }

        this.dialog.open(BoardDialogComponent, {
          data: { activities: processedActivities },
          width: '300px',
          height: '90vh',
          panelClass: 'full-screen-dialog'
        });
      });
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
        const productUrl = `product/list/user?categoryId=${categoryId}`;
        apiObservable = this.dataService.getApi(productUrl);
        dataKey = 'productList';
      } else {
        const settingUrl = `setting/list/user?categoryId=${categoryId}`;
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
      detailUrl = `setting/detail?settingId=${itemId}`;
    } else {
      detailUrl = `product/detail?categoryId=${categoryId}&productId=${itemId}`;
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
          if (result && result.quantity) {
            this.addOrderDetailItemToCart(result);
          }
        });
      }
    });
  }

  addOrderDetailItemToCart(item: any): void {
    const quantity = item.quantity;

    if (!quantity || quantity < 1) return;

    const newId = this.orderService.currentOrder.orderDetailsList.length + 1;

    const newDetailItem = {
      ...item,
      orderDetailsId: newId,
    };

    this.orderService.currentOrder.orderDetailsList.push(newDetailItem);

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

    const dialogRef = this.dialog.open(SendOrderDialogComponent, {
      width: '500px',
      height: '900px',
      data: finalPayload,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'add') {
        const updatedData = result.updatedData;

        this.orderService.currentOrder = {
          ...this.orderService.currentOrder,
          orderDetailsList: updatedData.orderDetailsList,
        };

        console.log('已同步彈窗修改後的數量至 Service:', this.orderService.currentOrder);

      }
    });
  }

  get totalItemsCount(): number {
    return this.currentCart.reduce((total, item) => total + (item.quantity || 0), 0);
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
