import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  standalone:false,
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, OnDestroy {

  signInForm!: FormGroup;
  hidePassword: boolean = true;
  loading: boolean = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar, 
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async addDeliveryMan() {
    if (this.signInForm.invalid) return;
    
    this.loading = true;  
    const { email, password } = this.signInForm.value;

    try {
      await this.authService.addDeliveryMan(email, password, 'admin');
      this.snackBar.open('Delivery Man added successfully!', 'OK', { duration: 3000 }); 
      this.router.navigate(['/login']); 
    } catch (error) {
      console.error("Error:", error);
      this.snackBar.open('Failed to add Delivery Man', 'OK', { duration: 3000 }); // ✅ Show error message
    } finally {
      this.loading = false; 
    }
  }

  ngOnDestroy(): void {}
}
