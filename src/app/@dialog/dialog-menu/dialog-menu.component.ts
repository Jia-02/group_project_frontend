import { DataService } from './../../@service/data.service';
import { HttpClientService } from './../../@service/http-client.service';
import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { productList } from '../../@interface/interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-menu',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './dialog-menu.component.html',
  styleUrl: './dialog-menu.component.scss'
})
export class DialogMenuComponent {

  constructor(
    private httpClientService: HttpClientService,
    private dataService: DataService) { }

  readonly dialogRef = inject(MatDialogRef<DialogMenuComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  selectedFile: File | null = null; // 儲存使用者選中的檔案
  categoryType: string = '';

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



  ngOnInit(): void {
    this.categoryType = this.data.categoryType;
    this.productList.categoryId = this.data.categoryId;
    this.isEditMode = this.data.isEditMode || false;  // 判斷是否為編輯模式

    if (this.isEditMode && this.data.product) {
      this.productList = { ...this.data.product }; // 深入拷貝
      this.productList.categoryId = this.data.categoryId;
    } else {
      // 新增模式
      this.countNextProductId();
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

      const folderName = folderMap[this.categoryType]; // 加個預設避免報錯
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
          this.dialogRef.close(true);
        }
      });
  }


  // 計算商品id
countNextProductId() {
    const categories = this.dataService.allCategoryDto;

    // 如果完全沒分類，就從 1 開始
    if (!categories || categories.length == 0) {
      this.productList.productId = 1;
      return;
    }

    let maxId = 0;
    let completedCount = 0;
    const totalCount = categories.length;

    for (const cat of categories) {
      this.httpClientService.getApi(`http://localhost:8080/product/list?categoryId=${cat.categoryId}`)
        .subscribe((res: any) => {
          if (res.code == 200 && res.productList) {
            for (const p of res.productList) {
              const pid = Number(p.productId);
              if (pid > maxId) {
                maxId = pid; // 更新最大值
              }
            }
          }
          completedCount++;
          if (completedCount == totalCount) {
            this.productList.productId = maxId + 1;
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
