import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../user.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
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
              if (!user) {
                this.router.navigate(['/login']);
                resolve(false);
                return;
              }
      
              const userDocRef = doc(this.firestore, `users/${user.uid}`);
              const userDoc = await getDoc(userDocRef);
      
              if (userDoc.exists()) {
                resolve(true);
              } else {
                this.router.navigate(['/login']);
                resolve(false);
              }
            });
          });
    }
}