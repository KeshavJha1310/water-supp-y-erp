import { Injectable } from '@angular/core';
import { Auth, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private auth: Auth, private firestore: Firestore) {}

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
