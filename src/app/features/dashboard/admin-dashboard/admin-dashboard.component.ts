import { Component , OnInit , OnDestroy , ViewChild, HostListener } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-admin-dashboard',
  standalone:false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit,OnDestroy{

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  selectedComponent = 'orders';
  isMenuOpen :boolean=true;
  isMobile = window.innerWidth < 768;

  ngOnInit(): void {

  
  }
  
  loadComponent(componentName: string) {
    this.selectedComponent = componentName;
    if (window.innerWidth <= 768) {
      this.sidenav.close();
      this.isMenuOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = event.target.innerWidth < 768;
    this.isMenuOpen = !this.isMobile;
  }

  toggleMenuAndCloseIcon() {
    this.isMenuOpen = !this.isMenuOpen;
    this.sidenav.toggle();
  }

  ngOnDestroy(): void {

  }

}
