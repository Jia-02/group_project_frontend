import { DataService } from './../@service/data.service';
import { categoryDto, categoryResponse, productDto, productListResponse } from './../@interface/interface';
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
  productList: productDto[] = []; // 儲存當前分類的餐點列表
  currentSelectedCategoryId: number = 0; // 儲存當前選中的分類 ID

  // 新增單個分類
  categoryDto: categoryDto = {
    categoryId: 0,
    categoryType: '',
    workstationId: 2
  };

  readonly dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadCategories();
  }

  // 抓取菜單分類
  loadCategories(): void {
    this.httpClientService.getApi('http://localhost:8080/category/list')
      .subscribe((res) => {
        let response = res as categoryResponse;
        // 檢查是否有分類
        if (response && response.categoryDto && response.categoryDto.length > 0) {
          this.allCategoryDto = response.categoryDto; // 更新分類列表
          this.dataService.updateCategoryList(response.categoryDto); // 更新 DataService
        }
        const firstCategoryId = this.allCategoryDto[0].categoryId; // 載入第一個分類的產品
        this.currentSelectedCategoryId = firstCategoryId; // 當前選中的 ID
        this.loadProducts(firstCategoryId); // 呼叫菜單
      })
  }

  // 抓取餐點列表
  loadProducts(categoryId: number) {
    const apiUrl = `http://localhost:8080/product/list?categoryId=${categoryId}`;
    // 取得當前分類的 categoryType
    const currentCategory = this.allCategoryDto.find(c => c.categoryId === categoryId);
    const categoryType = currentCategory ? currentCategory.categoryType : '';

    this.httpClientService.getApi(apiUrl)
      .subscribe((res) => {
        let response = res as productListResponse;
        console.log(res);

        // 定義資料夾對應
        const folderMap: Record<string, string> = {
          '披薩': 'pizza',
          '飲料': 'drink',
          '火鍋': 'hotpot',
          '義大利麵': 'pasta',
          '炸物': 'fried',
          '甜點': 'snack',
          '套餐': 'set',
        };

        const imageFolder = folderMap[categoryType] || 'default';

        if (response && response.productList) {
          this.productList = response.productList.map(p => {

            const rawFilename = p.imageUrl;
            const cleanFilename = rawFilename.includes('/')
              ? rawFilename.split('/').pop()
              : rawFilename;

            return {
              ...p,
              imageUrl: `${imageFolder}/${cleanFilename}`
            };
          });
        }
      })
  }

  // 新增分類
  addCategory() {
    this.httpClientService.postApi('http://localhost:8080/category/add', this.categoryDto)
      .subscribe((res) => {
      })

    // 即時更新
    this.dataService._catagory$.subscribe((res) => {
    })
  }

  // Mat Tab 切換
  onTabChange(event: MatTabChangeEvent): void {
    const selectedCategoryIndex = event.index;

    // 確保不是點擊最後一個 "新增分類" Tab
    if (selectedCategoryIndex < this.allCategoryDto.length) {
      const categoryId = this.allCategoryDto[selectedCategoryIndex].categoryId;
      this.currentSelectedCategoryId = categoryId;
      this.loadProducts(categoryId); // 呼叫 API 載入產品
    }
  }


  // 取得目前選中的 categoryDto，以取出 categoryType
  getCurrentCategoryDto(): categoryDto | undefined {
    // 從 allCategoryDto 列表中找到 categoryId 匹配 currentSelectedCategoryId
    return this.allCategoryDto.find(c => c.categoryId == this.currentSelectedCategoryId);
  }

  addProduct(): void {
    const currentCategory = this.getCurrentCategoryDto();

    // 檢查是否有選中的分類
    if (currentCategory) {
      const dialogRef = this.dialog.open(DialogMenuComponent, {
        data: {
          categoryId: currentCategory.categoryId,
          categoryType: currentCategory.categoryType  // 傳遞 categoryType 給 Dialog
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.loadProducts(this.currentSelectedCategoryId); // 如果新增成功，可以考慮重新載入產品列表
      });
    }

  }
}
