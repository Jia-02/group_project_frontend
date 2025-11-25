export interface reservation {
  newDate: string;
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


  export interface tables {
    table_id: string;
    table_status: string;
    capacity: number;
    position_x: number;
    position_y: number;
  }


  // 繼承
export interface scheduleItem extends reservation {
  id: number;
  endTime: string;
  useTime: number; // 以分鐘計的時長
}

// 時間插槽介面，用於左側時間標籤
export interface timeLabel {
  time: string;
  display: string;
  hour: number;
}
