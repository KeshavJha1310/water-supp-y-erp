import { inject, Injectable , OnInit } from '@angular/core';
import { UserService } from './user.service';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, concatAll ,firstValueFrom, MonoTypeOperatorFunction, Subject} from 'rxjs';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { Auth, Config, User } from '@angular/fire/auth';

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


  async addNewOrder(address: string,noOfBottles:any, urgencyFlag: string) {
    const user = await this.userService.getCurrentUser()
    this.userID = user?.uid;
    console.log(this.userID)
    const ordersRef = collection(this.firestore, `users/${this.userID}/all-orders`);
   const res = await addDoc(ordersRef, {
      address,
      noOfBottles,
      urgencyFlag,
      status: 'pending',
      timestamp: new Date().toISOString()
    });
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
      console.log(updatedOrders)
      this.ordersSubject.next(updatedOrders);
    });
  }

  async markOrderAsCompleted(orderId: string) {
    if (!this.userID) return;

    const orderDoc = doc(this.firestore, `users/${this.userID}/all-orders/${orderId}`);
    await updateDoc(orderDoc, { status: 'completed' });
  }
  
}
