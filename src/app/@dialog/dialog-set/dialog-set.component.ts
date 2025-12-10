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

  constructor(
    private httpClientService: HttpClientService) { }

  readonly dialogRef = inject(MatDialogRef<DialogSetComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
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

  ngOnInit(): void {


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


  // 新增套餐
  addProduct() {
    this.httpClientService.postApi('http://localhost:8080/setting/add', this.categoryDto)
      .subscribe((res: any) => {
        if (res.code == 200) {
          console.log(res);
        }
      })
  }

  // 更新套餐
  updateProduct() {

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
