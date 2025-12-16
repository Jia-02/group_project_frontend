import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

import { Observable, of } from 'rxjs';
import { ProductDetailDialogComponent } from '../product-detail-dialog/product-detail-dialog.component';
import { SettingDetailDialogComponent } from '../setting-detail-dialog/setting-detail-dialog.component';
import { OrderService } from '../order.service';
import { SendOrderDialogComponent } from '../send-order-dialog/send-order-dialog.component';
import { DataService } from '../@service/data.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-menu-c',
  imports: [
    MatTabsModule
  ],
  templateUrl: './menu-c.component.html',
  styleUrl: './menu-c.component.scss'
})
export class MenuCComponent {
  private existingOrderId: string | number | null = null;

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
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      if (orderId) {
        this.existingOrderId = orderId;
        this.loadExistingOrderToService(orderId);
      } else {
        this.loadOrderDataFromService();
      }
      this.loadInitialData();
    });
  }

  groupOrderDetails(apiList: any[]): any[] {
    const map = new Map();

    apiList.forEach(item => {
      const mainProduct = item.orderDetails[0];
      const optionKey = JSON.stringify(mainProduct.detailList.sort((a: any, b: any) => a.option.localeCompare(b.option)));
      const key = `${mainProduct.productId}-${item.orderDetailsPrice}-${optionKey}`;

      if (map.has(key)) {
        const existing = map.get(key);
        existing.quantity += 1;
      } else {
        map.set(key, {
          ...item,
          quantity: 1,
          productName: mainProduct.productName,
        });
      }
    });

    return Array.from(map.values());
  }

  loadExistingOrderToService(orderId: string | number): void {
    const apiUrl = `orders/list/detail?ordersId=${orderId}`;

    this.dataService.getApi(apiUrl).subscribe((res: any) => {
      if (res.code === 200) {
        const groupedDetails = this.groupOrderDetails(res.orderDetailsList);

        this.orderService.currentOrder = {
          ordersId: res.ordersId,
          ordersType: res.ordersType,
          tableId: res.tableId || '',
          customerName: res.customerName || '',
          customerPhone: res.customerPhone || '',
          customerAddress: res.customerAddress || '',
          ordersDate: res.ordersDate,
          ordersTime: res.ordersTime,
          paymentType:res.paymentType,
          paid: res.paid,
          orderDetailsList: groupedDetails,
        };
        console.log(`已成功載入訂單 ID: ${orderId} 進行修改`);
        this.loadOrderDataFromService();
      } else {
        console.error('載入現有訂單詳細資料失敗:', res);
        this.loadOrderDataFromService();
      }
    });
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

            let productName: string;

            if (isSetting) {
              productName = res.settingDetail?.settingName || '未知套餐';
            } else {
              productName = res.productDetail?.productName || '未知產品';
            }

            const itemWithProductName = {
              ...result,
              productName: productName
            };

            this.addOrderDetailItemToCart(itemWithProductName);
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

  deleteCartItem(itemToDelete: any): void {
    const index = this.currentCart.findIndex(item =>
      item === itemToDelete
    );

    if (index > -1) {
      this.orderService.currentOrder.orderDetailsList.splice(index, 1);
      this.currentCart = [...this.orderService.currentOrder.orderDetailsList];
      console.log('已從購物車中刪除項目。');
    } else {
      console.warn('嘗試刪除不存在的項目。');
    }
  }

  getTotalPrice(): number {
    return this.currentCart.reduce((total, item) => {
      const pricePerUnit = item.orderDetailsPrice || 0;
      const quantity = item.quantity || 0;
      return total + (pricePerUnit * quantity); // 修正：單價 * 數量
    }, 0);
  }

  submitCart() {
    if (this.currentCart.length === 0) {
      alert('請至少選擇一個商品！');
      return;
    }

    const originalOrder = this.orderService.currentOrder;

    let finalOrderDetailsList: any[] = [];

    originalOrder.orderDetailsList.forEach(cartItem => {
      const { quantity, productName, ...apiItem } = cartItem;

      const cleanedApiItem = {
        orderDetailsId: apiItem.orderDetailsId, // ID 由前端賦予，後端可能需要重新編號
        orderDetailsPrice: apiItem.orderDetailsPrice,
        settingId: apiItem.settingId,
        orderDetails: apiItem.orderDetails
      };

      for (let i = 0; i < (quantity || 1); i++) {
        finalOrderDetailsList.push(cleanedApiItem);
      }
    });

    const now = new Date();
    const finalPayload = {
      ...originalOrder,
      ordersId: this.existingOrderId || originalOrder.ordersId,
      ordersType: originalOrder.ordersType || 'A',
      tableId: originalOrder.tableId || null,
      totalPrice: this.getTotalPrice(),
      paid: originalOrder.paid || false,
      paymentType: originalOrder.paymentType || '現金',
      orderDetailsList: finalOrderDetailsList // 結構 2
    };

    console.log('Final Payload (API 提交結構):', finalPayload);

    const apiUrl = 'orders/update/nopaid';

    this.dataService.postApi(apiUrl, finalPayload)
    .subscribe((res: any) => {
        if (res.code === 200) {
          alert('訂單更新成功！');
          this.router.navigate(['/order-page'], { queryParams: { reopenOrderId: this.existingOrderId } });
        } else {
          alert(`訂單更新失敗: ${res.message || '未知錯誤'}`);
          console.error('訂單更新 API 錯誤:', res);
        }
      }
    );
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
