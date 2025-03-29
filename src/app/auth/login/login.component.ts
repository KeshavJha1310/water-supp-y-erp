import { Component, OnInit , OnDestroy } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone:false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit ,OnDestroy {

  loginForm: FormGroup|undefined;
  hidePassword:boolean= true;
  loading: boolean = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar, 
  ) {
  }

  ngOnInit():void{
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
 
  async login() {
    if (this.loginForm?.valid) {
      this.loading = true;
      const { email, password } = this.loginForm.value;
      try {
        const { role } = await this.authService.login(email, password);
        console.log(role)
        this.snackBar.open('Logged-in successfully!', 'OK', { duration: 3000 }); 
        if (role === 'admin') {
          this.router.navigate(['']); 
        } else {
          this.router.navigate(['']); 
        }
      } catch (error) {
        console.error(error);

      }finally{
        this.loading = false;
      }
    }
  }

  ngOnDestroy(): void {

  }

}
