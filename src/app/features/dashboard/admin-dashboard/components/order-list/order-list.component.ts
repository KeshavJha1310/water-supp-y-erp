import { Component ,OnInit } from '@angular/core';
import { OrderServiceService } from '../../../../../core/services/order-service.service';
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
    private orderService:OrderServiceService
  ){}

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
   this.newOrder = { bottlesRequired: null, deliveryAddress: '', urgencyFlag: 'low' };
  }

  markAsCompleted(arg0: any) {
    console.log(arg0)
    }

}
