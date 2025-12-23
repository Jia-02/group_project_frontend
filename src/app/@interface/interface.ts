// 桌位列表
export interface tableList {
  tableId: string;
  tableStatus: boolean;
  capacity: number;
  position_x: number;
  position_y: number;
}

// 預約(api)
export interface reservationResponse {
  code: number;
  message: string;
  reservationDate: string;
  reservationAndTableByDateList: reservationAndTableByDateList[];
}

// 預約
export interface reservation {
  reservationId?: number;
  newDate?: string;
  reservationDate: string;
  reservationTime: string;
  reservationPhone: string;
  reservationName: string;
  reservationCount: number;
  reservationAdultCount: number;
  reservationChildCount: number;
  reservationStatus: boolean;
  reservationNote: string;
  childSeat: number;
  tableId: string;
}

// 單一桌位與該桌位預約列表
export interface reservationAndTableByDateList {
  tableId: string;
  capacity: number;
  tableDailyStatus: boolean;
  reservations: reservation[];
}

// 繼承 (排程項目)
export interface scheduleItem extends reservation {
  endTime: string;
  useTime: number; // 以分鐘計的時長
}

// 時間軸
export interface timeLabel {
  time: string;
  display: string;
  hour: number;
}

export interface calendarDay {
  date: Date;
  hasEvent: boolean;
  isCurrentMonth: boolean
}

// 分類
export interface categoryDto {
  categoryId: number;
  categoryType: string;
  workstationId: number;
}

// 產品列表 (api)
export interface productListRes {
  code: number;
  message: string;
  categoryId: number;
  productList: productList[];
}

// 產品內容
export interface productList {
  productId: number;
  productName: string;
  productPrice: number;
  productActive: boolean;
  productDescription: string;
  imageUrl: string;
  productNote: string;
  categoryId: number;
}

// 單個選項細節
export interface optionDetail {
  option: string;
  addPrice: number;
}

// 客製化選項（新增 / 更新 / 查詢）
export interface customizedOption {
  optionId: number;
  optionName: string;
  maxSelect: number;
  categoryId: number;
  optionDetail: optionDetail[];
}

// API 回傳
export interface optionListResponse {
  code: number;
  message: string;
  categoryId: number;
  optionVoList: customizedOption[];
}

// 套餐
export interface setResponse {
  code: number;
  message: string;
  categoryId: number;
  optionVoList: optionVo[];
}

export interface optionVo {
  settingId: number;
  settingName: string;
  settingPrice: number;
  settingImg: string;
  settingActive: boolean;
  settingNote: string;
  settingDetail: settingDetail[];
}

export interface settingDetail {
  categoryId: number;
  categoryType: string;
  detailList: detailItem[];
}

export interface detailItem {
  productId: number;
  productName: string;
}
