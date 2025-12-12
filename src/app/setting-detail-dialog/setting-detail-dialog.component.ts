import { Component, OnInit, Inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { DataService } from '../@service/data.service';

@Component({
  selector: 'app-setting-detail-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    MatIcon,
    FormsModule,
  ],
  templateUrl: './setting-detail-dialog.component.html',
  styleUrl: './setting-detail-dialog.component.scss'
})
export class SettingDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SettingDetailDialogComponent>,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: FullSettingDetail,
  ) { }

  public quantity: number = 1;
  public currentPrice: number = 0;

  public currentSelections: Map<number, Set<string>> = new Map();
  public selectedMainProduct: Map<number, number> = new Map();
  public selectedMainProductPrice: Map<number, number> = new Map();
  public isSelectionComplete: boolean = false;

  public settingOptionList: OptionDetail[] = [];

  ngOnInit(): void {
    if (this.data.settingDetail && this.data.settingDetail.length > 0) {
      this.settingOptionList = this.data.settingDetail[0].optionList || [];
    }

    this.settingOptionList.forEach(group => {
      this.currentSelections.set(group.optionId, new Set<string>());
    });

    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    let optionsPrice = 0;

    this.settingOptionList.forEach(group => {
      const selectedOptions = this.currentSelections.get(group.optionId);
      if (selectedOptions) {
        group.optionDetail.forEach(item => {
          if (selectedOptions.has(item.option)) {
            optionsPrice += item.addPrice;
          }
        });
      }
    });
    const totalCategoryGroups = this.data.settingDetail.length;
    const selectedProductCount = this.selectedMainProduct.size;

    this.isSelectionComplete = totalCategoryGroups > 0 && totalCategoryGroups === selectedProductCount;

    // 套餐原價
    const basePrice = this.data.settingPrice;
    // 一套餐總價
    const pricePerUnit = basePrice + optionsPrice;
    // 填入總價格
    this.currentPrice = pricePerUnit * this.quantity;
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

  handleMainProductChange(categoryGroup: setting, productItem: Detail): void {

    this.selectedMainProduct.set(categoryGroup.categoryId, productItem.productId);

    this.selectedMainProductPrice.set(categoryGroup.categoryId, productItem.productPrice);

    this.calculateTotalPrice();
  }

  handleOptionRadioChange(group: OptionDetail, optionItem: Option): void {
    const selectedOptions = this.currentSelections.get(group.optionId);
    if (!selectedOptions) return;

    selectedOptions.clear();
    selectedOptions.add(optionItem.option);
    this.calculateTotalPrice();
  }

  handleOptionCheckboxChange(group: OptionDetail, optionItem: Option, isChecked: boolean): void {
    const selectedOptions = this.currentSelections.get(group.optionId);

    if (!selectedOptions) {
      return;
    }

    if (isChecked) {
      if (selectedOptions.size < group.maxSelect) {
        selectedOptions.add(optionItem.option);
      }
    } else {
      selectedOptions.delete(optionItem.option);
    }

    this.calculateTotalPrice();
  }

  addToCart(): void {
    const settingDetailList: DetailOption[] = [];
    let settingOptionsPrice = 0;

    this.settingOptionList.forEach(group => {
      const selectedOptions = this.currentSelections.get(group.optionId);
      if (selectedOptions) {
        group.optionDetail.forEach(optionItem => {
          if (selectedOptions.has(optionItem.option)) {
            settingDetailList.push({
              option: optionItem.option,
              addPrice: optionItem.addPrice
            });
            settingOptionsPrice += optionItem.addPrice;
          }
        });
      }
    });

    const orderDetails: OrderDetailProduct[] = [];

    this.data.settingDetail.forEach(categoryGroup => {
      const selectedProductId = this.selectedMainProduct.get(categoryGroup.categoryId);

      if (selectedProductId) {
        const selectedProduct = categoryGroup.detailList.find(d => d.productId === selectedProductId);

        if (selectedProduct) {
          orderDetails.push({
            categoryId: categoryGroup.categoryId,
            productId: selectedProduct.productId,
            productName: selectedProduct.productName,
            productPrice: selectedProduct.productPrice,
            detailList: []
          });
        }
      }
    });

    if (orderDetails.length > 0) {
      orderDetails[0].detailList.push(...settingDetailList);
    }


    const itemPricePerUnit = this.data.settingPrice + settingOptionsPrice;
    const orderDetailsPrice = itemPricePerUnit * this.quantity;

    const orderDetailItem = {
      orderDetailsPrice: orderDetailsPrice,
      settingId: this.data.settingId,

      orderDetails: orderDetails,

      itemDetail: {
        quantity: this.quantity,
        pricePerUnit: itemPricePerUnit,
        orderDetails: orderDetails
      }
    };

    this.dialogRef.close(orderDetailItem);
  }
}

interface FullSettingDetail {
  categoryId: number;
  settingId: number;
  settingName: string;
  settingPrice: number;
  settingImg: string;
  settingActive: boolean;
  settingNote: string;
  quantity: number;
  settingDetail: setting[];
}

interface setting {
  categoryId: number;
  categoryType: string;
  workstationId: number;
  detailList: Detail[];
  optionList: OptionDetail[];
}
interface OptionDetail {
  optionId: number;
  optionName: string;
  maxSelect: number;
  optionDetail: Option[];
}

interface Option {
  option: string;
  addPrice: number;
}

interface Detail {
  productId: number;
  productName: string;
  productPrice: number;
  productDescription: string;
  productNote: string;
  imageUrl: string;
}

interface OrderDetailItem {
  orderDetailsPrice: number;
  settingId: number;
  orderDetails: OrderDetailProduct[];
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
