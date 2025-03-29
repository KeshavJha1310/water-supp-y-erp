import { Injectable ,OnInit} from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  User,
  UserCredential
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
   
  }
  ngOnInit(): void {
    this.setAuthPersistence();
  }

  async setAuthPersistence() {
    await setPersistence(this.auth, browserLocalPersistence);
  }

  async addDeliveryMan(email: string, password: string, role: 'admin' | 'delivery') {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const userDocRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    await setDoc(userDocRef, { email, role });

    return userCredential;
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const userDocRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { user: userCredential.user, role: userData['role'] }; // ✅ Return role
    }

    throw new Error('User role not found');
  }

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, user => {
        if (user) {
          localStorage.setItem('user', 'true');
        } else {
          localStorage.removeItem('user');
        }
        resolve(user);
      }, reject);
    });
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('user') === 'true'; // ✅ Read login state from storage
  }

  async logout() {
    return await signOut(this.auth);
  }
}
