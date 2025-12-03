import { HttpClientService } from './../../@service/http-client.service';
import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { categoryDto, productDto, productListResponse } from '../../@interface/interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog-menu',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule
  ],
  templateUrl: './dialog-menu.component.html',
  styleUrl: './dialog-menu.component.scss'
})
export class DialogMenuComponent {

  constructor(
    private httpClientService: HttpClientService
  ) { }

  categoryDto: categoryDto = {
    categoryId: 0,
    categoryType: '',
    workstationId: 2
  };

  productDto: productDto = {
    productId: 1,
    productName: '',
    productPrice: 0,
    productActive: true, // 預設為啟用
    productDescription: '',
    imageUrl: '',
    productNote: '',
  };


  selectedFile: File | null = null; // 儲存使用者選中的檔案

  readonly dialogRef = inject(MatDialogRef<DialogMenuComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  ngOnInit(): void {
    if (this.data && this.data.categoryType) {
      this.categoryDto.categoryType = this.data.categoryType;
      this.categoryDto.categoryId = this.data.categoryId;
    }
  }

  // 取消
  onNoClick() {
    this.dialogRef.close();
  }

  // 處理圖片檔案選擇
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      this.selectedFile = fileList[0];
    } else {
      this.selectedFile = null;
    }
  }

  // 確定
  onAddClick() {
    // 檢查必填欄位
    if (!this.selectedFile || !this.productDto.productName || !this.productDto.productPrice) {
      return;
    }

    // 步驟一：上傳圖片以取得 URL

    const imageFormData = new FormData();
    imageFormData.append('imageUrl', this.selectedFile!, this.selectedFile!.name);

    const finalProductDto = {
      productId: this.productDto.productId,
      productName: this.productDto.productName,
      productPrice: this.productDto.productPrice,
      productActive: this.productDto.productActive,
      productDescription: this.productDto.productDescription,
      productNote: this.productDto.productNote,
      imageUrl: this.productDto.imageUrl,
      categoryId: this.categoryDto.categoryId
    };

    // 發送純 JSON 請求給 /product/add
    this.httpClientService.postApi('http://localhost:8080/product/add', finalProductDto)
      .subscribe({
        next: (res) => {
          console.log(res);

          this.dialogRef.close(res); // 成功後關閉
        }
      });
  }

}


