import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    MatIcon,
    FormsModule,
  ],
  templateUrl: './product-detail-dialog.component.html',
  styleUrl: './product-detail-dialog.component.scss'
})
export class ProductDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ProductDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FullProductDetail,
  ) { }

  public quantity: number = 1;
  public currentPrice: number = 0;
  public currentSelections: Map<number, Set<string>> = new Map();

  ngOnInit(): void {
    this.data.optionList.forEach(group => {
      const selectedSet = new Set<string>();

      if (group.maxSelect === 1 && group.optionDetail.length > 0) {
      selectedSet.add(group.optionDetail[0].option);
    }

      this.currentSelections.set(group.optionId, selectedSet);
    });

    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    let optionsPrice = 0;

    this.data.optionList.forEach(group => {
      const selectedOptions = this.currentSelections.get(group.optionId);

      if (selectedOptions) {
        group.optionDetail.forEach(item => {
          if (selectedOptions.has(item.option)) {
            optionsPrice += item.addPrice;
          }
        });
      }
    });

    this.currentPrice = (this.data.productPrice + optionsPrice) * this.quantity;
  }

  incrementQuantity(): void {
    this.quantity++;
    this.calculateTotalPrice();
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.calculateTotalPrice();
    }
  }

  addToCart(): void {
    const detailList: DetailOption[] = [];
    let optionsPrice = 0;

    this.data.optionList.forEach(group => {
        const selectedOptions = this.currentSelections.get(group.optionId);

        if (selectedOptions) {
            group.optionDetail.forEach(optionItem => {
                if (selectedOptions.has(optionItem.option)) {
                    detailList.push({
                        option: optionItem.option,
                        addPrice: optionItem.addPrice
                    });
                    optionsPrice += optionItem.addPrice;
                }
            });
        }
    });

    const itemPricePerUnit = this.data.productPrice + optionsPrice;
    const orderDetailsPrice = itemPricePerUnit * this.quantity;

    const orderDetailItem = {
        itemPricePerUnit: itemPricePerUnit,
        orderDetailsPrice: orderDetailsPrice,
        settingId: 0,
        quantity: this.quantity,
        orderDetails: [
            {
                categoryId: this.data.categoryId,
                productId: this.data.productId,
                productName: this.data.productName,
                productPrice: this.data.productPrice,
                detailList: detailList
            }
        ],
        // mealStatus: "製作中"
    };

    this.dialogRef.close(orderDetailItem);
}

}

interface Option {
  option: string;
  addPrice: number;
}

interface OptionDetail {
  optionId: number;
  optionName: string;
  maxSelect: number;
  optionDetail: Option[];
}

interface FullProductDetail {
  categoryId: number;
  productId: number;
  productName: string;
  productPrice: number;
  categoryType: string;
  productDescription: string;
  productNote: string;
  imageUrl: string;
  productActive: boolean;
  workstationId: number;
  quantity: number,
  optionList: OptionDetail[];
}

interface CartItemPayload {
  orderDetailsPrice: number;
  settingId: number;
  quantity: number;
  orderDetails: OrderDetailProduct[];
  // mealStatus?: string;
}

interface OrderDetailProduct {
  categoryId: number;
  productId: number;
  productName: string;
  productPrice: number;
  detailList: DetailOption[];
}

interface DetailOption {
  option: string;
  addPrice: number;
}
