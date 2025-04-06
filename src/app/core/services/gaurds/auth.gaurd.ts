import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../user.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc, getDocs } from '@angular/fire/firestore';
import { AuthService } from '../../../auth/auth.service';
@Injectable({
    providedIn: 'root',
  })

  export class AuthGuard implements CanActivate {
    constructor(
        private auth: Auth, 
        private userService:UserService,
        private firestore: Firestore,
        private router: Router,
        private authService:AuthService
    ){}
    async canActivate():Promise<boolean>{
        return new Promise((resolve) => {
          onAuthStateChanged(this.auth, async (user) => {
            console.log("@@@@ :- ", user);
            if (!user) {
              this.router.navigate(['/login']);
              resolve(false);
              return;
            }
          
            const uid = user.uid;
          
            // Check if user is an admin
            const userDocRef = doc(this.firestore, `users/${uid}`);
            const userDoc = await getDoc(userDocRef);
          
            if (userDoc.exists()) {
              resolve(true);
              return;
            }
          
            // Check if user is a delivery staff under any admin
            const usersCollection = collection(this.firestore, 'users');
            const usersSnapshot = await getDocs(usersCollection);
          
            for (const adminDoc of usersSnapshot.docs) {
              console.log("9999:-",adminDoc.id)
              const deliveryDocRef = doc(this.firestore, `users/${adminDoc.id}/delivery-staff/${uid}`);
              const deliveryDoc = await getDoc(deliveryDocRef);
              if (deliveryDoc.exists()) {
                resolve(true);
                return;
              }
            }
          
            // If not found in either, redirect to login
            this.router.navigate(['/login']);
            resolve(false);
          });
          
          });
    }
}