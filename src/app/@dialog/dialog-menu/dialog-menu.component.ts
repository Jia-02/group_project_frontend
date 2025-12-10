import { productListRes } from './../../@interface/interface';
import { DataService } from './../../@service/data.service';
import { HttpClientService } from './../../@service/http-client.service';
import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { categoryDto, productList } from '../../@interface/interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-menu',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    CommonModule
  ],
  templateUrl: './dialog-menu.component.html',
  styleUrl: './dialog-menu.component.scss'
})
export class DialogMenuComponent {

  constructor(
    private httpClientService: HttpClientService,
    private dataService: DataService) { }

  selectedFile: File | null = null; // 儲存使用者選中的檔案
  categoryDto: categoryDto = {
    categoryId: 0,
    categoryType: '',
    workstationId: 2
  };

  productList: productList = {
    productId: 0,
    productName: '',
    productPrice: 0,
    productActive: true, // 預設為啟用
    productDescription: '',
    imageUrl: '',
    productNote: '',
    categoryId: 0
  };
  isEditMode: boolean = false;

  readonly dialogRef = inject(MatDialogRef<DialogMenuComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  ngOnInit(): void {

    this.categoryDto.categoryType = this.data.categoryType;
    this.isEditMode = this.data.isEditMode || false;  // 判斷是否為編輯模式

    if (this.isEditMode && this.data.product) {
      this.productList = { ...this.data.product };
      this.productList.categoryId = this.data.categoryId;
    } else {
      // 新增模式 初始化
      this.productList.categoryId = this.data.categoryId;
      this.searchProduct(this.productList.categoryId);
    }
  }

  // 取消
  onNoClick() {
    this.dialogRef.close();
  }

  // 確定
  onAddClick() {
    if (!this.productList.productName || !this.productList.productPrice || !this.productList.productDescription) {
      alert('必填欄位(名稱、價格、描述)不可為空');
      return;
    }

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

      const currentType = this.categoryDto.categoryType;
      const folderName = folderMap[currentType]; // 加個預設避免報錯
      this.productList.imageUrl = `/${folderName}/${this.selectedFile.name}`;
    }

    if (this.isEditMode) {
      this.updateProduct(); // >更新
    } else {
      this.addProduct(); // >新增
    }
  }


  // 新增商品
  addProduct() {
    this.countNextProductId();

    this.httpClientService.postApi('http://localhost:8080/product/add', this.productList)
      .subscribe((res: any) => {
        console.log(res);
        if (res.code == 200) {
          this.dialogRef.close(true);
        }
      });
  }

  // 更新商品
  updateProduct() {
    this.httpClientService.postApi('http://localhost:8080/product/update', this.productList)
      .subscribe((res: any) => {
        if (res.code == 200) {
          console.log(res);

          this.dialogRef.close(true);
        } else {
          console.log(res);

        }
      });
  }


  // 找商品
  searchProduct(categoryId: number) {
    const apiUrl = `http://localhost:8080/product/list?categoryId=${categoryId}`;
    this.httpClientService.getApi(apiUrl).subscribe((res: any) => {
      if (res.code == 200) {
        this.dataService.productListRes.productList = res.productList;
        console.log('DataService 更新完成，目前數量:', this.dataService.productListRes.productList.length);
      }
    })
  }

  // 計算商品id
  countNextProductId() {
    const allProducts = this.dataService.productListRes.productList;

    let maxId = 0;
    // 迴圈該分類下產品ID的最大值加1
    for (let product of allProducts) {
      if (product.productId && product.productId > maxId) {
        maxId = product.productId;
      }
    }
    this.productList.productId = maxId + 1;
    console.log('算出來的新 ID 是:', this.productList.productId);
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
