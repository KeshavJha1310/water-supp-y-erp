import { Component ,OnInit } from '@angular/core';
import { OrderServiceService } from '../../../../../core/services/order-service.service';
import { MatDialog } from '@angular/material/dialog';
import { NewOrderModelComponent } from './new-order-model/new-order-model.component';
import { UserService } from '../../../../../core/services/user.service';
import Swal from 'sweetalert2';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-order-list',
  standalone:false,
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit{


  newOrder = { bottlesRequired: null, deliveryAddress: '', urgencyFlag: 'low' };
  pendingOrders: any[] = [];
  completedOrders:any[] = [];
  deliveredOrders:any[] = [];
  showPending:boolean = true;
  showDelivered:boolean = false;
  showCompleted:boolean = false;
  bottleReturned:any = 0;
  size =window.innerWidth ;
  isMobile = window.innerWidth < 768
  adminId:any;
  constructor(
    private orderService:OrderServiceService,
    private userService:UserService,
    public dialog: MatDialog
  ){}

  async ngOnInit(): Promise<void> {
    const user = await this.userService.getCurrentUser();
    if(user?.uid){
      console.log(user?.uid)
      this.adminId = user?.uid
      this.orderService.listenToOrders(user?.uid);
    }
    this.orderService.orders$.subscribe((orders:any)=>{
      this.pendingOrders = orders.filter((order: any) => 
        order.status === "pending"
      );
      this.completedOrders = orders.filter((order: any) => order.status === "completed");
      this.deliveredOrders = orders.filter((order: any) => order.status === "delivered");
      console.log(this.deliveredOrders)
    })
  }

  openOrderDialog() {
    const dialogRef = this.dialog.open(NewOrderModelComponent, {
      width: '500px', // Adjust width as needed
      disableClose: true, // Prevent closing on outside click
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('New Order:', result); // Handle order submission
      }
    });
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
        title: 'Proceed with delivery done process?',
        text: 'Are you sure you want to mark this order as delivered?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel'
      }).then((initialResult) => {
        if (initialResult.isConfirmed) {
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
                      if (!value || isNaN(Number(value))) {
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
                        this.bottleReturned,
                        selectedOrder,
                        'Paid',
                        paymentModeResult.value,
                        amountResult.value
                      );
                    } else {
                      event.source.checked = false;
                    }
                  });
                } else if (paymentModeResult.dismiss === Swal.DismissReason.cancel) {
                  event.source.checked = false;
                }
              });
            } else {
              this.orderService.markDelivered(
                this.adminId,
                this.bottleReturned,
                selectedOrder,
                'Not Paid',
                '',
                0
              );
            }
          });
        } else {
          event.source.checked = false;
        }
      });
    }
  }
  
 
  markAsCompleted(event: MatCheckboxChange,selectedOrder: any) {
    if(event.checked){
      if(selectedOrder.payment.done == 'Paid'){
        this.orderService.markOnlyCompleted(selectedOrder.orderId)
      }else{
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
                  cancelButtonText: 'Back' // Back button to return to the previous step
                }).then((amountResult) => {
                  if (amountResult.isConfirmed) {
                    // Log the final details
                    this.orderService.markDelivered(
                      this.adminId,
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
          } 
          // else {
          //   // If payment is not completed
          //   this.orderService.markOrderAsCompleted(
          //     this.bottleReturned,
          //     selectedOrder,
          //     'Not Paid',
          //     '',
          //     0
          //   )
          // }
        });
      }
    }
    }

    deleteOrder(order:any){
      console.log(order)
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!'
      }).then((result) => {
        if (result.isConfirmed) {
          // User clicked "Yes", proceed with deletion
          this.orderService.deleteOrder(order.orderId,order.address,order);
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // User clicked "No", do nothing
          console.log('Deletion cancelled');
        }
      })
    }

}
