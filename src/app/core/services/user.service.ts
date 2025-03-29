import { Injectable , OnInit , inject } from '@angular/core';
import { Auth, User , user , authState} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnInit {

  constructor(private firestore: Firestore) {}
  private auth: Auth =inject(Auth);
  
  ngOnInit(): void {
    
  }
  user$ = user(this.auth);
  authState$ = authState(this.auth);

  getCurrentUser(): Promise<User | null> {
    return Promise.resolve(this.auth.currentUser);
  }

  async getUserData(): Promise<any> {
    const user = await this.getCurrentUser();
    if (user) {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data() : null;
    }
    return null;
  }
  
}
