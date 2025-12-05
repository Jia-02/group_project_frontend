// 桌位列表
export interface tables {
  table_id: string;
  table_status: boolean;
  capacity: number;
  position_x: number;
  position_y: number;
}

// 訂位
export interface reservation {
  id?: number; // 唯一 ID
  newDate?: string;
  reservationDate: string; // "2025-11-29"
  reservationTime: string; // "14:00:00"
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


// 單一桌位與該桌位預約列表（後端結構）
export interface tableReservationByDate {
  tableId: string;
  capacity: number;
  tableDailyStatus: boolean;
  reservations: reservation[];
}

// 後端 API 的頂層回傳結構
export interface apiResponse {
  code: number;
  message: string;
  reservationDate: string;
  reservationAndTableByDateList: tableReservationByDate[];
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


// 菜單分類
export interface categoryDto {
  categoryId: number;
  categoryType: string;
  workstationId: number;
}


// 產品列表api
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


