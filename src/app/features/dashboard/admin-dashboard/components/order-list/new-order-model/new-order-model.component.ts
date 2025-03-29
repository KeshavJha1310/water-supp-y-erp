import { Component , OnInit ,OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { OrderServiceService } from '../../../../../../core/services/order-service.service';

@Component({
  selector: 'app-new-order-model',
  standalone:false,
  templateUrl: './new-order-model.component.html',
  styleUrl: './new-order-model.component.scss'
})
export class NewOrderModelComponent implements OnInit , OnDestroy {

  constructor(
    private orderService:OrderServiceService,
    public dialogRef: MatDialogRef<NewOrderModelComponent>) {}

  newOrder = { bottlesRequired: 1, deliveryAddress: '', urgencyFlag: 'low' };

  ngOnInit(): void {
    this.orderService.orders$.subscribe((orders:any)=>{
      console.log(orders);
      // this.pendingOrders = orders.filter((order: any) => order.status === 'pending');
    })
  }

  async addOrder(){
    if (!this.newOrder.bottlesRequired || !this.newOrder.deliveryAddress) {
      alert('Please fill all fields!');
      return;
    }
   const res = await this.orderService.addNewOrder(this.newOrder.deliveryAddress,this.newOrder.bottlesRequired,this.newOrder.urgencyFlag)
   console.log(res);
   this.newOrder = { bottlesRequired: 1, deliveryAddress: '', urgencyFlag: 'low' };
   this.dialogRef.close(this.newOrder);
  }
  
increaseBottles() {
  this.newOrder.bottlesRequired++;
}

decreaseBottles() {
  if (this.newOrder.bottlesRequired > 1) {
    this.newOrder.bottlesRequired--;
  }
}

markAsCompleted(arg0: any) {
  console.log(arg0)
  }
  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {

  }

}
