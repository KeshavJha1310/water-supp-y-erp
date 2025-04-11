import { Component,OnInit,OnDestroy } from '@angular/core';
import { OrderServiceService } from '../../../../../core/services/order-service.service';
@Component({
  selector: 'app-customer-management',
  standalone:false,
  templateUrl: './customer-management.component.html',
  styleUrl: './customer-management.component.scss'
})
export class CustomerManagementComponent implements OnInit , OnDestroy {

  showDailyCustomers:boolean = false;
  showAllCustomers:boolean = true;
  showMonthlyCustomers:boolean = false;
  size =window.innerWidth ;
  isMobile = window.innerWidth < 768
  allCustomers:any = [];
  dailyCustomers:any = [];
  monthlyCustomers:any = [];

  constructor(
    private orderService: OrderServiceService,
  ) {
   
  }

ngOnInit(): void {

  this.orderService.getAllCustomersWithOrderDetails().subscribe((data: any) => {
    this.allCustomers = data;
    console.log('All customers:', this.allCustomers);
  });

}

openCustomerDialog(customer: any): void {
  console.log('Customer dialog opened for:', customer);
  // Add logic to open a dialog or perform the desired action
}

ngOnDestroy(): void {
  
}
}
