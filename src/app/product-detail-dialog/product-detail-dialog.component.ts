import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DataService } from '../data/data.service'; // 導入 DataService

@Component({
  selector: 'app-product-detail-dialog',
  templateUrl: './product-detail-dialog.component.html',
  styleUrl: './product-detail-dialog.component.scss'
})
export class ProductDetailDialogComponent implements OnInit {

  private baseUrl = 'http://localhost:8080';

  public itemDetail: DetailItem | null = null;
  public purchaseQuantity: number = 1;
  public isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<ProductDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.loadItemDetail();
  }

  loadItemDetail(): void {
    let detailUrl: string;

    if (this.data.type === 'product' && this.data.categoryId && this.data.productId) {
      // 單點詳細查詢 getApi：http://localhost:8080/product/detail
      // 雙 key：categoryId , productId
      detailUrl = `${this.baseUrl}/product/detail?categoryId=${this.data.categoryId}&productId=${this.data.productId}`;
    } else if (this.data.type === 'setting' && this.data.settingId) {
      // 套餐詳細查詢 getApi：http://localhost:8080/setting/detail
      // key：settingId
      detailUrl = `${this.baseUrl}/setting/detail?settingId=${this.data.settingId}`;
    } else {
      console.error('彈窗資料無效或缺少必要的 ID。');
      this.isLoading = false;
      return;
    }

    this.dataService.getApi(detailUrl).subscribe((detail: DetailItem) => {
        this.itemDetail = detail;
        this.isLoading = false;
      }
    );
  }

  adjustQuantity(delta: number): void {
    const newQuantity = this.purchaseQuantity + delta;
    if (newQuantity >= 1) {
      this.purchaseQuantity = newQuantity;
    }
  }

  addToCart(): void {
    if (this.itemDetail) {
      console.log('加入購物車:', this.itemDetail.name, '數量:', this.purchaseQuantity);
      this.dialogRef.close();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

interface DetailItem {
  name: string;
  price: number;
  image: string;
  customizations: { name: string, options: string[] }[];
}

interface DialogData {
  type: 'product' | 'setting';
  categoryId?: number;
  productId?: number;
  settingId?: number;
}
