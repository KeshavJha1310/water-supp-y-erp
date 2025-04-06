import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { OrderServiceService } from '../../../../../../core/services/order-service.service';

@Component({
  selector: 'app-new-order-model',
  standalone: false,
  templateUrl: './new-order-model.component.html',
  styleUrl: './new-order-model.component.scss'
})
export class NewOrderModelComponent implements OnInit, OnDestroy {

  constructor(
    private orderService: OrderServiceService,
    public dialogRef: MatDialogRef<NewOrderModelComponent>
  ) { }
  selectedPrice: number = 25;
  prices = [25, 30, 40, 50];
  addressStruct = { buildingName: '', wing: '', roomNo: '' }
  newOrder = { bottlesRequired: 1, deliveryAddress: this.formattedAddress, urgencyFlag: 'low' };
  buildingList = [];
  wingOptions: string[] = [];


  ngOnInit(): void {

    this.wingOptions = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

    this.orderService.orders$.subscribe((orders: any) => {
      console.log(orders);
      // this.pendingOrders = orders.filter((order: any) => order.status === 'pending');
    })

    this.orderService.getAllBuildings().subscribe((buildingNames: any) => {
      if (buildingNames.length > 0)
        this.buildingList = buildingNames
      console.log(this.buildingList);
    })

    // this.orderService.clearAllOrders();
  }

  async addOrder() {
    this.newOrder.deliveryAddress = this.formattedAddress
    if (!this.newOrder.bottlesRequired || !this.newOrder.deliveryAddress) {
      alert('Please fill all fields!');
      return;
    }
    const totalAmount = this.newOrder.bottlesRequired * this.selectedPrice
    console.log(totalAmount)
    const res = await this.orderService.addNewOrder(this.newOrder.deliveryAddress, this.newOrder.bottlesRequired, this.newOrder.urgencyFlag, this.selectedPrice, totalAmount)
    console.log(res);
    this.newOrder = { bottlesRequired: 1, deliveryAddress: '', urgencyFlag: 'low' };
    this.dialogRef.close(this.newOrder);
  }

  // get formattedAddress():string {
  //   if(!this.addressStruct.buildingName||!this.addressStruct.wing||!this.addressStruct.roomNo){
  //     return '';
  //   }
  //   return `${this.addressStruct.buildingName || ''}-${this.addressStruct.wing || ''}-${this.addressStruct.roomNo || ''}`.trim();
  // }

  get formattedAddress(): string {
    const { buildingName, wing, roomNo } = this.addressStruct;

    if (!buildingName || !wing || !roomNo) {
      return '';
    }

    const formattedBuildingName = buildingName.toLowerCase().replace(/\s+/g, '-');



    return `${formattedBuildingName}-${wing}-${roomNo}`.trim();
  }


  getUrgencyFlag(flag: string) {
    this.newOrder.urgencyFlag = flag
  }

  selectPrice(price: number) {
    this.selectedPrice = price;
  }

  increaseBottles() {
    this.newOrder.bottlesRequired++;
  }

  decreaseBottles() {
    if (this.newOrder.bottlesRequired > 1) {
      this.newOrder.bottlesRequired--;
    }
  }


  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {

  }

}
