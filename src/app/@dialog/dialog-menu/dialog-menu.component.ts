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

  productListRes!: productListRes;

  readonly dialogRef = inject(MatDialogRef<DialogMenuComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  // 要先抓API商品的陣列中的商品內容 你必須要從商品的內容中抓到id最後面的那個 然後在+1

  ngOnInit(): void {
    //  從service抓分類的id
    this.productListRes = this.dataService.productListRes;
  }

  // 取消
  onNoClick() {
    this.dialogRef.close();
  }

  // 確定
  onAddClick() {
    // 檢查必填欄位
    if (!this.selectedFile || !this.productList.productName || !this.productList.productPrice || !this.productList.productDescription) {
      alert('必填沒填');
    }

    this.httpClientService.postApi('http://localhost:8080/product/add', this.productList)
      .subscribe((res) => {
        if(this.productListRes.categoryId){

        }
        console.log(res);

      })
  }



  addProduct() {

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
