import { Component, OnInit, Inject, inject } from '@angular/core';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-setting-detail-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    MatIcon,
    FormsModule,
    MatButtonModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './setting-detail-dialog.component.html',
  styleUrl: './setting-detail-dialog.component.scss'
})
export class SettingDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SettingDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FullSettingDetail,
  ) { }

  public quantity: number = 1;
  public currentPrice: number = 0;

  public currentSelections: Map<number, Set<string>> = new Map();
  public selectedMainProduct: Map<number, number> = new Map();
  public selectedMainProductPrice: Map<number, number> = new Map();
  public isSelectionComplete: boolean = false;

  public allOptionGroups: OptionDetail[] = [];

  ngOnInit(): void {
    this.data.settingDetail.forEach(categoryGroup => {
      if (categoryGroup.detailList && categoryGroup.detailList.length > 0) {
        const defaultProduct = categoryGroup.detailList[0];
        this.selectedMainProduct.set(categoryGroup.categoryId, defaultProduct.productId);
        this.selectedMainProductPrice.set(categoryGroup.categoryId, defaultProduct.productPrice);
      }

      if (categoryGroup.optionList && categoryGroup.optionList.length > 0) {
        this.allOptionGroups.push(...categoryGroup.optionList);
      }
    });

    this.allOptionGroups.forEach(group => {
      const selectedSet = new Set<string>();

      if (group.optionDetail.length > 0) {
        selectedSet.add(group.optionDetail[0].option);
      }

      this.currentSelections.set(group.optionId, selectedSet);
    });

    this.calculateTotalPrice();
  }

  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = true;

  isCategoryValid(categoryId: number): boolean {
    return this.selectedMainProduct.has(categoryId);
  }

toggleSelection(selectedSet: Set<string>, option: string): void {
  if (selectedSet.has(option)) {
    selectedSet.delete(option);
  } else {
    selectedSet.add(option);
  }
}

  calculateTotalPrice(): void {
    let optionsPrice = 0;

    this.allOptionGroups.forEach(group => {
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
    // 一套餐總價 (套餐價 + 所有選項價)
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

  addToCart(): void {
    const settingDetailList: DetailOption[] = [];
    let settingOptionsPrice = 0;

    this.allOptionGroups.forEach(group => {
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
    let isFirstProduct = true;

    this.data.settingDetail.forEach(categoryGroup => {
      const selectedProductId = this.selectedMainProduct.get(categoryGroup.categoryId);

      if (selectedProductId) {
        const selectedProduct = categoryGroup.detailList.find(d => d.productId === selectedProductId);

        if (selectedProduct) {
          const productDetail: OrderDetailProduct = {
            categoryId: categoryGroup.categoryId,
            productId: selectedProduct.productId,
            productName: selectedProduct.productName,
            productPrice: selectedProduct.productPrice,
            detailList: []
          };

          if (isFirstProduct) {
            productDetail.detailList.push(...settingDetailList);
            isFirstProduct = false;
          }

          orderDetails.push(productDetail);
        }
      }
    });

    const itemPricePerUnit = this.data.settingPrice + settingOptionsPrice;
    const orderDetailsPrice = itemPricePerUnit * this.quantity;

    const orderDetailItem = {
      orderDetailsPrice: orderDetailsPrice,
      settingId: this.data.settingId,
      quantity: this.quantity,
      orderDetails: orderDetails,
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

interface CartItemPayload {
  orderDetailsId?: number;
  orderDetailsPrice: number;
  settingId: number;
  quantity: number;
  orderDetails: OrderDetailProduct[];
}

interface OrderDetailProduct {
  categoryId: number;
  productId: number;
  productName: string;
  productPrice: number;
  mealStatus?: string;
  detailList: DetailOption[];
}

interface DetailOption {
  option: string;
  addPrice: number;
}
