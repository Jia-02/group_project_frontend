import { optionVo } from './../../@interface/interface';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { HttpClientService } from '../../@service/http-client.service';
import { categoryDto, productList } from '../../@interface/interface';

@Component({
  selector: 'app-dialog-set',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    CommonModule
  ],
  templateUrl: './dialog-set.component.html',
  styleUrl: './dialog-set.component.scss'
})
export class DialogSetComponent {

  constructor(private httpClientService: HttpClientService) { }
  readonly dialogRef = inject(MatDialogRef<DialogSetComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  selectedFile: File | null = null; // 儲存使用者選中的檔案
  categoryList: categoryDto[] = []; // 給 主餐 分類選單用
  sideDishList: productList[] = []; // 給 附餐 選單用
  drinkDishList: productList[] = []; // 給 飲料 選單用
  mainDishList: productList[] = []; // 給 主餐 選單用
  currentCategoryType: string = '';   // 用來顯示當前分類名稱

  categoryDto: categoryDto = {
    categoryId: 0,
    categoryType: '',
    workstationId: 2
  };

  productList: productList[] = [];

  products: productList = {
    productId: 0,
    productName: '',
    productPrice: 0,
    productActive: true,
    productDescription: '',
    imageUrl: '',
    productNote: '',
    categoryId: 0
  };

  optionVo: any = {
    settingId: 0,
    settingName: '',
    settingPrice: 0,
    settingImg: '',
    settingActive: true,
    settingNote: '',
    categoryId: 0,
    settingDetail: []
  };

  // 用來綁定使用者選了什麼 ID
  selections = {
    mainCatId: 0,
    mainIds: [] as number[], // 存多個 ProductID
    sideId: 0,
    drinkId: 0
  };

  isEditMode: boolean = false;

  ngOnInit(): void {
    this.categoryList = this.data.allCategories || [];
    this.sideDishList = this.data.sideDishList || [];
    this.drinkDishList = this.data.drinkDishList || [];
    this.currentCategoryType = this.data.categoryType;
    this.optionVo.categoryId = this.data.currentCategoryId;

    // 判斷是否為編輯模式
    if (this.data.isEditMode && this.data.targetSet) {
      this.isEditMode = true;
      this.optionVo = JSON.parse(JSON.stringify(this.data.targetSet)); // 深拷貝資料
      this.existingDetails();
    }
  }

  // 取消
  onNoClick() {
    this.dialogRef.close();
  }


  // 確定
  onAddClick() {
    // 檢查圖片 (新增模式必填；編輯模式若沒選檔案代表不換圖)
    if (!this.isEditMode && !this.selectedFile) {
      alert('新增商品必須上傳圖片');
      return;
    }

    // 處理圖片路徑邏輯
    if (this.selectedFile) {
      const folderMap: { [key: string]: string } = {
        '套餐': 'set', '飲料': 'drink', '義大利麵': 'pasta',
        '點心': 'snack', '披薩': 'pizza', '火鍋': 'hotpot', '炸物': 'fried'
      };
      const folderName = folderMap[this.currentCategoryType] || 'set';
      this.optionVo.settingImg = `/${folderName}/${this.selectedFile.name}`;
    }

    const sideCat = this.categoryList.find(c => c.categoryType.trim() == '炸物');
    const drinkCat = this.categoryList.find(c => c.categoryType.trim() == '飲料');

    // 如果找不到分類，預設為 0
    const realSideCatId = sideCat ? sideCat.categoryId : 0;
    const realDrinkCatId = drinkCat ? drinkCat.categoryId : 0;

    const details = []; // 組裝 settingDetail

    // 主餐 (使用選單綁定的 mainCatId)
    if (this.selections.mainCatId > 0 && this.selections.mainIds.length > 0) {

      const selectedProducts = [];

      // 遍歷所有主餐清單，找出被勾選的項目
      for (const p of this.mainDishList) {
        if (this.selections.mainIds.includes(p.productId)) {
          selectedProducts.push({
            productId: p.productId,
            productName: p.productName
          });
        }
      }

      details.push({
        categoryId: Number(this.selections.mainCatId),
        detailList: selectedProducts // 這裡放入陣列
      });
    }

    // 抓取附餐
    if (this.selections.sideId > 0 && realSideCatId > 0) {
      const target = this.sideDishList.find(p => p.productId == this.selections.sideId);
      details.push({
        categoryId: Number(realSideCatId),
        detailList: [{
          productId: Number(this.selections.sideId),
          productName: target ? target.productName : ''
        }]
      });
    }

    // 抓取飲料
    if (this.selections.drinkId > 0 && realDrinkCatId > 0) {
      const target = this.drinkDishList.find(p => p.productId == this.selections.drinkId);
      details.push({
        categoryId: realDrinkCatId,
        detailList: [{
          productId: Number(this.selections.drinkId),
          productName: target ? target.productName : ''
        }]
      });
    }

    // 將組裝好的內容放進 Payload
    this.optionVo.settingDetail = details;

    // 定義一個處理函式：成功後把資料 (this.optionVo) 丟回給父層
    const handleSuccess = (res: any) => {
      if (res.code == 200) {
        if (res.settingId) {
          this.optionVo.settingId = res.settingId;
        }
        this.dialogRef.close(this.optionVo);
      }
    };

    // 送出
    if (this.isEditMode) {
      this.httpClientService.postApi('http://localhost:8080/setting/update', this.optionVo)
        .subscribe(handleSuccess);
    } else {
      this.httpClientService.postApi('http://localhost:8080/setting/add', this.optionVo)
        .subscribe(handleSuccess);
    }
  }

  // 切換主餐分類，抓該分類的產品
  onMainCategoryChange() {
    this.mainDishList = [];
    this.selections.mainIds = []; // ★ 清空已選陣列

    if (this.selections.mainCatId > 0) {
      this.httpClientService.getApi(`http://localhost:8080/product/list?categoryId=${this.selections.mainCatId}`)
        .subscribe((res: any) => {
          if (res.code == 200 && res.productList) {
            this.mainDishList = res.productList.filter((p: any) => p.productActive === true);
          }
        });
    }
  }

  // ★ 新增方法: 處理主餐勾選/取消勾選
  toggleMainSelection(productId: number, event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.selections.mainIds.push(productId);
    } else {
      this.selections.mainIds = this.selections.mainIds.filter(id => id !== productId);
    }
  }

  // ★ 新增方法: 判斷是否已勾選 (給 HTML 顯示用)
  isMainSelected(productId: number): boolean {
    return this.selections.mainIds.includes(productId);
  }


  // 解析既有的 Detail 資料並回填
  existingDetails() {
    if (!this.optionVo.settingDetail || this.optionVo.settingDetail.length === 0) return;

    // 找出分類 ID
    const sideCat = this.categoryList.find(c => c.categoryType.trim() == '炸物');
    const drinkCat = this.categoryList.find(c => c.categoryType.trim() == '飲料');
    const realSideCatId = sideCat ? sideCat.categoryId : -1;
    const realDrinkCatId = drinkCat ? drinkCat.categoryId : -1;

    for (const group of this.optionVo.settingDetail) {
      const cId = Number(group.categoryId); // 這一組的分類 ID
      if (!group.detailList || group.detailList.length === 0) continue;

      // 1. 檢查是否為附餐 (通常附餐只有一個選項，取第一個即可)
      if (cId == realSideCatId) {
        this.selections.sideId = Number(group.detailList[0].productId);
        continue;
      }

      // 2. 檢查是否為飲料
      if (cId == realDrinkCatId) {
        this.selections.drinkId = Number(group.detailList[0].productId);
        continue;
      }

      // 3. 剩下的就是主餐 (處理複選回填)
      this.selections.mainCatId = cId;
      this.selections.mainIds = []; // 先清空，確保乾淨

      // 將該分類下的所有 productId 都推入 mainIds
      for (const item of group.detailList) {
        this.selections.mainIds.push(Number(item.productId));
      }
    }

    // 如果有抓到主餐分類，就去後端撈該分類的所有產品列表 (為了顯示 Checkbox)
    if (this.selections.mainCatId > 0) {
      this.loadMainDishForEdit(this.selections.mainCatId);
    }
  }



  // 編輯模式 > 讀取主餐 > 抓產品分類
  loadMainDishForEdit(categoryId: number) {
    this.httpClientService.getApi(`http://localhost:8080/product/list?categoryId=${categoryId}`)
      .subscribe((res: any) => {
        if (res.code == 200) {
          this.mainDishList = []; // 清空目前的主餐列表

          // 後端回傳的清單
          for (const p of res.productList) {
            // 如果是上架狀態
            if (p.productActive == true) {
              this.mainDishList.push(p);
            }
          }
        }
      });
  }

  // 處理檔案選取事件
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }
}
