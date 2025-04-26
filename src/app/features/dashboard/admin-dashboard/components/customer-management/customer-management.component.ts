import { Component,OnInit,OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { OrderServiceService } from '../../../../../core/services/order-service.service';
import { MatDialog } from '@angular/material/dialog';
import { EditCustomerModelComponent } from './edit-customer-model/edit-customer-model.component';
import { UserService } from '../../../../../core/services/user.service';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-customer-management',
  standalone:false,
  templateUrl: './customer-management.component.html',
  styleUrl: './customer-management.component.scss'
})
export class CustomerManagementComponent implements OnInit , OnDestroy {
  @ViewChild('invoiceContainer') invoiceContainer!: ElementRef;

  showDailyCustomers:boolean = false;
  showAllCustomers:boolean = true;
  showMonthlyCustomers:boolean = false;
  size =window.innerWidth ;
  isMobile = window.innerWidth < 768
  allCustomers:any = [];
  dailyCustomers:any = [];
  monthlyCustomers:any = [];
  selectedOrders: { [key: string]: any[] } = {};
  selectedDate: { [key: string]: Date | null } = {};


  selectedCustomerOrders: any[] = [];
selectedCustomer: any;
selectedInvoiceMonth: string = '';
invoiceTotals = {
  totalBottles: 0,
  totalPaid: 0,
  balance: 0
};

  constructor(
    private orderService: OrderServiceService,
    public dialog: MatDialog,
    private userService: UserService
  ) {
   
  }

ngOnInit(): void {

  this.orderService.getAllCustomersWithOrderDetails().subscribe((data: any) => {
    this.allCustomers = data.map((customer: any) => ({
      ...customer,
      isEditing: false,       
      newId: customer.id      
    }));  
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
      (customer: any) => customer.typeOfCustomer !== 'monthly'
    );
  
    console.log('Daily:', this.dailyCustomers);
    console.log('Monthly:', this.monthlyCustomers);
    console.log('Others:', this.allCustomers);
  });
  

}

enableEdit(customer: any) {
  customer.isEditing = true;
  customer.newId = customer.id;
}

cancelEdit(customer: any) {
  customer.isEditing = false;
  customer.newId = '';
}

settleAmount(customer: any) {
console.log('Settling amount for customer:', customer);
Swal.fire({
  title: 'Settle Amount',
  text: `Settle amount for customer: ${customer.id}`,
  confirmButtonText: 'Settle All',
  showCancelButton: true,
  cancelButtonText: 'Cancel', 
}).then((result) => {
  if (result.isConfirmed) {
    // if (!isNaN(amount)) {
      // console.log('Settling amount:', amount);
      this.orderService.settleCustomerAmount(customer).then(() => {
        Swal.fire(
          'Settled!',
          `Amount settled for customer: ${customer.id}`,
          'success'
        );
        // Optionally, refresh the customer list or update the view
      }).catch((error: any) => {
        Swal.fire(
          'Error!',
          'There was a problem settling the amount.',
          'error'
        );
        console.error('Error settling amount:', error);
      });
    } 
});
}


deleteCustomer(customer: any) {
  Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to delete customer: ${customer.id}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      console.log('Deleting customer:', customer);
      this.orderService.deleteCustomer(customer.id).then(() => {
        Swal.fire(
          'Deleted!',
          'Customer has been deleted.',
          'success'
        );
        // Optionally, refresh the customer list or remove from the view
      }).catch((error: any) => {
        Swal.fire(
          'Error!',
          'There was a problem deleting the customer.',
          'error'
        );
        console.error('Error deleting customer:', error);
      });
    }
  });
}


saveCustomerId(customer: any) {
  console.log('Saving customer ID:', customer);
  if (!customer.newId || customer.newId === customer.id) {
    this.cancelEdit(customer);
    return;
  }

  console.log('Saving new ID:', customer.newId);
  this.orderService.updateCustomerId(customer.id, customer.newId).then(() => {
    console.log('Customer ID updated successfully!');
    customer.id = customer.newId; // Update the displayed ID
    this.cancelEdit(customer); // Close the edit mode
  } 
  ).catch((error:any) => {
    console.error('Error updating customer ID:', error);
    this.cancelEdit(customer); // Close the edit mode even if there's an error
  });
}



getHighlightClass(customer: any, date: Date): string {
  // Check if the date exists in the customer's orders
  const hasOrder = customer.orders?.some((order: any) => {
    const orderDate = new Date(order.timestamp.seconds * 1000);
    return orderDate.toDateString() === date.toDateString();
  });

  return hasOrder ? 'highlight-date' : '';
}

generateInvoice(customerId: any): void {
  const customer = this.monthlyCustomers.find((c: any) => c.id === customerId.id);

  if (customer && customer.orders?.length > 0) {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;
    const defaultFont = 'times'; // Try 'times', 'courier', or 'arial'

    // --- Helper function to add text ---
    const addText = (text: string, size: number, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
      pdf.setFontSize(size);
      if (isBold) {
        pdf.setFont(defaultFont, 'bold');
      } else {
        pdf.setFont(defaultFont, 'normal');
      }
      let xPosition = margin;
      if (align === 'center') {
        xPosition = pageWidth / 2;
      } else if (align === 'right') {
        xPosition = pageWidth - margin;
      }
      pdf.text(text, xPosition, yPosition, { align });
      yPosition += size * 1.3; // Adjust line height
      pdf.setFont(defaultFont, 'normal'); // Reset font weight
    };

    // --- Helper function to draw a line ---
    const drawLine = () => {
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 2;
    };

    // --- Title and Header ---
    addText('SHIVAAY WATER SUPPLY', 24, true, 'center');
    addText('Monthly Invoice', 16, false, 'center');
    yPosition += 10;
    addText(`Customer: ${customer.id}`, 12);
    yPosition += 5;
    addText(`Date: ${new Date().toLocaleDateString()}`, 12);
    drawLine();
    yPosition += 10;

    // --- Totals ---
    let totalAmountPaid = 0;
    let totalAmountDue = 0;
    customer.orders.forEach((order: any) => {
      totalAmountPaid += order.payment.amountPaid;
      totalAmountDue += order.payment.paymentRemaining;
    });

    addText(`Total Paid: rs. ${totalAmountPaid.toFixed(2)}`, 14, true, 'left');
    addText(`Total Due: rs. ${totalAmountDue.toFixed(2)}`, 14, true, 'left');
    yPosition += 10;

    // --- Table Header ---
    const tableHeaders = ['Order Date', 'Bottles', 'Rate', 'Status', 'Total to pay', 'Paid', 'Remaining'];
    const columnWidths = [30, 20, 20, 30, 25, 20, 20];
    let xOffset = margin;
    pdf.setFontSize(12);
    pdf.setFont(defaultFont, 'bold');
    tableHeaders.forEach((header, index) => {
      pdf.text(header, xOffset, yPosition);
      xOffset += columnWidths[index];
    });
    pdf.setFont(defaultFont, 'normal');
    yPosition += 5;
    drawLine();
    yPosition += 5;

    // --- Table Rows ---
    pdf.setFontSize(11);
    customer.orders.forEach((order: any) => {
      xOffset = margin;
      const rowData = [
        this.getDate(order.timestamp),
        order.noOfBottles.toString(),
        order.payment.perBottlePrice.toString(),
        order.status,
        order.payment.totalToPaid.toString(),
        `rs. ${order.payment.amountPaid.toFixed(2)}`,
        `rs. ${order.payment.paymentRemaining.toFixed(2)}`,
      ];
      rowData.forEach((data, index) => {
        pdf.text(data, xOffset, yPosition);
        xOffset += columnWidths[index];
      });
      yPosition += 6;

      // Check if a new page is needed
      if (yPosition > pageHeight - margin - 30) {
        pdf.addPage();
        yPosition = margin + 10; // Reset yPosition for the new page
        // Optionally redraw header on new page
        xOffset = margin;
        pdf.setFontSize(12);
        pdf.setFont(defaultFont, 'bold');
        tableHeaders.forEach((header, index) => {
          pdf.text(header, xOffset, yPosition);
          xOffset += columnWidths[index];
        });
        pdf.setFont(defaultFont, 'normal');
        yPosition += 5;
        drawLine();
        yPosition += 5;
        pdf.setFontSize(11);
      }
    });
    drawLine();
    yPosition += 10;

    // --- Footer ---
    // addText('Authorized Signature', 10, false, 'right');
    // addText('_________________________', 10, false, 'right');

    pdf.save(`invoice_${customer.id}.pdf`);
  }
}


onDateSelected(date: Date | null, customer: any): void {
  if (!date) {
    this.selectedOrders[customer.id] = [];
    this.selectedDate[customer.id] = null;
    return;
  }

  // Find orders that match the selected date
  const matchedOrders = customer.orders.filter((order: any) => {
    const orderDate = new Date(order.timestamp.seconds * 1000);
    return orderDate.toDateString() === date.toDateString();
  });

  this.selectedOrders[customer.id] = matchedOrders;
  this.selectedDate[customer.id] = date;
  console.log(this.selectedOrders[customer.id])

}

getDate(timestamp: any): string {
  if (!timestamp?.seconds) return 'N/A';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString(); // shows only date
}

getTime(timestamp: any): string {
  if (!timestamp?.seconds) return 'N/A';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString(); // shows only time
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

groupOrdersByMonth(orders: any[]) {
  return orders.reduce((acc, order) => {
    const date = new Date(order.timestamp.seconds * 1000);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    acc[key] = acc[key] || [];
    acc[key].push(order);
    return acc;
  }, {});
}

calculateInvoice(orders: any[]) {
  let totalBottles = 0;
  let totalPaid = 0;
  let totalDue = 0;

  orders.forEach(order => {
    totalBottles += order.noOfBottles || 0;
    totalPaid += order.payment?.amountPaid || 0;
    totalDue += order.payment?.totalToPaid || 0;
  });

  return {
    totalBottles,
    totalPaid,
    totalDue,
    balance: totalDue - totalPaid,
  };
}


ngOnDestroy(): void {
  
}
}
