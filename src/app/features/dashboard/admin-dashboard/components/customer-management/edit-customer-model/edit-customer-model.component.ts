import { Component ,OnInit ,OnDestroy, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrderServiceService } from '../../../../../../core/services/order-service.service';
@Component({
  selector: 'app-edit-customer-model',
  standalone: false,
  templateUrl: './edit-customer-model.component.html',
  styleUrl: './edit-customer-model.component.scss'
})
export class EditCustomerModelComponent implements OnInit , OnDestroy {
  constructor(
    private orderService : OrderServiceService,
    public dialogRef: MatDialogRef<EditCustomerModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any

    ){
    
    }
    phneNumber: Number = 0;
    typeOfCustomer: string = 'daily';
    customerName: string = '';
    customerId: string = '';
    ngOnInit(): void {
      if (this.data) {
        this.customerId = this.data; 
        console.log('Received customer data:', this.data);
      }
    }
    submitCustomerDetails() {
      const res = this.orderService.updateCustomerDetails(this.customerId, this.customerName, this.phneNumber, this.typeOfCustomer);
      console.log(res);
      this.dialogRef.close(this.data);
    }
    ngOnDestroy(): void {   

    }

}
