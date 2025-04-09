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
import { Firestore, doc, setDoc, getDoc, collection, getDocs } from '@angular/fire/firestore';
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

  async addDeliveryMan(email: string, password: string, role: 'admin' | 'delivery',adminId:any) {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = userCredential?.user?.uid;
    const userDocRef = doc(this.firestore, `users/${adminId}/delivery-staff/${uid}`);
    const deliveryMan = { 
      email: email,
      role: role ,
      adminId : adminId,
      status: 'working'
      }
    await setDoc(userDocRef,deliveryMan);

    return userCredential;
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const uid = userCredential.user.uid;
  
    // Check if user is an admin
    const adminDocRef = doc(this.firestore, `users/${uid}`);
    const adminDoc = await getDoc(adminDocRef);
    if (adminDoc.exists()) {
      const adminData = adminDoc.data();
      if (adminData['role'] === 'admin') {
        return { user: userCredential.user, role: 'admin' };
      }
    }
  
    // If not admin, check if user is a delivery staff under any admin
    const usersCollection = collection(this.firestore, 'users');
    const usersSnapshot = await getDocs(usersCollection);
  
    for (const adminDoc of usersSnapshot.docs) {
      const deliveryDocRef = doc(this.firestore, `users/${adminDoc.id}/delivery-staff/${uid}`);
      const deliveryDoc = await getDoc(deliveryDocRef);
      if (deliveryDoc.exists()) {
        const deliveryData = deliveryDoc.data();
        return { user: userCredential.user, role: deliveryData['role'], adminId: deliveryData['adminId'] };
      }
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
    return localStorage.getItem('user') === 'true'; 
  }

  async logout() {
    return await signOut(this.auth);
  }
}
