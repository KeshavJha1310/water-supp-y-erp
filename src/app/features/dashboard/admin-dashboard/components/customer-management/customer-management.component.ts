import { Component,OnInit,OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { OrderServiceService } from '../../../../../core/services/order-service.service';
import { MatDialog } from '@angular/material/dialog';
import { EditCustomerModelComponent } from './edit-customer-model/edit-customer-model.component';
import { UserService } from '../../../../../core/services/user.service';
import jsPDF from 'jspdf';



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
    this.allCustomers = data;
  
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
      (customer: any) => customer.typeOfCustomer !== 'daily' && customer.typeOfCustomer !== 'monthly'
    );
  
    console.log('Daily:', this.dailyCustomers);
    console.log('Monthly:', this.monthlyCustomers);
    console.log('Others:', this.allCustomers);
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

// generateInvoice(customerId: any): void {
//   const customer = this.monthlyCustomers.find((c: any) => c.id === customerId.id);

//   if (customer && customer.orders?.length > 0) {
//     const invoiceSection = document.getElementById('invoice-section');

//     if (invoiceSection) {
//       let totalAmountPaid = 0;
//       let totalAmountDue = 0;

//       customer.orders.forEach((order: any) => {
//         totalAmountPaid += order.payment.amountPaid;
//         totalAmountDue += order.payment.paymentRemaining;
//       });

//       // Clear previous content
//       invoiceSection.innerHTML = '';

//       // Build invoice content as DOM instead of innerHTML (safer for rendering)
//       const container = document.createElement('div');
//       container.style.padding = '20px';
//       container.style.fontFamily = 'Arial';

//       container.innerHTML = `
//       <style>
//         .invoice-container {
//           font-family: 'Arial', sans-serif;
//           color: #333;
//           padding: 20px;
//         }
//         .invoice-header {
//           text-align: center;
//           border-bottom: 2px solid #000;
//           margin-bottom: 20px;
//         }
//         .invoice-header h1 {
//           margin: 0;
//           font-size: 24px;
//           text-transform: uppercase;
//         }
//         .invoice-info {
//           margin-bottom: 20px;
//           font-size: 14px;
//         }
//         .totals {
//           margin-bottom: 20px;
//           font-size: 15px;
//           font-weight: bold;
//         }
//         table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 13px;
//         }
//         th, td {
//           border: 1px solid #aaa;
//           padding: 8px;
//           text-align: center;
//         }
//         th {
//           background-color: #f4f4f4;
//         }
//         tr:nth-child(even) {
//           background-color: #f9f9f9;
//         }
//         .footer {
//           margin-top: 30px;
//           text-align: right;
//           font-size: 13px;
//           font-style: italic;
//         }
//       </style>
    
//       <div class="invoice-container">
//         <div class="invoice-header">
//           <h1>Super Bottles - Monthly Invoice</h1>
//           <p>Customer ID: <strong>${customer.id}</strong></p>
//         </div>
    
//         <div class="invoice-info">
//           <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
//         </div>
    
//         <div class="totals">
//           <p>Total Paid: ₹${totalAmountPaid.toFixed(2)}</p>
//           <p>Total Due: ₹${totalAmountDue.toFixed(2)}</p>
//         </div>
    
//         <table>
//           <thead>
//             <tr>
//               <th>Order Date</th>
//               <th>Bottles Ordered</th>
//               <th>Status</th>
//               <th>Amount Paid</th>
//               <th>Remaining Payment</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${customer.orders.map((order: any) => `
//               <tr>
//                 <td>${this.getDate(order.timestamp)}</td>
//                 <td>${order.noOfBottles}</td>
//                 <td>${order.status}</td>
//                 <td>₹${order.payment.amountPaid}</td>
//                 <td>₹${order.payment.paymentRemaining}</td>
//               </tr>
//             `).join('')}
//           </tbody>
//         </table>
    
//         <div class="footer">
//           <p>Authorized Signature</p>
//           <p>_________________________</p>
//         </div>
//       </div>
//     `;

//       invoiceSection.appendChild(container);

//       // Give time for rendering and style application
//       setTimeout(() => {
//         html2canvas(invoiceSection, {
//           scale: 2, // Higher quality
//           useCORS: true,
//           allowTaint: false
//         }).then((canvas) => {
//           const imgData = canvas.toDataURL('image/png');
//           const pdf = new jsPDF('p', 'mm', 'a4');
//           const pdfWidth = pdf.internal.pageSize.getWidth();
//           const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

//           pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//           pdf.save(`invoice_${customer.id}.pdf`);
//         }).catch((err) => {
//           console.error('❌ html2canvas failed:', err);
//         });
//       }, 300);
//     }
//   }
// }


// generateInvoice(customerId: any): void {
//   const customer = this.monthlyCustomers.find((c: any) => c.id === customerId.id);

//   if (customer && customer.orders?.length > 0) {
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();
//     const margin = 15;
//     let yPosition = margin;

//     // --- Helper function to add text ---
//     const addText = (text: string, size: number, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
//       pdf.setFontSize(size);
//       if (isBold) {
//         pdf.setFont('helvetica', 'bold');
//       } else {
//         pdf.setFont('helvetica', 'normal');
//       }
//       let xPosition = margin;
//       if (align === 'center') {
//         xPosition = pageWidth / 2;
//       } else if (align === 'right') {
//         xPosition = pageWidth - margin;
//       }
//       pdf.text(text, xPosition, yPosition, { align });
//       yPosition += size * 1.3; // Adjust line height
//       pdf.setFont('helvetica', 'normal'); // Reset font weight
//     };

//     // --- Helper function to draw a line ---
//     const drawLine = () => {
//       pdf.line(margin, yPosition, pageWidth - margin, yPosition);
//       yPosition += 2;
//     };

//     // --- Title and Header ---
//     addText('SHIVAAY WATER SUPPLY', 24, true, 'center');
//     addText('Monthly Invoice', 16, false, 'center');
//     yPosition += 10;
//     addText(`Customer ID: ${customer.id}`, 12);
//     yPosition += 5;
//     addText(`Date: ${new Date().toLocaleDateString()}`, 12);
//     drawLine();
//     yPosition += 10;

//     // --- Totals ---
//     let totalAmountPaid = 0;
//     let totalAmountDue = 0;
//     customer.orders.forEach((order: any) => {
//       console.log(order.payment)
//       console.log(order)
//       totalAmountPaid += order.payment.amountPaid;
//       totalAmountDue += order.payment.paymentRemaining;
//     });

//     addText(`Total Paid: ₹${totalAmountPaid.toFixed(2)}`, 14, true, 'left');
//     addText(`Total Due: ₹${totalAmountDue.toFixed(2)}`, 14, true, 'left');
//     yPosition += 10;

//     // --- Table Header ---
//     const tableHeaders = ['Order Date', 'Bottles','Rate' ,'Status', 'Total to pay' ,'Paid', 'Remaining'];
//     const columnWidths = [30, 25,25, 30,30, 25, 25];
//     let xOffset = margin;
//     pdf.setFontSize(12);
//     pdf.setFont('helvetica', 'bold');
//     tableHeaders.forEach((header, index) => {
//       pdf.text(header, xOffset, yPosition);
//       xOffset += columnWidths[index];
//     });
//     pdf.setFont('helvetica', 'normal');
//     yPosition += 5;
//     drawLine();
//     yPosition += 5;

//     // --- Table Rows ---
//     pdf.setFontSize(11);
//     customer.orders.forEach((order:   any) => {
//       xOffset = margin;
//       const rowData = [
//         this.getDate(order.timestamp),
//         order.noOfBottles.toString(),
//         order.payment.perBottlePrice.toString(),
//         order.status,
//         order.payment.totalToPaid.toString(),
//         `₹${order.payment.amountPaid.toFixed(2)}`,
//         `₹${order.payment.paymentRemaining.toFixed(2)}`,
//       ];
//       rowData.forEach((data, index) => {
//         pdf.text(data, xOffset, yPosition);
//         xOffset += columnWidths[index];
//       });
//       yPosition += 6;

//       // Check if a new page is needed
//       if (yPosition > pageHeight - margin - 30) {
//         pdf.addPage();
//         yPosition = margin + 10; // Reset yPosition for the new page
//         // Optionally redraw header on new page
//         xOffset = margin;
//         pdf.setFontSize(12);
//         pdf.setFont('helvetica', 'bold');
//         tableHeaders.forEach((header, index) => {
//           pdf.text(header, xOffset, yPosition);
//           xOffset += columnWidths[index];
//         });
//         pdf.setFont('helvetica', 'normal');
//         yPosition += 5;
//         drawLine();
//         yPosition += 5;
//         pdf.setFontSize(11);
//       }
//     });
//     drawLine();
//     yPosition += 10;

//     // --- Footer ---
//     addText('Authorized Signature', 10, false, 'right');
//     addText('_________________________', 10, false, 'right');

//     pdf.save(`invoice_${customer.id}.pdf`);
//   }
// }


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

    addText(`Total Paid: ₹${totalAmountPaid.toFixed(2)}`, 14, true, 'left');
    addText(`Total Due: ₹${totalAmountDue.toFixed(2)}`, 14, true, 'left');
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
        `₹${order.payment.amountPaid.toFixed(2)}`,
        `₹${order.payment.paymentRemaining.toFixed(2)}`,
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
