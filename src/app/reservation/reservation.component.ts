import { HttpClientService } from './../@service/http-client.service';
import { DataService } from './../@service/data.service';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogReservationComponent } from '../@dialog/dialog-reservation/dialog-reservation.component';
import { tables, tableReservationByDate, reservation, scheduleItem, timeLabel, apiResponse } from '../@interface/interface';
import { DialogDeleteComponent } from '../@dialog/dialog-delete/dialog-delete.component';

@Component({
  selector: 'app-reservation',
  imports: [
    CommonModule,
  ],
  templateUrl: './reservation.component.html',
  styleUrl: './reservation.component.scss'
})


export class ReservationComponent {

  constructor(
    private dataService: DataService,
    private httpClientService: HttpClientService
  ) { }

  // signal = 會自動通知 HTML 重新更新的變數
  currentMonth: WritableSignal<Date> = signal(new Date()); // 存目前日曆顯示的月份
  selectedDay: WritableSignal<Date> = signal(new Date()); // 存使用者目前選擇的日期
  currentDayReserve: WritableSignal<scheduleItem[]> = signal([]); // 存選中日期的所有預約項目，以 scheduleItem 儲存 (用於排程顯示)
  selectedReservationDetail: WritableSignal<scheduleItem | null> = signal(null); // 存使用者點擊的單筆預約詳情
  dayNames: string[] = ['日', '一', '二', '三', '四', '五', '六']; // 星期
  monthWeeks: Date[][] = []; // 存6 週 x 7 天的月曆

  // 排程圖區塊
  readonly HOUR_HEIGHT_PX = 45;   // 每小時區塊對應的像素高度
  readonly DEFAULT_DURATION_MINUTES = 120;   // 預設每筆預約的持續時間(min)
  readonly ACTIVITY_VERTICAL_MARGIN = 10; // 每筆預約上下間隔
  readonly DISPLAY_START_HOUR = 10; // 排程圖顯示的開始時間（從 10:00 開始）
  readonly ALLOWED_START_HOURS = [10, 12, 14, 16, 18, 20]; // 可預約時段限制
  timeLabels: timeLabel[] = [];  // 排程左側時間軸
  tables = signal<tables[]>([]); // 儲存當前選中日期的桌位列表及其狀態 (是否開放、容量)

  readonly dialog = inject(MatDialog);


  ngOnInit() {
    // 日曆及時間軸
    this.timeLabelsColumns();
    this.calendar(this.currentMonth());
    // 將今天的時間部分歸零，只保留日期部分
    let today = new Date();
    let todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    this.selectedDay.set(todayZero); // 預設選擇為今天

    // 取得今天的預約資料並載入
    this.findDataAndLoad(todayZero);
  }


  // ==================== 左側日曆 =======================

  // 日曆(6週)
  calendar(date: Date): void {
    let year = date.getFullYear(); // 取年份
    let month = date.getMonth(); // 取月份
    let firstDayOfMonth = new Date(year, month, 1); // 找這個月的第一天（2025/3/1）
    let startDayOfWeek = firstDayOfMonth.getDay(); // 找這個月第一天是星期幾 (0:日, 1:一 ...)
    let startDate = new Date(firstDayOfMonth); // 這個月的第一天
    startDate.setDate(startDate.getDate() - startDayOfWeek); // 把日期往前推 N 天 (1-6=-5)

    // [[Date, Date, Date, ... (7天)], [Date, Date, Date, ... (7天)], ...]
    let weeks: Date[][] = []; // 7天的陣列，共6週
    let currentLoopDate = new Date(startDate); // 這個月的第一天
    for (let i = 0; i < 6; i++) { // 日曆要顯示6週，跑6次迴圈
      let week: Date[] = []; // 一週的陣列
      for (let j = 0; j < 7; j++) { // 一週7天
        week.push(new Date(currentLoopDate));
        currentLoopDate.setDate(currentLoopDate.getDate() + 1); // 日期加1天
      }
      weeks.push(week); // 一週填完放入weeks
    }
    this.monthWeeks = weeks;
    this.fetchReservationsForMonth();
  }

  // 切換到上個月
  prevMonth(): void {
    // 更新 currentMonth Signal 為上個月的第一天
    this.currentMonth.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));  // 目前月份減 1，變成上個月的第一天
    this.calendar(this.currentMonth());
  }

  // 切換到下個月
  nextMonth(): void {
    // 更新 currentMonth Signal 為下個月的第一天
    this.currentMonth.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); // 目前月份加 1，變成上個月的第一天
    this.calendar(this.currentMonth());
  }

  // 設定星期幾 (傳中文星期名稱)
  getDayName(date: Date): string {
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return dayNames[date.getDay()];
  }

  // 預載入日曆中所有日期的預約資料
  fetchReservationsForMonth(): void {
    // monthWeeks 陣列中的所有日期（共 6 週 * 7 天 = 42 個日期）跑迴圈
    for (let week of this.monthWeeks) {
      for (let day of week) {
        this.findDataAndLoad(day);
      }
    }
  }

  // 選擇日曆上的某一天
  selectDay(day: Date): void {
    this.selectedDay.set(day); // 更新選定日期 Signal
    this.loadActivities(day); // 載入該日期的活動和桌位狀態
    this.selectedReservationDetail.set(null); // 清除右側詳情面板

    // 判斷若點選日期不在當月，則自動切換月份
    if (!this.isSameMonth(day, this.currentMonth())) {
      this.currentMonth.set(new Date(day.getFullYear(), day.getMonth(), 1));
      this.calendar(this.currentMonth());
    }
  }

  // 顯示預約的詳細資訊
  showReservationDetail(item: scheduleItem): void {
    this.selectedReservationDetail.set(item);
  }


  // ==================== 右側排程表 =======================

  // 時間軸
  timeLabelsColumns() {
    this.timeLabels = [];  // 把 timeLabels 清空，重新建立新的時間列表
    // 產生從 DISPLAY_START_HOUR 到 22:00 的時間標籤陣列
    for (let hour = this.DISPLAY_START_HOUR; hour <= 22; hour++) {
      let hourStr = hour.toString().padStart(2, '0'); // padStart: 若只有 1 位數，前面補 0
      let time = hourStr + ":00";
      let display = hourStr + ":00";
      this.timeLabels.push({ time, display, hour });
    }
  }

  // 計算時間區塊TOP的位置 (px)
  getTopPosition(startTime: string): number {
    let [hours, minutes] = startTime.split(':').map(Number); // hours = 18, min = 30
    let totalMin = (hours - this.DISPLAY_START_HOUR) * 60 + minutes; // 計算從顯示開始時間（如 10:00）起的總分鐘數
    let baseTop = totalMin * (this.HOUR_HEIGHT_PX / 60); // 分鐘數 * (每分鐘對應的像素)
    return baseTop + (this.ACTIVITY_VERTICAL_MARGIN / 2);  // 加上下間格
  }

  // 計算預約區塊的高度 (px)
  getHeight(durationMin: number): number {
    let baseHeight = durationMin * (this.HOUR_HEIGHT_PX / 60); // 分鐘數 * (每分鐘對應的像素)
    return baseHeight - this.ACTIVITY_VERTICAL_MARGIN; // 減去上下間隔後的最終高度
  }

  // 計算預約位於的網格欄位
  getTableGridColumn(item: scheduleItem): string {
    let index = this.tables().findIndex(t => t.table_id == item.tableId); // 找到對應的桌位
    let gridStart = index + 2; // 計算網格開始位置 (索引 + 2，因為左側有時間欄位和標頭佔用)
    return `${gridStart} / span 1`; // 回傳 CSS grid-column 字串，讓預約放到對應的直欄
  }

  // 將後端 reservation 轉成 scheduleItem(計算結束時間)
  toSchedule(list: reservation[]): scheduleItem[] {
    return list.map((r, index) => {
      const startTimeHHMM = this.formatTime(r.reservationTime); // 確保格式為 HH:MM
      const duration = this.DEFAULT_DURATION_MINUTES;
      const [sh, sm] = startTimeHHMM.split(':').map(Number);
      const endMinutes = sh * 60 + sm + duration; // 計算總結束分鐘
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;

      return {
        ...r,
        id: r.id,
        reservationTime: startTimeHHMM, // 格式化結束時間為 HH:MM
        endTime: `${endHour.toString().padStart(2, '0')}:${endMin
          .toString().padStart(2, '0')}`,
        useTime: duration // 預約持續時間
      };
    });
  }

  // 切換桌位開放狀態 (在當前選定日期)
  tableAvailabe(t: tables): void {
    const dateStr = this.formatDateStr(this.selectedDay()); // 取得當前選定日期

    // 確保當日資料存在於 Map 中
    if (!this.dataService.tableAvailableByDate.has(dateStr)) {
      // 如果當日沒有桌位狀態紀錄，則從當前 signal 複製一份作為初始狀態
      this.dataService.tableAvailableByDate.set(dateStr, JSON.parse(JSON.stringify(this.tables())));
    }

    let dayTables = this.dataService.tableAvailableByDate.get(dateStr)!;

    // 找到目標桌位，並反轉其 table_status 狀態
    dayTables = dayTables.map(table => {
      if (table.table_id == t.table_id) {
        let newStatus = !table.table_status;
        return { ...table, table_status: newStatus };
      }
      return table;
    });
    this.dataService.tableAvailableByDate.set(dateStr, dayTables);  // 更新 Map 中的快取資料
    this.tables.set(dayTables);  // 更新 signal 以觸發畫面更新
  }

  // 處理DB資料獲取和載入
  findDataAndLoad(date: Date): void {
    const selectedDateStr = this.formatDateStr(date);

    // 檢查 DataService 是否已有該日期的資料
    if (this.dataService.dailyReservations.has(selectedDateStr)) {
      this.loadActivities(date); // 若有，直接載入畫面
      return;
    }

    const url = `http://localhost:8080/reservation/date_list?reservationDate=${selectedDateStr}`;
    this.httpClientService.getApi(url)
      .subscribe({
        next: (res) => {
          const apiRes = res as apiResponse;
          console.log(apiRes);

          if (apiRes.code == 200) {
            // 處理後端回傳的原始資料，轉換成前端 reservation 結構，並同時更新桌位狀態
            const allReservations = this.backendData(apiRes.reservationAndTableByDateList, selectedDateStr);
            for (const r of allReservations) {
              if (!this.dataService.reservation.find(existing => existing.id == r.id)) {
                // 將該日期的預約加入到 DataService 的預約列表中
                this.dataService.reservation.push(r);
              }
            }

            // 將原始 reservation 轉換為用於排程顯示的 scheduleItem
            const dailySchedule = this.toSchedule(allReservations);
            // 將轉換後的排程資料存入快取 (Map)
            this.dataService.dailyReservations.set(selectedDateStr, dailySchedule);
            this.loadActivities(date); // 載入畫面
          }
        }
      });
  }

  // 處理後端數據，更新桌位狀態快取，並回傳 reservation 列表
  backendData(list: tableReservationByDate[], dateStr: string): reservation[] {
    const allReservations: reservation[] = [];
    const initialTables: tables[] = [];

    // 後端回傳的桌位-預約列表跑迴圈
    for (let tableData of list) {
      // 轉換成 tables 介面 (桌位資訊及當日狀態)
      initialTables.push({
        table_id: tableData.tableId,
        capacity: tableData.capacity,
        table_status: tableData.tableDailyStatus,
        position_x: 0,
        position_y: 0,
      });

      // 該桌位下的所有預約跑迴圈
      for (const res of tableData.reservations) {
        // 轉換成 reservation 介面
        const newRes: reservation = {
          id: res.id,
          newDate: dateStr,
          reservationDate: dateStr,
          reservationTime: res.reservationTime,
          reservationPhone: res.reservationPhone,
          reservationName: res.reservationName,
          reservationCount: res.reservationCount,
          reservationAdultCount: res.reservationAdultCount,
          reservationChildCount: res.reservationChildCount,
          reservationStatus: res.reservationStatus,
          reservationNote: res.reservationNote,
          childSeat: res.childSeat,
          tableId: tableData.tableId,
        };
        allReservations.push(newRes);  // 加入所有預約列表
      }
    }
    this.dataService.tableAvailableByDate.set(dateStr, initialTables);  // 將該日期的桌位狀態存入 DataService 的快取
    this.tables.set(initialTables);  // 更新當前畫面的桌位 Signal
    return allReservations;  // 回傳該日期的所有預約
  }


  // 載入選定日期的活動 (同時處理桌位狀態)
  loadActivities(date: Date): void {
    let dateStr = this.formatDateStr(date);
    // 載入當日預約：從快取 Map 取得排程資料
    const dailySchedule = this.dataService.dailyReservations.get(dateStr) || [];
    this.currentDayReserve.set(dailySchedule);
    const dayTables = this.dataService.tableAvailableByDate.get(dateStr);

    if (dayTables) {
      // 若快取有紀錄，直接載入該日期的專屬狀態
      this.tables.set(dayTables);
    } else {
      // 若無快取，則從當前 tables Signal 複製一份作為初始狀態，並存入快取
      const initialTables = JSON.parse(JSON.stringify(this.tables()));
      this.dataService.tableAvailableByDate.set(dateStr, initialTables);
      this.tables.set(initialTables); // 更新畫面顯示
    }
  }


  // ==================== 新增預約 =======================

  // 新增訂位 (點擊排程圖中的格子)
  addReservation(tableId: string, hour: number): void {
    // 檢查是否為過去的日期
    if (this.isPastDay()) {
      return;
    }

    // 檢查是否為今日已過期的時段
    if (this.isToday(this.selectedDay()) && this.isPastHourSlot(hour)) {
      return;
    }

    // 取得目標桌位
    const targetTable = this.tables().find(t => t.table_id == tableId);

    // 檢查桌位是否存在或是否開放
    if (!targetTable || targetTable.table_status !== true)
      return;

    // 檢查是否是營業時間
    if (!this.ALLOWED_START_HOURS.includes(hour)) {
      return;
    }

    // 檢查時段是否已被佔用
    if (!this.isTimeSlotAvailable(tableId, hour)) {
      return;
    }

    const preFillDate = this.formatDateStr(this.selectedDay()); // 取得當前選擇的日期字串 (YYYY-MM-DD)
    const preFillTime = `${hour.toString().padStart(2, '0')}:00`; // 格式化時間 (例如 "12:00")

    // 準備當前桌位列表作為預設狀態
    const defaultTablesForDialog = this.tables().map(t => ({
      table_id: t.table_id,
      table_status: t.table_status,
      capacity: t.capacity
    }));

    // 準備所有日期對應的桌位狀態 (用於 Dialog 中切換日期時的判斷)
    const allTableStatesArray = Array.from(this.dataService.tableAvailableByDate.entries()).map(([date, tables]: [string, tables[]]) => ({
      date: date,
      tables: tables.map(t => ({
        table_id: t.table_id,
        table_status: t.table_status,
        capacity: t.capacity
      }))
    }));

    // 開啟新增預約對話框
    const dialogRef = this.dialog.open(DialogReservationComponent, {
      height: '490px',
      maxWidth: '900px',
      data: {
        tableId: tableId,
        date: preFillDate,
        time: preFillTime,
        allTableStates: allTableStatesArray, // 傳遞所有桌位狀態快取
        defaultTables: defaultTablesForDialog,
        currentDaySchedule: this.currentDayReserve(),
        tableList: this.tables(),
      }
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (!res) return;
      this.addReservateToSchedule(res);
    });
  }

  // 新增預約後更新排程
  addReservateToSchedule(newItem: reservation): void {
    const dateStr = newItem.reservationDate;

    // 確保新預約加入 DataService 的主列表
    if (!this.dataService.reservation.find(r => r.id === newItem.id)) {
      this.dataService.reservation.push(newItem);
    }

    const existingSchedule = this.dataService.dailyReservations.get(dateStr) || [];  // 取得當日現有的排程列表
    const newScheduleItem = this.toSchedule([newItem])[0];  // 將新的 reservation 轉換成 scheduleItem
    // 將新預約加入現有列表
    const updatedSchedule = [...existingSchedule, newScheduleItem];
    this.dataService.dailyReservations.set(dateStr, updatedSchedule);

    // 如果新增的預約屬於目前選擇的日期，則更新畫面顯示
    if (dateStr == this.formatDateStr(this.selectedDay())) {
      this.currentDayReserve.set(updatedSchedule);
    }
  }


  // ==================== 修改預約 =======================

  // 修改預約
  updateReserve() {
    const detail = this.selectedReservationDetail();

    // 檢查是否有選中的訂單詳細資訊
    if (!detail) {
      return;
    }

    // 準備當前桌位列表作為預設狀態
    const defaultTablesForDialog = this.tables().map(t => ({
      table_id: t.table_id,
      table_status: t.table_status,
      capacity: t.capacity
    }));

    // 準備所有日期對應的桌位狀態 (用於 Dialog 中切換日期時的判斷)
    const allTableStatesArray = Array.from(this.dataService.tableAvailableByDate.entries()).map(([date, tables]: [string, tables[]]) => ({
      date: date,
      tables: tables.map(t => ({
        table_id: t.table_id,
        table_status: t.table_status,
        capacity: t.capacity
      }))
    }));

    // 開啟修改預約對話框，並傳入現有的預約詳情
    const dialogRef = this.dialog.open(DialogReservationComponent, {
      height: '490px',
      maxWidth: '900px',
      data: {
        tableId: detail.tableId,
        date: detail.reservationDate,
        time: detail.reservationTime,
        existingReservation: detail,  // 傳入現有訂單
        allTableStates: allTableStatesArray,
        defaultTables: defaultTablesForDialog,
        currentDaySchedule: this.currentDayReserve(),
        tableList: this.tables(),
      }
    });

    dialogRef.afterClosed().subscribe((res: reservation | 'deleted') => {
      if (!res) return;

      if (res == 'deleted') {
        // 如果 Dialog 中執行了刪除操作
        this.removeReservationFromSchedule(detail);
      } else {
        // 如果 Dialog 中執行了修改操作
        this.updateReservateInSchedule(res);
      }
    });
  }

  // 修改預約後，更新DataService 和 Signal (包含跨日移動的處理)
  updateReservateInSchedule(updatedItem: reservation): void {
    // 找出原始資料，記錄舊的日期
    const index = this.dataService.reservation.findIndex(r => r.id == updatedItem.id);
    if (index == -1) return;

    const oldItem = this.dataService.reservation[index];
    const oldDateStr = oldItem.reservationDate;
    const newDateStr = updatedItem.reservationDate;

    this.dataService.reservation[index] = updatedItem; // 更新 DataService 的預約主列表
    const updatedScheduleItem = this.toSchedule([updatedItem])[0];   // 準備好新的 scheduleItem

    // 更新 DataService 的快取 Map
    if (oldDateStr == newDateStr) {
      // 如果日期沒有變更 (在當日排程陣列中找到並取代)
      const dailySchedule = [...(this.dataService.dailyReservations.get(newDateStr) || [])];
      const scheduleIndex = dailySchedule.findIndex(item => item.id === updatedItem.id);
      if (scheduleIndex !== -1) {
        dailySchedule[scheduleIndex] = updatedScheduleItem;
        this.dataService.dailyReservations.set(newDateStr, dailySchedule);
      }
    } else { // 或是日期變更了 (跨日移動)
      // 從舊日期的快取移除
      let oldDaySchedule = [...(this.dataService.dailyReservations.get(oldDateStr) || [])];
      oldDaySchedule = oldDaySchedule.filter(item => item.id !== updatedItem.id);
      this.dataService.dailyReservations.set(oldDateStr, oldDaySchedule);

      // 加入新日期的快取
      let newDaySchedule = [...(this.dataService.dailyReservations.get(newDateStr) || [])];
      newDaySchedule.push(updatedScheduleItem);
      this.dataService.dailyReservations.set(newDateStr, newDaySchedule);
    }

    this.loadActivities(this.selectedDay());  // 重新載入當前選中日期的活動
    // 更新右側排程表
    if (newDateStr === this.formatDateStr(this.selectedDay())) {
      this.selectedReservationDetail.set(updatedScheduleItem);
    } else {
      this.selectedReservationDetail.set(null); // 如果移動到別天，則清空詳情
    }
  }



  // ==================== 刪除預約 =======================

  // 處理刪除預約
  deleteReserve(): void {
    const detail = this.selectedReservationDetail();
    if (detail) {
      const dialogRef = this.dialog.open(DialogDeleteComponent, {
        data: detail  // 傳入選中的訂單資料
      });

      dialogRef.afterClosed().subscribe(result => {
        // 如果後端刪除成功
        if (result == 'success') {
          this.removeReservationFromSchedule(detail); // 更新狀態
        }
      });
    }
  }

  // 刪除預約後，更新 DataService 和 Signal
  removeReservationFromSchedule(itemToRemove: scheduleItem): void {
    const dateStr = itemToRemove.reservationDate;

    this.dataService.reservation = this.dataService.reservation
      .filter(r => r.id !== itemToRemove.id);  // 從 DataService 的預約主列表移除

    // 從 DataService 的 dailyReservations Map 快取移除
    let dailySchedule = this.dataService.dailyReservations.get(dateStr) || [];
    dailySchedule = dailySchedule.filter(item => item.id !== itemToRemove.id);
    this.dataService.dailyReservations.set(dateStr, dailySchedule);

    // 如果是目前選中的日期，更新畫面顯示 Signal
    if (dateStr == this.formatDateStr(this.selectedDay())) {
      this.currentDayReserve.set(dailySchedule);
    }
    this.selectedReservationDetail.set(null); // 清空詳細資訊面板
  }






  // 檢查預約是否已過期 (結束時間是否 <= 當前時間)
  isReservationPast(item: scheduleItem): boolean {
    if (!item) return false;

    const now = new Date();
    let dateStr: string;
    let timeStr: string;

    // 取得或推導預約日期 (若遺失則使用選定日期)
    if (!item.reservationDate) {
      dateStr = this.formatDateStr(this.selectedDay());
    } else {
      dateStr = item.reservationDate;
    }

    // 取得或推導預約結束時間 (若遺失則根據預設時長計算)
    if (!item.endTime) {
      const [sh, sm, ss] = item.reservationTime.split(':').map(Number);
      const endMinutes = sh * 60 + sm + this.DEFAULT_DURATION_MINUTES;
      const endHour = Math.floor(endMinutes / 60);
      const endMin = endMinutes % 60;
      timeStr = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
    } else {
      timeStr = item.endTime.substring(0, 5); // 只取 HH:mm
    }

    if (!dateStr || !timeStr) {
      return false;
    }

    // 創建準確的預約結束時間
    const [resYear, resMonth, resDay] = dateStr.split('-').map(Number);
    const [endHour, endMin] = timeStr.split(':').map(Number);

    // JS 的 month 是 0-indexed，所以要減 1
    const reservationEnd = new Date(resYear, resMonth - 1, resDay, endHour, endMin, 0);
    return reservationEnd <= now;  // 如果預約結束時間 <= 當前時間，則為過期
  }

  // 檢查給定小時是否為允許的預約起始時間
  isAllowedHour(hour: number): boolean {
    return this.ALLOWED_START_HOURS.includes(hour);
  }


  // 檢查指定桌位在給定小時是否有活動覆蓋
  isTimeSlotAvailable(tableId: string, startHour: number, ignoreItem?: scheduleItem): boolean {
    const newReservationDuration = this.DEFAULT_DURATION_MINUTES;
    const startTimeInMinutes = startHour * 60;

    const endTimeInMinutes = startTimeInMinutes + newReservationDuration; // 新預約的結束時間（分鐘）
    const reservations = this.currentDayReserve(); // 取得當天所有預約資料

    // 檢查當天所有的現有活動
    for (let item of reservations) {
      // 如果提供 ignoreItem，則跳過該預約
      if (ignoreItem && item.tableId == ignoreItem.tableId && item.reservationTime == ignoreItem.reservationTime) {
        continue;
      }

      if (item.tableId == tableId) {
        // 解析現有活動的開始時間（分鐘）
        const [rStartHour, rStartMinute] = item.reservationTime.split(':').map(Number);
        const rStartTimeInMinutes = rStartHour * 60 + rStartMinute;

        // 現有活動的結束時間（分鐘）
        const rEndTimeInMinutes = rStartTimeInMinutes + item.useTime;

        // 檢查時間重疊：如果兩個區間有交集，則返回 false
        if (rStartTimeInMinutes < endTimeInMinutes && startTimeInMinutes < rEndTimeInMinutes) {
          return false; // 時段已被佔用
        }
      }
    }
    return true; // 時段可用
  }

  // 檢查選定的日期是否是過去的日期 (早於今天)
  isPastDay(): boolean {
    const today = new Date();
    // 將今天和選定日期進行日期比較
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedStart = new Date(this.selectedDay().getFullYear(), this.selectedDay().getMonth(), this.selectedDay().getDate());
    return selectedStart < todayStart;  // 如果選定的日期比今天早，則為過去的日期
  }

  // 檢查該時段是否已過期 (用於當天)
  isPastHourSlot(startHour: number): boolean {
    const now = new Date();
    const selectedDayStart = new Date(this.selectedDay().getFullYear(), this.selectedDay().getMonth(), this.selectedDay().getDate());
    const slotStart = new Date(selectedDayStart);
    slotStart.setHours(startHour, 0, 0, 0);
    return slotStart <= now;  // 如果時段開始時間早於或等於現在時間，則為過期
  }

  // 判斷兩個日期是否為同一天
  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
  }

  // 判斷兩個日期是否在同一個月份
  isSameMonth(d1: Date, d2: Date): boolean {
    return d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear();
  }

  // 判斷給定日期是否為今天
  isToday(date: Date): boolean {
    const today = new Date();
    return this.isSameDate(date, today);
  }

  // 判斷給定日期是否有預約活動 (用於日曆上的標示)
  hasActivity(date: Date): boolean {
    const key = this.formatDateStr(date);
    return (this.dataService.dailyReservations.get(key)?.length ?? 0) > 0;
  }

  // 日期轉字串
  formatDateStr(date: Date): string {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // padStart: 若只有 1 位數，前面補 0
    let day = date.getDate().toString().padStart(2, '0');
    return year + "-" + month + "-" + day;
  }

  // 將 HH:MM:SS 格式轉為 HH:MM
  formatTime(time: string): string {
    if (!time) return '';
    // 只取前 5 個字元 (HH:MM)，這樣就移除了秒數
    return time.length >= 5 ? time.substring(0, 5) : time;
  }

  // 找座標
  // move(e: MouseEvent) {
  //   e.clientX;
  //   e.clientY;
  //   console.log(e.clientX, e.clientY);
  // }
}
