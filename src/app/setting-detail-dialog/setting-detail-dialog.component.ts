import { Component, OnInit, Inject, inject } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
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

  public currentSelections: Map<number, Map<number, Set<string>>> = new Map();
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
    this.data.settingDetail.forEach(category => {
      const optionMap = new Map<number, Set<string>>();

      category.optionList.forEach(optionGroup => {
        const selectedSet = new Set<string>();
        if (optionGroup.maxSelect === 1 && optionGroup.optionDetail.length > 0) {
          selectedSet.add(optionGroup.optionDetail[0].option);
        }

        optionMap.set(optionGroup.optionId, selectedSet);
      });

      this.currentSelections.set(category.categoryId, optionMap);
    });

    this.calculateTotalPrice();
  }

  isCategoryValid(categoryId: number): boolean {
    return this.selectedMainProduct.has(categoryId);
  }

  isOptionGroupValid(optionGroup: OptionDetail): boolean {
    const selectedSet = this.currentSelections.get(optionGroup.optionId);
    return !!selectedSet && selectedSet.size > 0;
  }

  toggleOption(categoryId: number, optionId: number, option: string) {
    const set = this.currentSelections.get(categoryId)?.get(optionId);
    if (!set) return;

    set.has(option) ? set.delete(option) : set.add(option);
    this.calculateTotalPrice();
  }

  selectRadio(categoryId: number, optionId: number, option: string) {
    const set = this.currentSelections.get(categoryId)?.get(optionId);
    if (!set) return;

    set.clear();
    set.add(option);
    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    let optionsPrice = 0;

    // 逐一跑每個餐點
    this.data.settingDetail.forEach(category => {

      const optionMap = this.currentSelections.get(category.categoryId);
      if (!optionMap) return;

      // 跑該餐點底下的每個 optionGroup
      category.optionList.forEach(optionGroup => {

        const selectedSet = optionMap.get(optionGroup.optionId);
        if (!selectedSet) return;

        optionGroup.optionDetail.forEach(item => {
          if (selectedSet.has(item.option)) {
            optionsPrice += item.addPrice;
          }
        });
      });
    });

    const totalCategoryGroups = this.data.settingDetail.length;
    const selectedProductCount = this.selectedMainProduct.size;

    this.isSelectionComplete =
      totalCategoryGroups > 0 &&
      totalCategoryGroups === selectedProductCount;

    // 套餐原價
    const basePrice = this.data.settingPrice;

    // 一套餐總價
    const pricePerUnit = basePrice + optionsPrice;

    // 總價格
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

  private getOptionsByCategory(categoryId: number): DetailOption[] {
    const result: DetailOption[] = [];
    const optionMap = this.currentSelections.get(categoryId);
    if (!optionMap) return result;

    const category = this.data.settingDetail.find(c => c.categoryId === categoryId);
    if (!category) return result;

    category.optionList.forEach(group => {
      const selectedSet = optionMap.get(group.optionId);
      if (!selectedSet) return;

      group.optionDetail.forEach(opt => {
        if (selectedSet.has(opt.option)) {
          result.push({
            option: opt.option,
            addPrice: opt.addPrice
          });
        }
      });
    });

    return result;
  }

  getSelectionSummary(): SelectionSummary[] {
    const summary: SelectionSummary[] = [];

    this.data.settingDetail.forEach(categoryGroup => {
      // 1. 取得主產品
      const selectedProductId = this.selectedMainProduct.get(categoryGroup.categoryId);
      const selectedProduct = categoryGroup.detailList.find(p => p.productId === selectedProductId);

      if (selectedProduct) {
        const options: DetailOption[] = this.getOptionsByCategory(categoryGroup.categoryId);

        summary.push({
          categoryType: categoryGroup.categoryType,
          productName: selectedProduct.productName,
          options: options
        });
      }
    });
    return summary;
  }

  addToCart(): void {

    const orderDetails: OrderDetailProduct[] = [];
    let totalOptionPrice = 0;

    this.data.settingDetail.forEach(categoryGroup => {

      const selectedProductId = this.selectedMainProduct.get(categoryGroup.categoryId);
      if (!selectedProductId) return;

      const product = categoryGroup.detailList.find(p => p.productId === selectedProductId);
      if (!product) return;

      const options = this.getOptionsByCategory(categoryGroup.categoryId);

      options.forEach(o => totalOptionPrice += o.addPrice);

      orderDetails.push({
        categoryId: categoryGroup.categoryId,
        productId: product.productId,
        productName: product.productName,
        productPrice: product.productPrice,
        detailList: options
      });
    });

    const pricePerUnit = this.data.settingPrice + totalOptionPrice;

    const orderDetailItem = {
      pricePerUnit: pricePerUnit,
      settingId: this.data.settingId,
      quantity: this.quantity,
      orderDetailsPrice: pricePerUnit * this.quantity,
      orderDetails
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

interface SelectionSummary {
  categoryType: string;
  productName: string;
  options: DetailOption[];
}
