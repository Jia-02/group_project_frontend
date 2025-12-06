import { DataService } from './../@service/data.service';
import { categoryDto, productList } from './../@interface/interface';
import { HttpClientService } from './../@service/http-client.service';
import { Component, inject } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogMenuComponent } from '../@dialog/dialog-menu/dialog-menu.component';

@Component({
  selector: 'app-menu-admin',
  imports: [
    MatTabsModule,
    MatIconModule,
    FormsModule,
    CommonModule
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

  // 新增單個分類
  categoryDto: categoryDto = {
    categoryId: 0,
    categoryType: '',
    workstationId: 0,
  };

  readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts;
  }

  // Mat Tab 切換到哪個分頁
  onTabChange(event: MatTabChangeEvent): void {
    const selectedCategoryIndex = event.index; // 取得使用者點的分頁
    // 如果使用者選的索引 比 分類筆數少
    if (selectedCategoryIndex < this.allCategoryDto.length) {
      const categoryId = this.allCategoryDto[selectedCategoryIndex].categoryId;  // 例:選到的索引分類2的ID
      this.currentCategoryId = categoryId; // 當前的分類ID
      this.loadProducts(categoryId); // 再入選中的分類的產品
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
        }
        console.log(res);

      })
  }

  // 新增分類
  addCategory() {
    this.httpClientService.postApi('http://localhost:8080/category/add', this.categoryDto)
      .subscribe((res: any) => {
        // 成功收到api
        if (res.code == 200) {
          this.dataService.allCategoryDto.push(res);
          this.loadCategories();
        }
      })
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
      if( res == true){
        this.loadProducts(this.currentCategoryId);
      }
    });
  }


  // 轉成 base64
  // test(event: any) {
  //   const file = event.target.files[0];
  //   const reader = new FileReader();
  //   reader.readAsDataURL(file);
  //   reader.onload = () => {
  //     console.log(reader.result);
  //   };
  // }
}
