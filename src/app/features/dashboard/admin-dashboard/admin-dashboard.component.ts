import { Component , OnInit , OnDestroy } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone:false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit,OnDestroy{

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  selectedComponent = 'orders';

  ngOnInit(): void {

  }
  
  loadComponent(componentName: string) {
    this.selectedComponent = componentName;
  }

  ngOnDestroy(): void {

  }

}
