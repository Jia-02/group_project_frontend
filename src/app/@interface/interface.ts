export interface reservation {
  id: number;
  newDate: string;
  reservationDate: string;
  reservationTime: string; // 應為 "HH:mm:ss"
  reservationPhone: string;
  reservationName: string;
  reservationCount: number;
  reservationAdultCount: number;
  reservationChildCount: number;
  reservationStatus: boolean;
  reservationNote: string;
  childSeat: number;
  tableId: string; // 從後端數據結構中知道這是必要的
}

export interface tables {
  table_id: string;
  table_status: '開放' | '關閉' | string; // 調整為允許 '開放'/'關閉' 字串
  capacity: number;
  position_x: number;
  position_y: number;
}


// 繼承
export interface scheduleItem extends reservation {
  endTime: string;
  useTime: number; // 以分鐘計的時長
}

// 時間插槽介面，用於左側時間標籤
export interface timeLabel {
  time: string;
  display: string;
  hour: number;
}

