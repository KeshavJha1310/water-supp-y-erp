import { Component ,OnInit } from '@angular/core';
import { OrderServiceService } from '../../../../../core/services/order-service.service';
import { MatDialog } from '@angular/material/dialog';
import { NewOrderModelComponent } from './new-order-model/new-order-model.component';
import { UserService } from '../../../../../core/services/user.service';
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
    private userService:UserService,
    public dialog: MatDialog
  ){}

  async ngOnInit(): Promise<void> {
    const user = await this.userService.getCurrentUser();
    if(user?.uid){
      console.log(user?.uid)
      this.orderService.listenToOrders(user?.uid);
    }
    this.orderService.orders$.subscribe((orders:any)=>{
      console.log(orders);
      // this.pendingOrders = orders.filter((order: any) => order.status === 'pending');
    })
  }

  openOrderDialog() {
    const dialogRef = this.dialog.open(NewOrderModelComponent, {
      width: '400px', // Adjust width as needed
      disableClose: true, // Prevent closing on outside click
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New Order:', result); // Handle order submission
      }
    });
  }

  markAsCompleted(arg0: any) {
    console.log(arg0)
    }

}
