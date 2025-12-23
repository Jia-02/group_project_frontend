import { optionVo, settingDetail } from './../../@interface/interface';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { HttpClientService } from '../../@service/http-client.service';
import { categoryDto, productList } from '../../@interface/interface';
import { MatIconModule } from '@angular/material/icon';
import { DialogNoticeComponent } from '../dialog-notice/dialog-notice.component';

@Component({
  selector: 'app-dialog-set',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './dialog-set.component.html',
  styleUrl: './dialog-set.component.scss'
})
export class DialogSetComponent {

  constructor(private httpClientService: HttpClientService) { }
  readonly dialogRef = inject(MatDialogRef<DialogSetComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  readonly dialog = inject(MatDialog);

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
      console.log(this.optionVo);

      this.optionVo.categoryId = this.data.currentCategoryId;
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
    if (!this.isEditMode && !this.selectedFile || !this.optionVo.settingName || !this.optionVo.settingPrice) {
      this.dialog.open(DialogNoticeComponent, {
        data: {noticeType: 'isRequired'}
      })
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

    // 找出炸物 與 飲料 的 Category ID
    let realSideCatId = 0;
    let realDrinkCatId = 0;
    let realSideCatType = '';
    let realDrinkCatType = '';

    for (const cat of this.categoryList) {
      const typeName = cat.categoryType.trim();
      if (typeName == '炸物') {
        realSideCatId = cat.categoryId;
        realSideCatType = cat.categoryType;
      }
      if (typeName == '飲料') {
        realDrinkCatId = cat.categoryId;
        realDrinkCatType = cat.categoryType;
      }
    }

    const details = []; // 組裝 settingDetail

    // 主餐
    if (this.selections.mainCatId > 0 && this.selections.mainIds.length > 0) {
      const selectedProducts = [];

      // 找主餐分類名稱
      let mainCatName = '';
      for (const cat of this.categoryList) {
        if (cat.categoryId == this.selections.mainCatId) {
          mainCatName = cat.categoryType;
          break;
        }
      }

      // 所有主餐清單，找出被勾選的項目
      for (const p of this.mainDishList) {
        if (this.selections.mainIds.includes(p.productId)) {
          selectedProducts.push({
            productId: p.productId,
            productName: p.productName
          });
        }
      }

      // 加入主餐細節
      if (selectedProducts.length > 0) {
        details.push({
          categoryId: this.selections.mainCatId,
          detailList: selectedProducts,
          categoryType: mainCatName,
        });
      }
    }

    // 抓取附餐
    if (this.selections.sideId > 0 && realSideCatId > 0) {
      let sideName = '';

      for (const side of this.sideDishList) {
        if (side.productId == this.selections.sideId) {
          sideName = side.productName;
        }
      }

      details.push({
        categoryId: realSideCatId,
        categoryType: realSideCatType,
        detailList: [{
          productId: this.selections.sideId,
          productName: sideName
        }]
      });
    }

    // 抓取飲料
    if (this.selections.drinkId > 0 && realDrinkCatId > 0) {
      let drinkName = '';
      for (const drink of this.drinkDishList) {
        if (drink.productId == this.selections.drinkId) {
          drinkName = drink.productName;
        }
      }

      details.push({
        categoryId: realDrinkCatId,
        categoryType: realDrinkCatType,
        detailList: [{
          productId: Number(this.selections.drinkId),
          productName: drinkName
        }]
      });
    }

    // 將組裝好的內容放進 Payload
    this.optionVo.settingDetail = details;

    const handleSuccess = (res: any) => {
      console.log(res);

      if (res.code == 200) {
        if (res.settingId) {
          this.optionVo.settingId = res.settingId;
        }
        this.dialogRef.close(this.optionVo);
      }
    };

    // 送出
    if (this.isEditMode) {
      this.httpClientService.postApi('setting/update', this.optionVo)
        .subscribe(handleSuccess);
    } else {
      this.httpClientService.postApi('setting/add', this.optionVo)
        .subscribe(handleSuccess);
    }
  }

  // 切換主餐分類，抓該分類的產品
  onMainCategoryChange() {
    this.mainDishList = [];
    this.selections.mainIds = [];

    if (this.selections.mainCatId > 0) {
      this.httpClientService.getApi(`product/list?categoryId=${this.selections.mainCatId}`)
        .subscribe((res: any) => {
          if (res.code == 200) {
            for (const p of res.productList) {
              if (p.productActive == true) {
                this.mainDishList.push(p);
              }
            }
          }
        });
    }
  }

  // 處理主餐勾選/取消勾選
  toggleMainSelection(productId: number, event: any) {
    const isChecked = event.target.checked;

    // 如果是勾選 -> 加入陣列
    if (isChecked) {
      this.selections.mainIds.push(productId);
    } else {
      for (let i = 0; i < this.selections.mainIds.length; i++) {
        // 比對 ID
        if (this.selections.mainIds[i] == productId) {
          this.selections.mainIds.splice(i, 1); // 移除該項目
          break;
        }
      }
    }
  }

  // 判斷是否已勾選
  isMainSelected(productId: number): boolean {
    return this.selections.mainIds.includes(productId);
  }


  // 解析既有的 Detail 資料並回填
  existingDetails() {
    // 檢查資料是否存在
    if (!this.optionVo.settingDetail || this.optionVo.settingDetail.length == 0) {
      return;
    }

    // 找炸物與飲料的分類ID (設一個絕對不可能存在於資料庫的 ID)
    let realSideCatId = -1;
    let realDrinkCatId = -1;

    for (const cat of this.categoryList) {
      const typeName = cat.categoryType.trim();
      console.log(typeName);

      if (typeName == '炸物') {
        realSideCatId = cat.categoryId;
      }

      if (typeName == '飲料') {
        realDrinkCatId = cat.categoryId;
      }
    }

    for (const group of this.optionVo.settingDetail) {
      const cId = group.categoryId; // 這一組的分類 ID

      // 如果沒有 detailList 或長度為 0
      if (!group.detailList || group.detailList.length == 0) {
        continue;
      }


      let currentTypeName = ''; // 用來存查到的分類名稱
      for (const cat of this.categoryList) {
        // 使用 == (雙等號) 讓 "5" (字串) 可以等於 5 (數字)
        if (cat.categoryId == cId) {
          currentTypeName = cat.categoryType.trim(); // 找到後去除空白
          break; // 找到了就跳出迴圈，不用再找了
        }
      }

      // 檢查是否為附餐
      if (cId == realSideCatId) {
        const firstItem = group.detailList[0];
        this.selections.sideId = firstItem.productId;
        console.log(this.selections.sideId);
        continue;
      }

      // 檢查是否為飲料
      if (cId == realDrinkCatId) {
        const firstItem = group.detailList[0];
        this.selections.drinkId = firstItem.productId;
        continue;
      }

      // 剩下的就是主餐
      this.selections.mainCatId = cId;
      this.selections.mainIds = [];

      // 將該分類下的所有 productId 都推入 mainIds
      for (const item of group.detailList) {
        this.selections.mainIds.push(item.productId);
      }
    }

    // 如果有抓到主餐分類，就去後端抓該分類的所有產品列表
    if (this.selections.mainCatId > 0) {
      this.loadMainDishForEdit(this.selections.mainCatId);
    }
  }



  // 編輯模式 > 讀取主餐 > 抓產品分類
  loadMainDishForEdit(categoryId: number) {
    this.httpClientService.getApi(`product/list?categoryId=${categoryId}`)
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
