import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Http } from '../@service/http';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-analazy',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './analazy.html',
  styleUrl: './analazy.scss',
})
export class Analazy {
   name = '';
  phone = '';
  userId: number = 0;
  deliveryId: number = Number(localStorage.getItem('userId') || 0);
  allTasks: any[] = [];

  weekStart!: Date;
  weekEnd!: Date;
  weekTotal = 0;

  weekLabels = ['一','二','三','四','五','六','日'];
  weekSalary: number[] = [0,0,0,0,0,0,0];
  dateRangeStr: string = '';

  chart!: Chart;




   constructor(
    private router: Router,
    private httpService: Http,
    private dialog: MatDialog
  ) {}
  ngOnInit() {
    const phone = localStorage.getItem('phone');
    const name = localStorage.getItem('name');
    const userId = localStorage.getItem('userId');

    if (!phone || !name|| !userId) {
      this.router.navigate(['/login']);
      alert("未登入");
      return;
    }

    this.phone = phone;
    this.name = name;
    this.deliveryId = Number(userId);

    this.loadTasks();
  }


  loadTasks() {
    this.httpService.getAllByDeliveryid(this.deliveryId).subscribe(res => {
      if(res.code === 200 && res.dtaskList) {
        this.allTasks = res.dtaskList;
        this.setCurrentWeek();
      }
    });
  }

  setCurrentWeek() {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  this.weekStart = new Date(today);
  this.weekStart.setDate(today.getDate() + diffToMonday);
  this.weekStart.setHours(0, 0, 0, 0); //  週一 00:00:00

  this.weekEnd = new Date(this.weekStart);
  this.weekEnd.setDate(this.weekStart.getDate() + 6);
  this.weekEnd.setHours(23, 59, 59, 999); //  週日 23:59:59

  this.dateRangeStr =
    `${this.formatDate(this.weekStart)} - ${this.formatDate(this.weekEnd)}`;

  this.calculateWeekSalary();
  this.renderChart();
}


  changeWeek(offset: number) {
    this.weekStart.setDate(this.weekStart.getDate() + offset*7);
    this.weekEnd.setDate(this.weekEnd.getDate() + offset*7);
    this.dateRangeStr = `${this.formatDate(this.weekStart)} - ${this.formatDate(this.weekEnd)}`;
    this.calculateWeekSalary();
    this.updateChart();
  }
calculateWeekSalary() {
  this.weekSalary = [0,0,0,0,0,0,0];
  this.weekTotal = 0;

  this.allTasks.forEach(task => {
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0); //  關鍵

    if (taskDate >= this.weekStart && taskDate <= this.weekEnd) {
      const dayIndex = (taskDate.getDay() + 6) % 7;
      this.weekSalary[dayIndex] += task.money;
      this.weekTotal += task.money;
    }
  });
}


  formatDate(d: Date) {
    return `${d.getMonth()+1}/${d.getDate()}`;
  }


// 計算每一天的「星期 + 日期」
getWeekDates(): string[] {
  const dates: string[] = [];
  const d = new Date(this.weekStart);
  const weekNames = ['星期一','星期二','星期三','星期四','星期五','星期六','星期日']; // 週一=一
  for (let i = 0; i < 7; i++) {
    const dayIndex = (d.getDay() + 6) % 7; // 將週一=0, 週日=6
    dates.push(`${weekNames[dayIndex]} ${d.getMonth()+1}/${d.getDate()}`);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}


renderChart() {
  const ctx: any = document.getElementById('barChart');
  if (!ctx) return;

  this.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: this.getWeekDates(), // X 軸顯示實際日期
      datasets: [{
        label: '每日薪資',
        data: this.weekSalary,
        backgroundColor: '#00a6fb'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          title: { display: true, text: '日期' }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: '薪資($)' }
        }
      }
    }
  });
}

updateChart() {
  if (this.chart) {
    this.chart.data.datasets[0].data = this.weekSalary;
    this.chart.data.labels = this.getWeekDates();
    this.chart.update();
  }
}



  // 登出
Signout() {
    localStorage.removeItem('name');
    localStorage.removeItem('phone');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
  }



