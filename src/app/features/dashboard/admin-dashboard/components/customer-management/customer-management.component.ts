import { Component,OnInit,OnDestroy } from '@angular/core';
import { OrderServiceService } from '../../../../../core/services/order-service.service';
import { MatDialog } from '@angular/material/dialog';
import { EditCustomerModelComponent } from './edit-customer-model/edit-customer-model.component';
import { UserService } from '../../../../../core/services/user.service';
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
    public dialog: MatDialog,
    private userService: UserService
  ) {
   
  }

ngOnInit(): void {

  this.orderService.getAllCustomersWithOrderDetails().subscribe((data: any) => {
    this.allCustomers = data;
  
    // Filter daily customers
    this.dailyCustomers = this.allCustomers.filter(
      (customer: any) => customer.typeOfCustomer === 'daily'
    );
  
    // Filter monthly customers
    this.monthlyCustomers = this.allCustomers.filter(
      (customer: any) => customer.typeOfCustomer === 'monthly'
    );
  
    // Filter other customers where typeOfCustomer is false, null, undefined, or empty
    this.allCustomers = this.allCustomers.filter(
      (customer: any) => customer.typeOfCustomer !== 'daily' && customer.typeOfCustomer !== 'monthly'
    );
  
    console.log('Daily:', this.dailyCustomers);
    console.log('Monthly:', this.monthlyCustomers);
    console.log('Others:', this.allCustomers);
  });
  

}

openCustomerDialog(customer: any): void {
  console.log('Customer dialog opened for:', customer);
  const dialogRef = this.dialog.open(EditCustomerModelComponent, {
    width: '500px',
    disableClose: true,
    data: customer // Pass the customer data to the dialog
  }); 

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      console.log('New Order:', result); // Handle order submission
    }
  });
  // Add logic to open a dialog or perform the desired action
}

ngOnDestroy(): void {
  
}
}
