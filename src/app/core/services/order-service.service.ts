import { inject, Injectable , OnInit } from '@angular/core';
import { UserService } from './user.service';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, concatAll ,firstValueFrom, from, MonoTypeOperatorFunction, Subject} from 'rxjs';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, onSnapshot, docData, getDoc, setDoc } from '@angular/fire/firestore';
import { Auth, Config, User } from '@angular/fire/auth';
import { serverTimestamp } from '@angular/fire/firestore';
import { deleteDoc, getDocs } from 'firebase/firestore';
import e from 'express';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceService implements OnInit {
  private firestore = inject(Firestore); 
  private ordersSubject = new BehaviorSubject<any[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(
   
    private userService: UserService
  ) { }

  userID:any

 async ngOnInit(): Promise<void> {
    // this.userService.user$.subscribe(async (user: User | null)=>{
    //   console.log(user)
    //   this.userID = user?.uid;
    //   this.listenToOrders();
    // })
    // const user = await this.userService.getCurrentUser()
    // if(user){
    //   this.userID = user?.uid;
    //   console.log(this.userID)
    //   this.listenToOrders(userID);
    // }
  }



  async addNewOrder(address: string, noOfBottles: number, urgencyFlag: string ,perBottlePrice:any ,totalToPaid:any ) {
    const user = await this.userService.getCurrentUser();
    this.userID = user?.uid;
    if (!this.userID) return;
  
    console.log(this.userID);
    
    const ordersRef = collection(this.firestore, `users/${this.userID}/all-orders`);

    const res = await addDoc(ordersRef, {
      address,
      noOfBottles,
      urgencyFlag,
      status: 'pending',
      payment:{
        done: 'not paid',
        mode:'offline',
        amountPaid:'0',
        totalToPaid:totalToPaid,
        perBottlePrice:perBottlePrice,
        dateOfPayment: serverTimestamp()
      },
    
      timestamp: serverTimestamp()
    });
  
    const orderId = res.id;
  
    const addressRef = doc(this.firestore, `users/${this.userID}/customers/${address}`);
  
    const addressSnap = await getDoc(addressRef);
    
    if (addressSnap.exists()) {
      const addressData = addressSnap.data();
      await updateDoc(addressRef, {
        orders: [...(addressData['orders'] || []), orderId],
        totalBottles: (addressData['totalBottles'] || 0) + noOfBottles,
        toReturn: (addressData['toReturn'] || 0) + noOfBottles,
        returned: addressData['returned'] || 0,

      });
    } else {
      // Create a new document
      await setDoc(addressRef, {
        orders: [orderId],
        totalBottles: noOfBottles,
        toReturn: noOfBottles,
        returned: 0
      });
    }
  
    this.listenToOrders(this.userID);
    return res;
  }

   listenToOrders(userID:any) {
    if (!userID) return;
    const ordersRef = collection(this.firestore, `users/${userID}/all-orders`);
  
    onSnapshot(ordersRef, (snapshot) => {
      const updatedOrders = snapshot.docs.map(doc => ({
        orderId: doc.id,
        ...doc.data()
      }));
      this.ordersSubject.next(updatedOrders);
    });
  }

  // async markDelivered(
  //   bottleReturned:any,
  //   selectedOrder:any,
  //   paymentStatus:any,
  //   paymentMode:any,
  //   amountPaid:any
  // ){

  //   const user = await this.userService.getCurrentUser();
  //   this.userID = user?.uid;
  //   if(!this.userID) return;
    
  //   console.log(this.userID);

  //   const ordersRef = doc(this.firestore, `users/${this.userID}/all-orders/${selectedOrder.orderId}`);
  //   const orderSnap = await getDoc(ordersRef);
  //   if (!orderSnap.exists()) {
  //     console.log("Order not found");
  //     return;
  //   }

  //   const orderData = orderSnap.data();
  //   await updateDoc(ordersRef, {
  //     status: "delivered",
  //     payment: {
  //       ...orderData['payment'],
  //       done: paymentStatus,
  //       mode: paymentMode,
  //       amountPaid: (orderData['payment'].amountPaid || 0) + amountPaid,
  //       dateOfPayment: serverTimestamp(),
  //     },
  //     bottleReturned:bottleReturned
  //   });

  //   const customersRef = doc(this.firestore, `users/${this.userID}/customers/${selectedOrder.address}`);
  //   const customerSnap = await getDoc(customersRef);
  //   if (!customerSnap.exists()) {
  //     console.log("no customer found") 
  //     return;
  //   }else{
  //     const customerData = customerSnap.data();
  //     const updatedTotalPaid = (customerData['totalPaid'] || 0) + amountPaid;
  //     const balanceDue = (customerData['totalToPaid'] || 0) - updatedTotalPaid;
  //     await updateDoc(customersRef, {
  //       returned: (customerData['returned'] || 0) + bottleReturned,
  //       toReturn: Math.max((customerData['toReturn'] || 0) - bottleReturned, 0),
  //       totalPaid: updatedTotalPaid,
  //       balanceDue: balanceDue,
  //     });
  //   }



  // }

  // async markDelivered(
  //   bottleReturned: any,
  //   selectedOrder: any,
  //   paymentStatus: any,
  //   paymentMode: any,
  //   amountPaid: any
  // ) {
  //   console.log(bottleReturned,selectedOrder,paymentStatus,paymentMode,amountPaid)
  //   const user = await this.userService.getCurrentUser();
  //   this.userID = user?.uid;
  //   if (!this.userID) return;
  
  //   console.log(this.userID);
  
  //   const ordersRef = doc(this.firestore, `users/${this.userID}/all-orders/${selectedOrder.orderId}`);
  //   const orderSnap = await getDoc(ordersRef);
  //   if (!orderSnap.exists()) {
  //     console.log("Order not found");
  //     return;
  //   }
  
  //   const orderData = orderSnap.data();
  //   console.log("$$$",orderData)
  //   // Ensure amountPaid is treated as a number
  //   const previousAmountPaid = orderData['payment']?.amountPaid || 0;
  //   console.log(previousAmountPaid)
  //   const newAmountPaid = Number(amountPaid);
  //   console.log(newAmountPaid)
  //   const totalToPay = orderData['totalToPaid'];
  //   console.log(totalToPay)
  //   const paymentRemaining = totalToPay - newAmountPaid;
  //   console.log(paymentRemaining)
  
    
  //   await updateDoc(ordersRef, {
  //     status: "delivered",
  //     payment: {
  //       ...orderData['payment'],
  //       done: paymentStatus,
  //       mode: paymentMode,
  //       amountPaid: previousAmountPaid + newAmountPaid,  // ✅ Ensuring proper numerical addition
  //       paymentRemaining:paymentRemaining,
  //       dateOfPayment: serverTimestamp(),
  //     },
  //     bottleReturned: Number(bottleReturned),  // ✅ Convert to number to prevent string storage
  //   });
  
  //   const customersRef = doc(this.firestore, `users/${this.userID}/customers/${selectedOrder.address}`);
  //   const customerSnap = await getDoc(customersRef);
  //   if (!customerSnap.exists()) {
  //     console.log("No customer found");
  //     return;
  //   } else {
  //     const customerData = customerSnap.data();
  
  //     // Convert existing values to numbers
  //     const previousTotalPaid = customerData['totalPaid'] || 0;
  //     console.log(previousTotalPaid)
  //     const previousTotalToPaid = customerData['totalToPaid'] || 0;
  //     console.log(previousTotalToPaid)
  //     const previousReturned = customerData['returned'] || 0;
  //     const previousToReturn = customerData['toReturn'] || 0;
      
  //     // Calculate updated values
  //     const updatedTotalPaid = previousTotalPaid + newAmountPaid;
  //     const balanceDue = previousTotalToPaid + paymentRemaining;
  
  //     await updateDoc(customersRef, {
  //       returned: previousReturned + Number(bottleReturned),
  //       toReturn: Math.max(previousToReturn - Number(bottleReturned), 0),
  //       totalPaid: updatedTotalPaid,  // ✅ Ensure correct numerical addition
  //       balanceDue: balanceDue,       // ✅ Ensure balance calculation is correct
  //     });
  //   }
  // }

  async clearAllOrders() {
    const user = await this.userService.getCurrentUser();
    if (!user?.uid) return;
  
    // const ordersRef = collection(this.firestore, `users/${user.uid}/all-orders`);
    const ordersRef = collection(this.firestore, `users/${user.uid}/customers`);
    const snapshot = await getDocs(ordersRef);
  
    const deletePromises = snapshot.docs.map(docSnap =>
      deleteDoc(doc(this.firestore, `users/${user.uid}/all-orders/${docSnap.id}`))
    );
  
    await Promise.all(deletePromises);
    console.log('All orders deleted successfully.');
  }

  async markDelivered(
    adminUid:any,
    bottleReturned: number,
    selectedOrder: any,
    paymentStatus: string,
    paymentMode: string,
    amountPaid: number
  ) {
    const user = await this.userService.getCurrentUser();
    if (!user?.uid || !selectedOrder?.orderId) {
      console.log("Missing user ID or order ID");
      return;
    }
  
    this.userID = adminUid;
  
    const orderRef = doc(this.firestore, `users/${this.userID}/all-orders/${selectedOrder.orderId}`);
    const orderSnap = await getDoc(orderRef);
  
    if (!orderSnap.exists()) {
      console.log("Order not found");
      return;
    }
  
    const orderData = orderSnap.data();
    console.log("orderData",orderData)
    const previousAmountPaid = Number(orderData?.['payment']?.amountPaid);
    console.log("previousAmountPaid",previousAmountPaid)
    const newAmountPaid = Number(amountPaid);
    console.log("newAmountPaid",newAmountPaid)
    const totalToPay = Number(orderData?.['payment']?.totalToPaid);
    console.log("totalToPay",totalToPay)
    const updatedAmountPaid = previousAmountPaid + newAmountPaid;
    const paymentRemaining = totalToPay - updatedAmountPaid 
    console.log(paymentRemaining)
    await updateDoc(orderRef, {
      status: "delivered",
      payment: {
        ...(orderData?.['payment'] || {}),
        done: paymentStatus,
        mode: paymentMode,
        amountPaid: updatedAmountPaid,
        paymentRemaining: paymentRemaining,
        dateOfPayment: serverTimestamp(),
      },
      deliveryDate: serverTimestamp(),
      bottleReturned: Number(bottleReturned),
    });
  
    const customerRef = doc(this.firestore, `users/${this.userID}/customers/${selectedOrder.address}`);
    const customerSnap = await getDoc(customerRef);
  
    if (!customerSnap.exists()) {
      console.log("Customer not found");
      return;
    }
  
    const customerData = customerSnap.data();
  
    const previousTotalPaid = Number(customerData?.['totalPaid'] || 0);
    const previousTotalToPaid = Number(customerData?.['balanceDue'] || 0);
    const previousReturned = Number(customerData?.['returned'] || 0);
    const previousToReturn = Number(customerData?.['toReturn'] || 0);
  
    const updatedTotalPaid = previousTotalPaid + newAmountPaid;
    const updatedToReturn = Math.max(previousToReturn - Number(bottleReturned), 0);
    const updatedBalanceDue = previousTotalToPaid + paymentRemaining;
  
    await updateDoc(customerRef, {
      returned: previousReturned + Number(bottleReturned),
      toReturn: updatedToReturn,
      totalPaid: updatedTotalPaid,
      balanceDue: updatedBalanceDue,
    });
  
    console.log("Delivery and payment details updated successfully.");
  }
  
async markOnlyCompleted(orderId:any){
    const user = await this.userService.getCurrentUser();
    if (!user?.uid) return; 
    this.userID = user.uid;
    const orderRef = doc(this.firestore, `users/${this.userID}/all-orders/${orderId}`);
    await updateDoc(orderRef,{status:'completed'})
  }

  async saveBuildingNames(buildingNames: string[]) {
    const user = await this.userService.getCurrentUser();
    if (!user?.uid) return;
    
    for (const name of buildingNames) {
      const trimmedName = name.trim();
      if (trimmedName) {
        const docRef = doc(this.firestore, `users/${user.uid}/buildings/${trimmedName}`);
        
        // await setDoc(docRef, { buildingName: trimmedName }); // Optional field
        await setDoc(docRef, {}); 
        // this.getAllBuildings();
      }
    }
  }
  

  getAllBuildings(): Observable<string[]> {
    return from(
      (async () => {
        const user = await this.userService.getCurrentUser();
        if (!user?.uid) return [];
  
        const buildingsRef = collection(this.firestore, `users/${user.uid}/buildings`);
        const snapshot = await getDocs(buildingsRef);
        return snapshot.docs.map(doc => doc.id); // doc.id is the building name
      })()
    );
  }
  
  

  async markOrderAsCompleted(
    bottleReturned: number,
    selectedOrder: any,
    paymentStatus: string,
    paymentMode: string,
    amountPaid: number
    ) {
      const user = await this.userService.getCurrentUser();
      if (!user?.uid || !selectedOrder?.orderId) {
        console.log("Missing user ID or order ID");
        return;
      }

      this.userID = user.uid;
      const orderRef = doc(this.firestore, `users/${this.userID}/all-orders/${selectedOrder.orderId}`);
      const orderSnap = await getDoc(orderRef);

      if (!orderSnap.exists()) {
        console.log("Order not found");
        return;
      }

      const orderData = orderSnap.data();
      console.log("orderData",orderData)
      const previousAmountPaid = Number(orderData?.['payment']?.amountPaid);
      console.log("previousAmountPaid",previousAmountPaid)
      const newAmountPaid = Number(amountPaid);
      console.log("newAmountPaid",newAmountPaid)
      const totalToPay = Number(orderData?.['payment']?.totalToPaid);
      console.log("totalToPay",totalToPay)
      const updatedAmountPaid = previousAmountPaid + newAmountPaid;
      const paymentRemaining = totalToPay - updatedAmountPaid 
      console.log(paymentRemaining)
      await updateDoc(orderRef, {
        status: "completed",
        payment: {
          ...(orderData?.['payment'] || {}),
          done: paymentStatus,
          mode: paymentMode,
          amountPaid: updatedAmountPaid,
          paymentRemaining: paymentRemaining,
          dateOfPayment: serverTimestamp(),
        },
        bottleReturned: Number(bottleReturned),
      });

      const customerRef = doc(this.firestore, `users/${this.userID}/customers/${selectedOrder.address}`);
      const customerSnap = await getDoc(customerRef);
    
      if (!customerSnap.exists()) {
        console.log("Customer not found");
        return;
      }

      const customerData = customerSnap.data();
  
      const previousTotalPaid = Number(customerData?.['totalPaid'] || 0);
      const previousTotalToPaid = Number(customerData?.['balanceDue'] || 0);
      const previousReturned = Number(customerData?.['returned'] || 0);
      const previousToReturn = Number(customerData?.['toReturn'] || 0);
    
      const updatedTotalPaid = previousTotalPaid + newAmountPaid;
      const updatedToReturn = Math.max(previousToReturn - Number(bottleReturned), 0);
      const updatedBalanceDue = previousTotalToPaid + paymentRemaining;
    
      await updateDoc(customerRef, {
        returned: previousReturned + Number(bottleReturned),
        toReturn: updatedToReturn,
        totalPaid: updatedTotalPaid,
        balanceDue: updatedBalanceDue,
      });

    console.log("Delivery and payment details updated successfully.");

  }

  getAllCustomersWithOrderDetails(): Observable<any[]> {
    return new Observable(observer => {
      this.userService.getCurrentUser().then(user => {
        if (!user?.uid) {
          observer.next([]);
          observer.complete();
          return;
        }
  
        const customersRef = collection(this.firestore, `users/${user.uid}/customers`);
  
        const unsubscribe = onSnapshot(customersRef, async snapshot => {
          const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log(customers);
          const formattedCustomers = await Promise.all(
            customers.map(async (customer: any) => {
              console.log(customer.orders)
              let typeOfCustomer:any;
              const orders = await this.getOrdersByIds(user.uid, customer.orders || []);
              if(customer.typeOfCustomer){
                typeOfCustomer = customer.typeOfCustomer;
              }else{
                typeOfCustomer = false;
              }
              return {
                id: customer.id,
                totalBottles: customer.totalBottles || 0,
                totalPaid: customer.totalPaid || 0,
                balanceDue: customer.balanceDue || 0,
                returned: customer.returned || 0,
                toReturn: customer.toReturn || 0,
                typeOfCustomer: typeOfCustomer,
                orders, // the full order documents
              };
            })
          );
          console.log('Formatted customers:', formattedCustomers);
          observer.next(formattedCustomers);
        });
  
        return () => unsubscribe();
      });
    });
  }

 async getOrdersByIds(userId: string, orderIds: string[]): Promise<any[]> {
    return Promise.all(
      orderIds.map(async (orderId: string) => {
        const orderRef = doc(this.firestore, `users/${userId}/all-orders/${orderId}`);
        const orderSnap = await getDoc(orderRef);
        return orderSnap.exists() ? { id: orderSnap.id, ...orderSnap.data() } : null;
      })
    ).then(orders => orders.filter(order => order !== null));
  }

async updateCustomerDetails(customerId:any, customerName:any, phoneNumber:any, typeOfCustomer:any) {
    const user = await this.userService.getCurrentUser();
    if (!user?.uid) return;
    const customerRef = doc(this.firestore, `users/${user.uid}/customers/${customerId}`);
    return updateDoc(customerRef, {
      name: customerName,
      phoneNumber: phoneNumber,
      typeOfCustomer: typeOfCustomer
    });

  }

  async deleteOrder(orderId: any, address: any, order: any) {
    const user = await this.userService.getCurrentUser();
    if (!user?.uid) return;
  
    const orderRef = doc(this.firestore, `users/${user.uid}/all-orders/${orderId}`);
    await deleteDoc(orderRef);
  
    const customerRef = doc(this.firestore, `users/${user.uid}/customers/${address}`);
    const customerSnap = await getDoc(customerRef);
  
    if (customerSnap.exists()) {
      const customerData = customerSnap.data();
      const customerOrders = customerData['orders'] || [];
  
      console.log("Before deletion, orders array:", customerOrders);
  
      // Check if each item is an object with an `id` field
      const updatedOrders = customerOrders.filter((orderObj: any) => {
        if (typeof orderObj === 'string') {
          return orderObj !== orderId;
        } else if (orderObj?.id) {
          return orderObj.id !== orderId;
        }
        return true; // if structure doesn't match, keep the entry to avoid accidental deletion
      });
  
      console.log("After deletion, updated orders array:", updatedOrders);
  
      await updateDoc(customerRef, {
        orders: updatedOrders,
        totalBottles: (customerData['totalBottles'] || 0) - (order?.noOfBottles || 0),
        toReturn: (customerData['toReturn'] || 0) - ((order?.noOfBottles || 0) - (order?.bottleReturned || 0)),
        returned: (customerData['returned'] || 0) - (order?.bottleReturned || 0),
        totalPaid: (customerData['totalPaid'] || 0) - (order?.payment?.amountPaid || 0),
        balanceDue: (customerData['balanceDue'] || 0) - (order?.payment?.paymentRemaining || 0),
      });
    }
  }
  
  
}
