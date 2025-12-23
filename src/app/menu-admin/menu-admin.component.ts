import { DataService } from './../@service/data.service';
import { categoryDto, optionVo, productList } from './../@interface/interface';
import { HttpClientService } from './../@service/http-client.service';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogMenuComponent } from '../@dialog/dialog-menu/dialog-menu.component';
import { DialogDeleteComponent } from '../@dialog/dialog-delete/dialog-delete.component';
import { DialogCustomizedComponent } from '../@dialog/dialog-customized/dialog-customized.component';
import { DialogSetComponent } from '../@dialog/dialog-set/dialog-set.component';
import { DialogNoticeComponent } from '../@dialog/dialog-notice/dialog-notice.component';
import { LoadingServiceService } from '../@service/loading-service.service';

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
    private dataService: DataService,
    private loadingServiceService: LoadingServiceService,
    private cdr: ChangeDetectorRef
  ) { }

  readonly dialog = inject(MatDialog);

  allCategoryDto: categoryDto[] = []; // 儲存從後端獲取的所有分類
  productList: productList[] = []; // 儲存當前分類的餐點列表
  currentCategoryId: number = 0; // 儲存當前選中的分類 ID
  selectedTabIndex: number = 0; // 目前選中的分類
  isEditMode: boolean = false; // 是否為編輯模式
  optionList: any[] = []; // 用來儲存客製化選項的陣列
  setList: any[] = []; // 用來存套餐列表
  sideDishList: any[] = [];   // 用於儲存附餐列表
  drinkDishList: any[] = [];  // 用於儲存飲料列表
  currentCategory!: categoryDto;
  workstationList: any[] = [];

  // 新增單個分類
  categoryDto: categoryDto = {
    categoryId: 0,
    categoryType: '',
    workstationId: 0,
  };



  ngOnInit(): void {
    this.loadCategories();
    this.loadWorkstations();
  }

  // Mat Tab 切換到哪個分頁
  onTabChange(event: MatTabChangeEvent): void {
    const index = event.index;
    const isAddTab = (index == this.allCategoryDto.length);

    if (isAddTab) {
      // 只有在「非編輯模式」進入新增 Tab 時，才清空表單
      if (!this.isEditMode) {
        this.resetForm();
      }
    } else {
      // 如果切換到一般分類 Tab，主動結束編輯狀態並清空暫存
      this.isEditMode = false;
      this.resetForm();
    }
    const targetCategory = this.dataService.allCategoryDto[index];  // 是否為最後一個新增分類按鈕
    this.handleCategoryChange(targetCategory); // 如果是 undefined > 點到新增分類
  }

  // 分類核心邏輯合併
  handleCategoryChange(category: categoryDto) {
    // 清空 Service 資料
    this.dataService.productList = [];
    this.dataService.setList = [];
    this.dataService.optionList = [];

    // 判斷是否為新增分類模式
    if (!category) {
      this.currentCategoryId = 0;
      return;
    }

    this.currentCategory = category;
    this.currentCategoryId = category.categoryId;

    // 一般分類模式
    if (category.categoryType == '套餐') {
      this.loadSets(this.currentCategoryId);
    } else {
      this.loadProducts(this.currentCategoryId);
      this.customizedList(this.currentCategoryId);
    }
  }


  // =================== 菜單分類 =====================

  // 抓取菜單分類
  loadCategories(targetId?: number): void {
    this.httpClientService.getApi('category/list')
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.allCategoryDto = res.categoryDto; // 更新分類列表
          this.dataService.allCategoryDto = this.allCategoryDto; // 更新到service
          this.cdr.detectChanges();

          let targetIndex = 0; // 初始進入時在第一個 Tab
          if (targetId == -1) {
            targetIndex = this.allCategoryDto.length - 1; // -1代表是新增分類，跳到最後一個
          } else if (targetId && targetId > 0) {
            // 編輯模式，尋找該 ID 位置
            const foundIndex = this.allCategoryDto.findIndex(c => c.categoryId == targetId);
            if (foundIndex !== -1) {
              targetIndex = foundIndex; // 找到了，用找到的位置
            } else {
              targetIndex = 0;          // 找不到，預設回第一頁
            }
          }

          // 這樣可以強迫 MatTabGroup 偵測到「數值變化」
          this.selectedTabIndex = -1;

          setTimeout(() => {
            this.selectedTabIndex = targetIndex;
            if (this.allCategoryDto[targetIndex]) {
              this.handleCategoryChange(this.allCategoryDto[targetIndex]);
            }
            this.cdr.markForCheck(); // 標記檢查，確保選中狀態的藍條會動
          }, 100);
        }
      });
  }


  // 新增分類
  addCategory() {
    if (this.isEditMode) {
      const targetId = this.categoryDto.categoryId; // 紀錄目前編輯的 ID
      this.httpClientService.postApi('category/update', this.categoryDto)
        .subscribe((res: any) => {
          if (res.code == 200) {
            this.loadCategories(targetId); // 重新整理列表
            this.resetForm();      // 清空表單
            this.isEditMode = false; // 回復成新增模式
            console.log(targetId);
          }

        });
    } else {
      this.httpClientService.postApi('category/add', this.categoryDto)
        .subscribe((res: any) => {
          console.log('API 回傳的原始資料:', res);
          if (res.code == 200) {
            this.loadCategories(-1);
            this.resetForm();
            // this.dataService.allCategoryDto.push(res);
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

  // 抓工作臺列表
  loadWorkstations() {
    this.httpClientService.getApi('workstation/list').subscribe((res: any) => {
      if (res.code == 200) {
        console.log(res);
        this.workstationList = res.workStationList;
      }
    })
  }

  // 刪除分類
  delCategory(targetCategory: categoryDto) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: {
        deleteType: 'category', // 傳遞類型
        categoryId: targetCategory.categoryId,
        categoryName: targetCategory.categoryType
      }
    })
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadCategories();
        if (this.currentCategoryId == targetCategory.categoryId) {
          this.selectedTabIndex = 0;
        }
      }
    });
  }



  // =================== 餐點 =====================

  // 抓取餐點列表
  loadProducts(categoryId: number) {
    const apiUrl = `product/list?categoryId=${categoryId}`;
    this.httpClientService.getApi(apiUrl)
      .subscribe((res: any) => {

        // 成功收到api
        if (res.code == 200) {
          // 如果api的分類 = tab的分頁
          if (res.categoryId == this.currentCategoryId) {
            this.productList = res.productList || [];
            this.dataService.productList = this.productList;
          }
        }
        this.loadingServiceService.hide();
      });
  }


  // 新增餐點
  addProduct() {
    const dialogRef = this.dialog.open(DialogMenuComponent, {
      width: '85%',
      height: 'auto',
      data: {
        categoryId: this.currentCategory.categoryId,
        categoryType: this.currentCategory.categoryType,
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadProducts(this.currentCategoryId);
      }
    });
  }

  // 是否上架餐點
  launchProduct(event: MatSlideToggleChange, product: productList) {
    const newStatus = event.checked;
    // product.productActive = newStatus;
    // product.categoryId = this.currentCategoryId;

    const payload = {
      ...product,
      productActive: newStatus,
      categoryId: this.currentCategoryId
    };
    console.log('2. 準備送出 API:', payload);
    this.httpClientService.postApi('product/update', payload)
      .subscribe((res: any) => {
        if (res.code == 200) {
          console.log(res);
          product.productActive = newStatus;
        } else if (res.message == "套餐開放使用中。") {
          this.dialog.open(DialogNoticeComponent, {
            data: { noticeType: 'setHasMeal' }
          });
        }
      });
  }

  // 更新餐點
  updateProduct(product: productList) {
    const dialogRef = this.dialog.open(DialogMenuComponent, {
      width: '85%',
      height: 'auto',
      data: {
        categoryId: this.currentCategoryId,
        categoryType: this.currentCategory.categoryType,
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
  }


  // =================== 套餐 =====================

  // 套餐列表
  loadSets(categoryId: number) {
    const apiUrl = `setting/list?categoryId=${categoryId}`;
    this.httpClientService.getApi(apiUrl)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.setList = res.optionVoList || [];
          this.dataService.setList = this.setList;
        } else {
          this.dataService.setList = [];
        }
      });
  }

  // 準備套餐的資料 -> 存 Service -> 開 Dialog 然後再傳入 Data
  prepareSetData(callback: () => void) {
    this.dataService.sideDishList = [];
    this.dataService.drinkDishList = [];
    this.sideDishList = [];
    this.drinkDishList = [];
    let sideCategoryId = 0;
    let drinkCategoryId = 0;

    // 找出附餐和飲料的 Category ID
    for (let catgoryData of this.allCategoryDto) {
      const typeName = catgoryData.categoryType.trim();
      if (typeName == '炸物') sideCategoryId = catgoryData.categoryId;
      if (typeName == '飲料') drinkCategoryId = catgoryData.categoryId;
    }

    // 抓飲料
    const findDrink = () => {
      // 如果有飲料id
      if (drinkCategoryId > 0) {
        this.httpClientService.getApi(`product/list?categoryId=${drinkCategoryId}`)
          .subscribe((res: any) => {
            if (res.code == 200) {
              for (const p of res.productList) {
                // 且有上架
                if (p.productActive == true) {
                  this.dataService.drinkDishList.push(p);
                }
                this.drinkDishList = [...this.dataService.drinkDishList];
              }
            }
            callback();
          });
      } else {
        callback();
      }
    };

    // 抓附餐 > 成功後去抓飲料
    // 如果有附餐
    if (sideCategoryId > 0) {
      this.httpClientService.getApi(`product/list?categoryId=${sideCategoryId}`)
        .subscribe((res: any) => {
          if (res.code == 200) {
            for (const p of res.productList) {
              // 且有上架
              if (p.productActive == true) {
                this.dataService.sideDishList.push(p);
              }
            }
            this.sideDishList = [...this.dataService.sideDishList];
          }
          findDrink(); // 接著抓飲料
        });
    } else {
      findDrink();
    }
  }

  // 新增套餐
  addSets() {
    this.prepareSetData(() => {
      const dialogRef = this.dialog.open(DialogSetComponent, {
        width: '80%',         // 您希望的寬度
        maxWidth: '85%',    // 增加這行，防止被 Material 預設值限制
        height: 'auto',
        data: {
          allCategories: this.allCategoryDto,
          sideDishList: this.sideDishList,
          drinkDishList: this.drinkDishList,
          currentCategoryId: this.currentCategoryId,
          categoryType: this.currentCategory.categoryType,
        }
      });

      dialogRef.afterClosed().subscribe((res: any) => {
        if (res) {
          this.loadSets(this.currentCategoryId);
        }
      });
    });
  }

  // 編輯套餐
  updateSet(pkg: any) {
    console.log(pkg);

    // 附餐與飲料的選項清單
    this.prepareSetData(() => {
      const dialogRef = this.dialog.open(DialogSetComponent, {
        width: '80%',
        height: 'auto',
        data: {
          allCategories: this.allCategoryDto,
          sideDishList: this.sideDishList,
          drinkDishList: this.drinkDishList,
          currentCategoryId: this.currentCategoryId,
          categoryType: this.currentCategory.categoryType,
          targetSet: pkg,
          isEditMode: true
        }
      });

      dialogRef.afterClosed().subscribe((res: any) => {
        if (res) {
          this.loadSets(this.currentCategoryId);
        }
      });
    });
  }

  // 是否上架餐點
  launchSet(pkg: any) {
    pkg.categoryId = this.currentCategoryId;
    let cleanDetail = [];
    // 確保有資料才跑迴圈
    if (pkg.settingDetail && Array.isArray(pkg.settingDetail)) {
      for (const group of pkg.settingDetail) {
        if (!group.categoryId || group.categoryId == 0) {
          continue;
        }

        // 準備處理內層的商品列表
        let tempDetailList = [];
        if (group.detailList && Array.isArray(group.detailList)) {
          for (const item of group.detailList) {
            if (item.productId) {
              tempDetailList.push({
                productId: item.productId,
                productName: item.productName
              });
            }
          }
        }

        // 將確認沒問題的資料推入陣列
        cleanDetail.push({
          categoryId: group.categoryId,
          categoryType: group.categoryType,
          detailList: tempDetailList
        });
      }
    }

    const payload = {
      settingId: pkg.settingId,
      settingName: pkg.settingName,
      settingPrice: pkg.settingPrice,
      settingImg: pkg.settingImg,
      settingActive: pkg.settingActive,
      settingNote: pkg.settingNote,
      categoryId: this.currentCategoryId,
      settingDetail: cleanDetail
    };
    console.log(payload);


    this.httpClientService.postApi('setting/update', payload)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.loadSets(this.currentCategoryId);
        } else {
          console.log(res);
        }
      })
  }

  // 刪除套餐
  delSet(pkg: optionVo) {
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      data: {
        deleteType: 'set',
        categoryId: this.currentCategoryId,
        settingId: pkg.settingId
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.loadSets(this.currentCategoryId);
      }
    });
  }

  // =================== 客製化 =====================

  // 客製化列表
  customizedList(categoryId: number) {
    const apiUrl = `option/list?categoryId=${categoryId}`;
    this.httpClientService.getApi(apiUrl)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.dataService.optionList = res.optionVoList || [];
          this.optionList = this.dataService.optionList;
        }
      });
  }

  // 新增客製化
  addCustomized() {
    const dialogRef = this.dialog.open(DialogCustomizedComponent, {
      width: '85%',
      height: 'auto',
      data: {
        categoryId: this.currentCategoryId, // 傳入當前的分類 ID
        existingOptions: this.dataService.optionList // 目前的選項列表
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
        existingOptions: this.dataService.optionList,
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


  // ================ 輔助 ===================

  // 當點擊套餐時
  onSetSelected(pkg: optionVo) {
    this.optionList = [];
    this.dataService.optionList = [];

    // 檢查套餐是否有內容
    if (!pkg.settingDetail || pkg.settingDetail.length == 0) {
      return;
    }

    // 找出附餐和飲料的 Category ID
    let sideCatId = 0;
    let drinkCatId = 0;

    for (const cat of this.allCategoryDto) {
      if (cat.categoryType.trim() == '炸物') sideCatId = cat.categoryId;
      if (cat.categoryType.trim() == '飲料') drinkCatId = cat.categoryId;
    }

    // 收集所有不重複的 CategoryId
    const categoryIds: number[] = [];
    for (const group of pkg.settingDetail) {
      const cId = group.categoryId;

      // 判斷 ID 有效，且陣列裡沒有這個id
      if (cId > 0 && !categoryIds.includes(cId)) {
        categoryIds.push(cId);
      }
    }

    // 暫存陣列
    const mainOptions: any[] = [];  // 主餐選項
    const sideOptions: any[] = [];  // 附餐選項
    const drinkOptions: any[] = []; // 飲料選項

    for (const categoryId of categoryIds) {
      this.httpClientService.getApi(`option/list?categoryId=${categoryId}`)
        .subscribe((res: any) => {
          if (res.code == 200) {
            if (categoryId == sideCatId) {
              sideOptions.push(...res.optionVoList);
            } else if (categoryId == drinkCatId) {
              drinkOptions.push(...res.optionVoList);
            } else {
              mainOptions.push(...res.optionVoList);
            }
            this.optionList = [...mainOptions, ...sideOptions, ...drinkOptions];
            this.dataService.optionList = this.optionList;
          }
        });
    }
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
