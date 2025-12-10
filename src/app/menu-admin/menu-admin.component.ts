import { DataService } from './../@service/data.service';
import { categoryDto, productList } from './../@interface/interface';
import { HttpClientService } from './../@service/http-client.service';
import { Component, inject } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogMenuComponent } from '../@dialog/dialog-menu/dialog-menu.component';
import { DialogDeleteComponent } from '../@dialog/dialog-delete/dialog-delete.component';
import { DialogCustomizedComponent } from '../@dialog/dialog-customized/dialog-customized.component';
import { DialogSetComponent } from '../@dialog/dialog-set/dialog-set.component';

@Component({
  selector: 'app-menu-admin',
  imports: [
    MatTabsModule,
    MatIconModule,
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatSlideToggleModule
  ],
  templateUrl: './menu-admin.component.html',
  styleUrl: './menu-admin.component.scss'
})

export class MenuAdminComponent {

  constructor(
    private httpClientService: HttpClientService,
    private dataService: DataService
  ) { }

  allCategoryDto: categoryDto[] = []; // 儲存從後端獲取的所有分類
  productList: productList[] = []; // 儲存當前分類的餐點列表
  currentCategoryId: number = 0; // 儲存當前選中的分類 ID
  selectedTabIndex: number = 0; // 目前選中的分類
  isEditMode: boolean = false; // 是否為編輯模式

  // 新增單個分類
  categoryDto: categoryDto = {
    categoryId: 0,
    categoryType: '',
    workstationId: 0,
  };
  optionList: any[] = []; // 用來儲存客製化選項的陣列
  setList: any[] = []; // 用來存套餐列表


  readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadCategories();
  }

  // Mat Tab 切換到哪個分頁
  onTabChange(event: MatTabChangeEvent): void {
    const selectedCategoryIndex = event.index; // 取得使用者點的分頁
    // 判斷是否點擊了最後一個「新增分類」按鈕
    if (selectedCategoryIndex == this.allCategoryDto.length) {
      // 這是「新增分類」的分頁
      this.currentCategoryId = 0;
      this.productList = [];
      this.optionList = [];
      this.setList = []; // 清空套餐
      return;
    }
    const selectedCategory = this.allCategoryDto[selectedCategoryIndex];

    if (selectedCategory) {
      this.currentCategoryId = selectedCategory.categoryId;

      // 判斷是否為套餐分類
      if (selectedCategory.categoryType == '套餐') {
        this.productList = []; // 清空普通產品
        this.loadSets(this.currentCategoryId);
      } else {
        this.setList = []; // 清空套餐
        this.loadProducts(this.currentCategoryId);
        this.customizedList(this.currentCategoryId);
      }
    }
  }


  // =================== 菜單分類 =====================

  // 抓取菜單分類
  loadCategories(): void {
    this.httpClientService.getApi('http://localhost:8080/category/list')
      .subscribe((res: any) => {
        // 成功收到api
        if (res.code == 200) {
          this.allCategoryDto = res.categoryDto; // 更新分類列表
          this.dataService.allCategoryDto = this.allCategoryDto; // 更新到service

          // 如果有抓到分類，預設抓第一筆分類的產品與客製化選項
          if (this.allCategoryDto.length > 0) {
            const firstCategory = this.allCategoryDto[0];
            this.currentCategoryId = firstCategory.categoryId;

            if (firstCategory.categoryType == '套餐') {
              this.loadSets(this.currentCategoryId);
              // 確保其他列表清空
              this.productList = [];
            } else {
              this.loadProducts(this.currentCategoryId);
              this.customizedList(this.currentCategoryId);
              this.setList = [];
            }
          }
        }
      })
  }

  // 新增分類
  addCategory() {
    if (this.isEditMode) {
      this.httpClientService.postApi('http://localhost:8080/category/update', this.categoryDto)
        .subscribe((res: any) => {
          if (res.code == 200) {
            this.loadCategories(); // 重新整理列表
            this.resetForm();      // 清空表單
            this.isEditMode = false; // 回復成新增模式
            this.selectedTabIndex = 0; // (選項) 更新完跳回第一個分頁
          }
        })
    } else {
      this.httpClientService.postApi('http://localhost:8080/category/add', this.categoryDto)
        .subscribe((res: any) => {
          if (res.code == 200) {
            this.dataService.allCategoryDto.push(res); // 或直接 loadCategories
            this.loadCategories();
            this.resetForm();
          }
        });
    }

  }

  // 更新分類
  updateCategory(targetCategory: categoryDto) {
    this.isEditMode = true;
    this.categoryDto = {
      categoryId: targetCategory.categoryId,
      categoryType: targetCategory.categoryType,
      workstationId: targetCategory.workstationId
    };

    this.selectedTabIndex = this.allCategoryDto.length;
  }



  // 刪除分類
  delCategory(targetCategory: categoryDto) {
    const payload = {
      categoryId: targetCategory.categoryId
    };

    this.httpClientService.postApi('http://localhost:8080/category/del', payload)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.loadCategories();

          // 刪除當前分類後，分類切回第一個
          if (this.currentCategoryId == targetCategory.categoryId) {
            this.currentCategoryId = 0; // 重置邏輯
          }
        }
      });
  }


  // =================== 餐點 =====================

  // 抓取餐點列表
  loadProducts(categoryId: number) {
    const apiUrl = `http://localhost:8080/product/list?categoryId=${categoryId}`;
    this.httpClientService.getApi(apiUrl)
      .subscribe((res: any) => {
        // 成功收到api
        if (res.code == 200) {
          this.dataService.productListRes = res;
          // 如果api的分類 = tab的分頁
          if (res.categoryId == this.currentCategoryId) {
            this.productList = res.productList || [];
            this.dataService.productList = this.productList;
          }
        }
      });
  }


  // 新增餐點
  addProduct() {
    // 找分類對應的飲料
    let currentCategoryType = '';
    for (let categoryData of this.dataService.allCategoryDto) {
      if (this.dataService.productListRes.categoryId == categoryData.categoryId) {
        currentCategoryType = categoryData.categoryType;
      }
    }

    const dialogRef = this.dialog.open(DialogMenuComponent, {
      data: {
        categoryId: this.currentCategoryId,
        categoryType: currentCategoryType,
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res == true) {
        this.loadProducts(this.currentCategoryId);
      }
    });
  }

  // 是否上架餐點
  launchProduct(product: productList) {
    product.categoryId = this.currentCategoryId;
    this.httpClientService.postApi('http://localhost:8080/product/update', product)
      .subscribe((res: any) => {
        if (res.code == 200) {
        }
      })
  }

  // 更新餐點
  updateProduct(product: productList) {

    // 找出目前的分類名稱
    let currentCategoryType = '';
    for (let categoryData of this.dataService.allCategoryDto) {
      if (this.currentCategoryId == categoryData.categoryId) {
        currentCategoryType = categoryData.categoryType;
      }
    }

    const dialogRef = this.dialog.open(DialogMenuComponent, {
      data: {
        categoryId: this.currentCategoryId,
        categoryType: currentCategoryType,
        product: product,
        isEditMode: true
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadProducts(this.currentCategoryId);
      }
    });
  }

  // 刪除餐點
  delProduct(product: productList) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: {
        deleteType: 'product',
        categoryId: this.currentCategoryId,
        productId: product.productId
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadProducts(this.currentCategoryId);
      }
    });
    this.loadProducts(this.currentCategoryId);
  }

  // =================== 套餐 =====================

  // 套餐列表
  loadSets(categoryId: number) {
    const apiUrl = `http://localhost:8080/setting/list?categoryId=${categoryId}`;
    this.httpClientService.getApi(apiUrl)
      .subscribe((res: any) => {
        // 成功收到api
        if (res.code == 200) {
          console.log(res);
          this.setList = res.optionVoList || [];

        } else {
          this.setList = []; // 失敗或沒資料時清空
        }
      });
  }

  // 新增套餐
  addSets() {

    // 找分類對應的飲料
    let currentCategoryType = '';
    for (let categoryData of this.dataService.allCategoryDto) {
      if (this.dataService.productListRes.categoryId == categoryData.categoryId) {
        currentCategoryType = categoryData.categoryType;
      }
    }

    const dialogRef = this.dialog.open(DialogSetComponent, {
      data: {
        // 當前分類資訊
        categoryId: this.currentCategoryId,
        categoryType: currentCategoryType,
        // 傳入下拉選單需要的資料
        optionLists: {
          mainDishes: ['牛排', '豬排', '雞腿'],
          sideDishes: ['沙拉', '濃湯'],
          drinks: ['紅茶', '綠茶', '咖啡']
        }
      }
    })
  }


  // =================== 客製化 =====================

  // 客製化列表
  customizedList(categoryId: number) {
    const apiUrl = `http://localhost:8080/option/list?categoryId=${categoryId}`;
    this.httpClientService.getApi(apiUrl)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.optionList = res.optionVoList || [];
        } else {
          this.optionList = []; // 失敗或沒資料時清空
        }
      })
  }


  // 新增客製化
  addCustomized() {
    const dialogRef = this.dialog.open(DialogCustomizedComponent, {
      data: {
        categoryId: this.currentCategoryId, // 傳入當前的分類 ID
        existingOptions: this.optionList // 目前的選項列表
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.customizedList(this.currentCategoryId);
      }
    });
  }

  // 更新客製化
  updateCustomized(targetOption: any) {
    const dialogRef = this.dialog.open(DialogCustomizedComponent, {
      data: {
        categoryId: this.currentCategoryId,
        existingOptions: this.optionList,
        targetOption: targetOption,
        isEditMode: true
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.customizedList(this.currentCategoryId);
      }
    });
  }

  // 刪除客製化
  delCustomized(targetOption: any) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: {
        deleteType: 'option',
        categoryId: this.currentCategoryId, // 傳入當前的分類 ID
        optionId: targetOption.optionId // 目前的選項列表
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.customizedList(this.currentCategoryId);
      }
    });
  }


  // 重製分類
  resetForm() {
    this.categoryDto = {
      categoryId: 0,
      categoryType: '',
      workstationId: 0
    };
  }



  // 轉成 base64
  // test(event: any) {
  //   const file = event.target.files[0];
  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onload = () => {
  //   };
  // }
}
