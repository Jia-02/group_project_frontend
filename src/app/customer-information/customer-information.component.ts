import { Component } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customer-information',
  imports: [FormsModule],
  templateUrl: './customer-information.component.html',
  styleUrl: './customer-information.component.scss'
})
export class CustomerInformationComponent {
  public ordersType: string = '';
  public customerName: string = '';
  public customerPhone: string = '';
  public customerAddress: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.ordersType = this.route.snapshot.queryParamMap.get('ordersType') || '';
    console.log('當前的 ordersType:', this.ordersType);
  }
}
