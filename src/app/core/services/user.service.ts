import { Injectable , OnInit , inject } from '@angular/core';
import { Auth, User , user , authState} from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {

  constructor(private firestore: Firestore) {}
  private auth: Auth =inject(Auth);

    private backSubject = new BehaviorSubject<boolean>(false);
    back$ = this.backSubject.asObservable();
  
  ngOnInit(): void {
    
  }
  user$ = user(this.auth);
  authState$ = authState(this.auth);

  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe(); 
        resolve(user);
      });
    });
  }

  setBack(flag:boolean){
    this.backSubject.next(flag);
  }

  async getUserData(): Promise<any> {
    const user = await this.getCurrentUser();
    if (user) {
      // Check for admin document
      const adminDocRef = doc(this.firestore, `users/${user.uid}`);
      const adminDoc = await getDoc(adminDocRef);
      if (adminDoc.exists()) {
        return adminDoc.data();
      }
  
      // If not admin, check all admins for delivery user
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      for (const adminDoc of usersSnapshot.docs) {
        const deliveryDocRef = doc(this.firestore, `users/${adminDoc.id}/delivery-staff/${user.uid}`);
        const deliveryDoc = await getDoc(deliveryDocRef);
        if (deliveryDoc.exists()) {
          return deliveryDoc.data();
        }
      }
    }
    return null;
  }
  
  
}
