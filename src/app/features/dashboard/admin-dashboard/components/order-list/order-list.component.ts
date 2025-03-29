import { Component ,OnInit } from '@angular/core';
import { OrderServiceService } from '../../../../../core/services/order-service.service';
import { MatDialog } from '@angular/material/dialog';
import { NewOrderModelComponent } from './new-order-model/new-order-model.component';
@Component({
  selector: 'app-order-list',
  standalone:false,
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit{


  newOrder = { bottlesRequired: null, deliveryAddress: '', urgencyFlag: 'low' };
  pendingOrders: any[] = [];

  constructor(
    private orderService:OrderServiceService,
    public dialog: MatDialog
  ){}

  ngOnInit(): void {
    this.orderService.orders$.subscribe((orders:any)=>{
      console.log(orders);
      // this.pendingOrders = orders.filter((order: any) => order.status === 'pending');
    })
  }

  openOrderDialog() {
    const dialogRef = this.dialog.open(NewOrderModelComponent, {
      width: '700px', // Adjust width as needed
      disableClose: true, // Prevent closing on outside click
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New Order:', result); // Handle order submission
      }
    });
  }


}
