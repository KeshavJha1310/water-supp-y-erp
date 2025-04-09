import { Component ,
  HostListener,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
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
  adminId:any;
  newOrder = { bottlesRequired: null, deliveryAddress: '', urgencyFlag: 'low' };


  constructor(
    private userService : UserService,
    private orderService : OrderServiceService
  ){

  }
  
  async ngOnInit(): Promise<void> {
  const user = await this.userService.getCurrentUser();
  if(user?.uid){
    const deliveryPersondetails = await this.userService.getUserData();
    this.adminId = deliveryPersondetails?.adminId;
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

markAsDelivered(event: MatCheckboxChange, selectedOrder: any) {
  if (event.checked) {
    Swal.fire({
      title: 'Enter Returned Bottles',
      input: 'number',
      inputPlaceholder: 'Returned bottles (optional)',
      inputAttributes: {
        min: '0',
        step: '1'
      },
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (value === '' || Number(value) >= 0) {
          return undefined;
        }
        return 'Enter a valid number!';
      }
    }).then((returnResult) => {
      if (!returnResult.isConfirmed) {
        event.source.checked = false;
        return;
      }

      const returnedBottles = Number(returnResult.value || 0);

      Swal.fire({
        title: 'Is the payment completed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
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
            cancelButtonText: 'Cancel'
          }).then((paymentModeResult) => {
            if (paymentModeResult.isConfirmed) {
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
                cancelButtonText: 'Back'
              }).then((amountResult) => {
                if (amountResult.isConfirmed) {
                  this.orderService.markDelivered(
                    this.adminId,
                    returnedBottles,
                    selectedOrder,
                    'Paid',
                    paymentModeResult.value,
                    amountResult.value
                  );
                } else {
                  event.source.checked = false;
                }
              });
            } else {
              event.source.checked = false;
            }
          });
        } else {
          this.orderService.markDelivered(
            this.adminId,
            returnedBottles,
            selectedOrder,
            'Not Paid',
            '',
            0
          );
        }
      });
    });
  }
}

ngOnDestroy(): void {
  
}
}
