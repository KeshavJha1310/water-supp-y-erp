import { Injectable , OnInit } from '@angular/core';
import { UserService } from './user.service';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, concatAll ,firstValueFrom, MonoTypeOperatorFunction, Subject} from 'rxjs';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { Auth, Config, User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class OrderServiceService implements OnInit {

  private ordersSubject = new BehaviorSubject<any[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private userService: UserService
  ) { }

  userID:any

  ngOnInit(): void {
    this.userService.authState$.subscribe(async (user: User | null)=>{
      console.log(user)
      this.userID = user?.uid;
      this.listenToOrders();
    })
  }


  async addNewOrder(address: string,noOfBottles:any, urgencyFlag: string) {
    if (!this.userID) {
      console.error("User ID not found");
      return;
    }

    const ordersRef = collection(this.firestore, `users/${this.userID}/all-orders`);
   const res = await addDoc(ordersRef, {
      address,
      noOfBottles,
      urgencyFlag,
      status: 'pending',
      timestamp: new Date().toISOString()
    });

    return res;
  }

  private listenToOrders() {
    if (!this.userID) return;
  
    const ordersRef = collection(this.firestore, `users/${this.userID}/all-orders`);
  
    onSnapshot(ordersRef, (snapshot) => {
      const updatedOrders = snapshot.docs.map(doc => ({
        orderId: doc.id,
        ...doc.data()
      }));
      this.ordersSubject.next(updatedOrders);
    });
  }

  async markOrderAsCompleted(orderId: string) {
    if (!this.userID) return;

    const orderDoc = doc(this.firestore, `users/${this.userID}/all-orders/${orderId}`);
    await updateDoc(orderDoc, { status: 'completed' });
  }
  
}
