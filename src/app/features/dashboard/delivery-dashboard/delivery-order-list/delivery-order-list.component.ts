import { Component ,
  HostListener, ChangeDetectorRef,
  OnInit ,OnDestroy } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import Swal from 'sweetalert2';
import { OrderServiceService } from '../../../../core/services/order-service.service';

@Component({
  selector: 'app-delivery-order-list',
standalone:false,
  templateUrl: './delivery-order-list.component.html',
  styleUrl: './delivery-order-list.component.scss'
})
export class DeliveryOrderListComponent implements OnInit , OnDestroy {
  isMenuOpen: boolean = false;
  isMobile = window.innerWidth < 921;
  isTab = window.innerWidth < 900;
  pendingOrders: any[] = [];
  bottleReturned:any = 0;

  constructor(
    private cdRef: ChangeDetectorRef,
    private userService : UserService,
    private orderService : OrderServiceService
  ){

  }
  
  async ngOnInit(): Promise<void> {
  const user = await this.userService.getCurrentUser();
  if(user?.uid){
    const deliveryPersondetails = await this.userService.getUserData();
    this.orderService.listenToOrders(deliveryPersondetails?.adminId);
  }

  this.orderService.orders$.subscribe((orders:any)=>{
    console.log(orders)
    this.pendingOrders = orders.filter((order: any) => 
      order.status === "pending"
    );

  })
}

getUrgencyColor(urgency: string): string {
  switch (urgency.toLowerCase()) {
    case 'high': return 'rgb(255, 169, 169,0.66)';  
    case 'medium': return 'rgba(255, 145, 0, 0.4)'; 
    case 'low': return 'rgb(201 ,255, 201)';    
    default: return 'white'; 
  }
}

  markAsDelivered(event: MatCheckboxChange,selectedOrder: any) {
    if(event.checked){
      Swal.fire({
        title: 'Is the payment completed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          // Ask for payment mode if payment is completed
          Swal.fire({
            title: 'Select Payment Mode',
            input: 'radio',
            inputOptions: {
              online: 'Online',
              cash: 'Cash'
            },
            inputValidator: (value) => {
              if (!value) {
                return 'You need to select a payment mode!';
              }
              return undefined;
            },
            showCancelButton: true,
            cancelButtonText: 'Cancel' // Back button to return to the previous step
          }).then((paymentModeResult) => {
            if (paymentModeResult.isConfirmed) {
              // If payment mode is selected, ask for the amount paid
              Swal.fire({
                title: 'Enter Amount Paid',
                input: 'number',
                inputPlaceholder: 'Enter the amount',
                inputAttributes: {
                  min: '0',
                  step: '1'
                },
                inputValidator: (value) => {
                  if (!value || isNaN(Number(value)) || Number(value) <= 0) {
                    return 'Please enter a valid amount!';
                  }
                  return undefined;
                },
                showCancelButton: true,
                cancelButtonText: 'Back' // Back button to return to the previous step
              }).then((amountResult) => {
                if (amountResult.isConfirmed) {
                  // Log the final details
                  this.orderService.markDelivered(
                    this.bottleReturned,
                    selectedOrder,
                    'Paid',
                    paymentModeResult.value,
                    amountResult.value
                  )
                }else{
                  event.source.checked = false;
                }
              });
            } else if (paymentModeResult.dismiss === Swal.DismissReason.cancel) {
              // User clicked "Back", show the payment completion dialog again
              // this.markAsDelivered(,selectedOrder);
              event.source.checked = false;
            }
          });
        } else {
          // If payment is not completed
          this.orderService.markDelivered(
            this.bottleReturned,
            selectedOrder,
            'Not Paid',
            '',
            0
          )
        }
      });
    }
  }

ngOnDestroy(): void {
  
}
}
