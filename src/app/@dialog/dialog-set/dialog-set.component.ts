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
  categoryList: categoryDto[] = []; // 給「主餐分類」選單用
  sideDishList: productList[] = []; // 給「附餐」選單用
  drinkDishList: productList[] = []; // 給「飲料」選單用
  mainDishList: productList[] = []; // 給「主餐」選單用
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
    mainId: 0,
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
  }

  // 取消
  onNoClick() {
    this.dialogRef.close();
  }


  // 確定
  onAddClick() {
    // 檢查圖片 (新增模式必填；編輯模式若沒選檔案代表不換圖，可以過)
    if (!this.isEditMode && !this.selectedFile) {
      alert('新增商品必須上傳圖片');
      return;
    }

    // 處理圖片路徑邏輯 (如果有選新檔案才處理)
    if (this.selectedFile) {
      const folderMap: { [key: string]: string } = {
        '套餐': 'set',
        '飲料': 'drink',
        '義大利麵': 'pasta',
        '點心': 'snack',
        '披薩': 'pizza',
        '火鍋': 'hotpot',
        '炸物': 'fried'
      };

      const folderName = folderMap[this.currentCategoryType]; // 加個預設避免報錯
      this.optionVo.settingImg = `/${folderName}/${this.selectedFile.name}`;
    }

    const details = []; // 組裝 settingDetail

    // 主餐
    if (this.selections.mainId) {
      details.push({
        categoryId: this.selections.mainCatId, // 主餐的分類 ID
        detailList: [{ productId: Number(this.selections.mainId) }]
      });
    }

    // 附餐 (找該產品原本的 categoryId)
    if (this.selections.sideId > 0) {
      let foundCategoryId = 0;

      for (let i = 0; i < this.sideDishList.length; i++) {
        if (this.sideDishList[i].productId == this.selections.sideId) {
          foundCategoryId = this.sideDishList[i].categoryId;
          break;
        }
      }

      if (foundCategoryId > 0) {
        details.push({
          categoryId: foundCategoryId,
          detailList: [{ productId: Number(this.selections.sideId) }]
        });
      }
    }

    // 飲料 (找該產品原本的 categoryId)
    if (this.selections.drinkId > 0) {
      let foundCategoryId = 0;

      for (let i = 0; i < this.drinkDishList.length; i++) {
        if (this.drinkDishList[i].productId == this.selections.drinkId) {
          foundCategoryId = this.drinkDishList[i].categoryId;
          break; // 找到就停止
        }
      }

      if (foundCategoryId > 0) {
        details.push({
          categoryId: foundCategoryId,
          detailList: [{ productId: Number(this.selections.drinkId) }]
        });
      }
    }

    // 將組裝好的內容放進 Payload
    this.optionVo.settingDetail = details;

    // 送出
    if (this.isEditMode) {
      this.updateProduct(); // >更新
    } else {
      this.addProduct(); // >新增
    }
  }


  // 新增套餐
  addProduct() {



    this.httpClientService.postApi('http://localhost:8080/setting/add', this.optionVo)
      .subscribe((res: any) => {
        if (res.code == 200) {
          console.log(res);
          this.dialogRef.close(true);
        }
      });
  }

  // 更新套餐
  updateProduct() {

  }


  // 切換主餐分類，抓該分類的產品
  onMainCategoryChange() {
    this.mainDishList = []; // 清空舊的主餐列表
    this.selections.mainId = 0; // 重置選中的主餐

    if (this.selections.mainCatId > 0) {
      this.httpClientService.getApi(`http://localhost:8080/product/list?categoryId=${this.selections.mainCatId}`)
        .subscribe((res: any) => {
          if (res.code == 200 && res.productList) {
            // 過濾已上架產品
            this.mainDishList = res.productList.filter((p: any) => p.productActive === true);
          }
        });
    }
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
